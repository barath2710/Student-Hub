import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useJarvisChat from '../../hooks/useJarvisChat'
import ChatMessage from './ChatMessage'

export default function FloatingJarvis() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    messages,
    loading,
    error,
    sendMessage,
    startNewSession
  } = useJarvisChat()

  const [input, setInput] = useState('')
  const feedRef = useRef(null)

  // Auto scroll to bottom
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [messages, loading, isOpen])

  const handleSend = () => {
    if (!input.trim() || loading) return
    sendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-xl)] flex flex-col overflow-hidden mb-4 animate-[scaleIn_0.18s_ease-out] transform-origin-bottom-right">
          {/* Header */}
          <div className="h-14 border-b border-[var(--border)] bg-[var(--surface-1)] flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <h3 className="text-xs font-bold text-[var(--text-primary)]">Jarvis AI Assistant</h3>
                <p className="text-[9px] text-[var(--text-secondary)] font-medium">Quick study help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link
                to="/jarvis"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] text-xs font-bold transition-all"
                title="Open full page chat"
              >
                ↗ Full screen
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-all"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div
            ref={feedRef}
            className="flex-1 overflow-y-auto p-2 space-y-2 bg-[var(--bg-app)] no-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none">
                <span className="text-3xl mb-2">🤖</span>
                <p className="text-xs font-bold text-[var(--text-primary)]">How can I help you study today?</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1 max-w-[200px]">
                  Ask Jarvis for summaries, concept explanations, or general study answers.
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.role === 'user'
                return (
                  <div
                    key={idx}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full animate-[fadeIn_0.15s_ease-out]`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[var(--primary)] text-[var(--text-inverse)] rounded-br-none'
                        : 'bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                )
              })
            )}

            {/* Typing Dots */}
            {loading && (
              <div className="flex justify-start w-full">
                <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl rounded-bl-none px-4 py-2.5 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full jarvis-dot" />
                  <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full jarvis-dot" />
                  <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full jarvis-dot" />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-2 border border-[var(--danger)] bg-[var(--danger-subtle)] text-[var(--danger-text)] rounded-xl text-[10px] font-semibold text-center">
                {error}
              </div>
            )}
          </div>

          {/* Quick inputs */}
          <div className="p-3 border-t border-[var(--border)] bg-[var(--card-bg)] flex gap-2 shrink-0">
            <input
              type="text"
              placeholder="Ask Jarvis..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="flex-1 px-3.5 py-2 border border-[var(--border)] bg-[var(--surface-1)] rounded-xl text-xs focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-3.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] rounded-xl font-bold text-xs disabled:opacity-30 transition-all flex items-center justify-center"
            >
              ➔
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-[var(--shadow-lg)] transition-all active:scale-95 ${
          isOpen
            ? 'bg-[var(--primary)] text-[var(--text-inverse)] hover:scale-105'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105 shadow-indigo-600/20'
        }`}
        title="Chat with Jarvis AI"
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </div>
  )
}
