import { useState, useEffect, useCallback } from 'react'
import {
  getSessions,
  getSession,
  createSession,
  deleteSession as deleteSessionApi,
  chat
} from '../services/aiService'

export default function useJarvisChat() {
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [attachedResource, setAttachedResource] = useState(null)

  // Fetch all sessions
  const fetchSessions = useCallback(async () => {
    try {
      const res = await getSessions()
      setSessions(res.data.data)
    } catch (err) {
      setError(err.message || 'Failed to load chat history')
    }
  }, [])

  // Load a session's messages
  const loadSession = useCallback(async (sessionId) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getSession(sessionId)
      const sessionData = res.data.data
      setActiveSession(sessionData)
      setMessages(sessionData.messages || [])
      setAttachedResource(sessionData.resourceId || null)
    } catch (err) {
      setError(err.message || 'Failed to load chat session')
    } finally {
      setLoading(false)
    }
  }, [])

  // Start new session
  const startNewSession = useCallback(async (title = 'New Chat', resourceId = null) => {
    setLoading(true)
    setError(null)
    try {
      const res = await createSession(title, resourceId)
      const newSess = res.data.data
      setSessions(prev => [newSess, ...prev])
      setActiveSession(newSess)
      setMessages([])
      setAttachedResource(resourceId)
      return newSess
    } catch (err) {
      setError(err.message || 'Failed to start new chat')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete session
  const deleteSession = useCallback(async (sessionId) => {
    try {
      await deleteSessionApi(sessionId)
      setSessions(prev => prev.filter(s => s._id !== sessionId))
      if (activeSession?._id === sessionId) {
        setActiveSession(null)
        setMessages([])
        setAttachedResource(null)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete session')
    }
  }, [activeSession])

  // Send message
  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return

    setLoading(true)
    setError(null)

    // Optimistically add user message
    const tempUserMsg = { role: 'user', content, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const sessionId = activeSession?._id
      const res = await chat(sessionId, content, attachedResource?._id || attachedResource)
      const updatedSession = res.data.data

      // If this was a new session (the backend generated it) or existing one
      setMessages(updatedSession.messages)
      
      if (!sessionId) {
        // If we didn't have a session ID, we just created a new session
        setActiveSession(updatedSession)
        setSessions(prev => [updatedSession, ...prev])
      } else {
        // Update session listing with new title/updatedAt
        setSessions(prev =>
          prev.map(s => (s._id === updatedSession._id ? updatedSession : s))
        )
        // Ensure activeSession metadata is synchronized
        setActiveSession(updatedSession)
      }
    } catch (err) {
      setError(err.message || 'Failed to get response from Jarvis')
      // Remove optimistic message if backend failed
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }, [activeSession, attachedResource])

  // Initial load
  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return {
    sessions,
    activeSession,
    messages,
    loading,
    error,
    attachedResource,
    setAttachedResource,
    fetchSessions,
    loadSession,
    startNewSession,
    deleteSession,
    sendMessage
  }
}
