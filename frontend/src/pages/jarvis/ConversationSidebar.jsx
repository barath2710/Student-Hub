import React from 'react'

export default function ConversationSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  loading
}) {
  return (
    <div className="w-80 h-full border-r border-[var(--border)] bg-[var(--surface-1)] flex flex-col shrink-0 drawer-enter">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <button
          onClick={onNewSession}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-bold text-sm rounded-xl transition-all shadow-sm"
        >
          <span>＋</span> New Session
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        <div className="px-2 pb-2 text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
          Chat History
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--text-tertiary)] italic">
            No past chats
          </div>
        ) : (
          sessions.map((sess) => {
            const isActive = activeSessionId === sess._id

            return (
              <div
                key={sess._id}
                className={`group relative w-full flex items-center justify-between rounded-xl transition-all ${
                  isActive
                    ? 'bg-[var(--card-bg)] shadow-xs border border-[var(--border)]'
                    : 'hover:bg-[var(--surface-2)] border border-transparent'
                }`}
              >
                {/* Select button */}
                <button
                  onClick={() => onSelectSession(sess._id)}
                  className="flex-1 text-left px-3 py-3 text-sm font-semibold text-[var(--text-primary)] truncate pr-10"
                >
                  <span className="mr-2 select-none">💬</span>
                  {sess.title || 'New Chat'}
                </button>

                {/* Delete button (visible on hover) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Delete this conversation?')) {
                      onDeleteSession(sess._id)
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--surface-3)] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                  title="Delete chat"
                >
                  🗑
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
