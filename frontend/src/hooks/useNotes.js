import { useState, useEffect, useCallback, useRef } from 'react'
import * as noteService from '../services/noteService'

export default function useNotes() {
  const [notes, setNotes] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 12 })
  const [stats, setStats] = useState({ totalNotes: 0, pinnedNotes: 0, archivedNotes: 0, totalTags: 0 })
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [showArchived, setShowArchived] = useState(false)
  const [page, setPage] = useState(1)

  // Request ID tracking to prevent race conditions from stale network responses
  const fetchRequestCountRef = useRef(0)

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setPage(1)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [selectedTag, showArchived])

  // Fetch stats and tags
  const fetchStatsAndTags = useCallback(async () => {
    setStatsLoading(true)
    try {
      const [statsRes, tagsRes] = await Promise.all([
        noteService.getNoteStats(),
        noteService.getTags()
      ])
      setStats(statsRes.data.data)
      setTags(tagsRes.data.data.tags)
    } catch (err) {
      console.error('Error fetching stats and tags:', err)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Fetch notes main function with request count comparison to ignore stale callbacks
  const fetchNotes = useCallback(async () => {
    const currentRequestId = ++fetchRequestCountRef.current
    setLoading(true)
    setError(null)
    try {
      const params = {
        page,
        limit: 12,
        archived: showArchived,
      }
      if (debouncedSearchQuery) params.search = debouncedSearchQuery
      if (selectedTag) params.tag = selectedTag

      const res = await noteService.getNotes(params)
      
      // Update state only if this is the most recent request triggered
      if (currentRequestId === fetchRequestCountRef.current) {
        setNotes(res.data.data.notes)
        setPagination(res.data.data.pagination)
      }
    } catch (err) {
      if (currentRequestId === fetchRequestCountRef.current) {
        setError(err.message || 'Failed to fetch notes')
      }
    } finally {
      if (currentRequestId === fetchRequestCountRef.current) {
        setLoading(false)
      }
    }
  }, [page, debouncedSearchQuery, selectedTag, showArchived])

  // Trigger main fetch notes on query changes
  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  // Also load stats/tags initially
  useEffect(() => {
    fetchStatsAndTags()
  }, [fetchStatsAndTags])

  // Create
  const handleCreateNote = async (noteData) => {
    setSubmitting(true)
    setError(null)
    try {
      await noteService.createNote(noteData)
      await Promise.all([fetchNotes(), fetchStatsAndTags()])
    } catch (err) {
      setError(err.message || 'Failed to create note')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  // Update
  const handleUpdateNote = async (id, noteData) => {
    setSubmitting(true)
    setError(null)
    try {
      await noteService.updateNote(id, noteData)
      await Promise.all([fetchNotes(), fetchStatsAndTags()])
    } catch (err) {
      setError(err.message || 'Failed to update note')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  // Toggle Pin
  const handleTogglePin = async (id) => {
    setError(null)
    try {
      await noteService.togglePin(id)
      await Promise.all([fetchNotes(), fetchStatsAndTags()])
    } catch (err) {
      setError(err.message || 'Failed to pin/unpin note')
      throw err
    }
  }

  // Toggle Archive
  const handleToggleArchive = async (id) => {
    setError(null)
    try {
      await noteService.toggleArchive(id)
      await Promise.all([fetchNotes(), fetchStatsAndTags()])
    } catch (err) {
      setError(err.message || 'Failed to archive/unarchive note')
      throw err
    }
  }

  // Delete
  const handleDeleteNote = async (id) => {
    setError(null)
    try {
      await noteService.deleteNote(id)
      await Promise.all([fetchNotes(), fetchStatsAndTags()])
    } catch (err) {
      setError(err.message || 'Failed to delete note')
      throw err
    }
  }

  const clearError = useCallback(() => setError(null), [])

  return {
    notes,
    pagination,
    stats,
    tags,
    loading,
    statsLoading,
    submitting,
    error,
    clearError,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    showArchived,
    setShowArchived,
    page,
    setPage,
    refetch: fetchNotes,
    handleCreateNote,
    handleUpdateNote,
    handleTogglePin,
    handleToggleArchive,
    handleDeleteNote
  }
}
