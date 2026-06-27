import React, { useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'

const SUGGESTIONS = [
  { text: 'Explain Normalization in DBMS with a simple analogy.', icon: '💡' },
  { text: 'How do I optimize a search algorithm like binary search?', icon: '⚡' },
  { text: 'Explain the difference between SQL and NoSQL databases.', icon: '📊' },
  { text: 'Give me 3 tips to manage exam stress.', icon: '🌱' }
]

export default function ChatWindow({
  messages,
  loading,
  error,
  activeSession,
  onSuggestionClick
}) {
  const feedRef = useRef(null)

  // Auto scroll to bottom
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [messages, loading])

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[var(--bg-app)]">
      {/* Scrollable messages list */}
      <div
        ref={feedRef}
        className="flex-1 overflow-y-auto flex flex-col no-scrollbar"
      >
        {messages.length === 0 ? (
          /* Welcome panel */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-2xl mx-auto page-enter">
            <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-4xl mb-5 shadow-inner">
              🤖
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
              Meet Jarvis, Your Academic Assistant
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
              Ask study questions, summarize material, write code, or attach files. Jarvis is trained to help you learn and structure concepts step-by-step.
            </p>

            {/* Suggestions cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-8">
              {SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionClick(s.text)}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] hover:bg-[var(--surface-1)] hover:border-[var(--border-strong)] text-left flex items-start gap-3 transition-all hover:scale-[1.01]"
                >
                  <span className="text-xl select-none">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--text-primary)] leading-normal">
                      {s.text}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages list */
          <div className="flex flex-col">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
          </div>
        )}

        {/* Typing indicator bubble */}
        {loading && (
          <div className="flex w-full gap-3 py-4 border-b border-[var(--border)] px-4 sm:px-6 bg-[var(--surface-1)]">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-md shadow-indigo-500/20">
              🤖
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[var(--text-primary)]">Jarvis</span>
              </div>
              <div className="flex gap-1 items-center h-5 mt-1 pl-1">
                <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full jarvis-dot" />
                <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full jarvis-dot" />
                <span className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full jarvis-dot" />
              </div>
            </div>
          </div>
        )}

        {/* Error notification banner */}
        {error && (
          <div className="mx-4 sm:mx-6 my-4 p-4 border border-[var(--danger)] bg-[var(--danger-subtle)] text-[var(--danger-text)] rounded-xl flex items-center gap-3 text-xs font-semibold">
            <span>⚠️</span>
            <div className="flex-1">{error}</div>
          </div>
        )}
      </div>
    </div>
  )
}
