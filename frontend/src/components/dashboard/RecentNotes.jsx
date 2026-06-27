import React from 'react'
import { useNavigate } from 'react-router-dom'

function NoteRowSkeleton() {
  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-3 flex flex-col gap-2 animate-pulse">
      <div className="h-4 bg-[var(--surface-3)] rounded w-1/3" />
      <div className="h-3 bg-[var(--surface-2)] rounded w-5/6" />
      <div className="flex gap-2">
        <div className="h-3 w-8 bg-[var(--surface-2)] rounded" />
        <div className="h-3 w-12 bg-[var(--surface-2)] rounded" />
      </div>
    </div>
  )
}

const RecentNotes = React.memo(({ notes, loading, onCreateNote }) => {
  const navigate = useNavigate()

  const getColorBorderClass = (color) => {
    switch (color) {
      case 'red': return 'border-l-[var(--danger)]'
      case 'orange': return 'border-l-[var(--warning)]'
      case 'yellow': return 'border-l-[var(--warning)]'
      case 'green': return 'border-l-[var(--success)]'
      case 'teal': return 'border-l-[var(--text-secondary)]'
      case 'purple': return 'border-l-[var(--text-primary)]'
      case 'default':
      default:
        return 'border-l-[var(--border-strong)]'
    }
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 shadow-[var(--shadow-card)]">
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-2.5">
        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
          Recent Notes
        </h3>
        <button
          onClick={() => navigate('/notes')}
          className="text-xs text-[var(--text-primary)] font-semibold transition-colors cursor-pointer bg-transparent border-none hover:underline"
        >
          View All Notes →
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2.5">
          {[...Array(3)].map((_, i) => (
            <NoteRowSkeleton key={i} />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-[var(--surface-1)] rounded-xl border border-[var(--border)] gap-3">
          <span className="text-3xl">🏜️</span>
          <p className="text-xs text-[var(--text-secondary)] max-w-[200px]">No notes captured yet. Start recording your studies.</p>
          <button
            onClick={onCreateNote}
            className="px-4 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Create Note
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {notes.map((note) => (
            <div
              key={note._id}
              onClick={() => navigate('/notes')}
              className={`bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] border-l-4 ${getColorBorderClass(
                note.color
              )} rounded-xl p-3 flex flex-col gap-1 transition-all cursor-pointer`}
            >
              <div className="flex justify-between items-center gap-2">
                <h4 className="font-bold text-[var(--text-primary)] text-xs truncate leading-tight w-2/3" title={note.title}>
                  {note.title}
                </h4>
                {note.subject && (
                  <span className="text-[8px] uppercase tracking-widest text-[var(--text-primary)] bg-[var(--surface-2)] border border-[var(--border)] px-1.5 py-0.5 rounded font-black max-w-[80px] truncate">
                    {note.subject}
                  </span>
                )}
              </div>

              <p className="text-[10px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed mt-0.5">
                {note.content}
              </p>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {note.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[8px] text-[var(--text-secondary)] bg-[var(--surface-2)] px-1.5 py-0.5 rounded border border-[var(--border)]"
                    >
                      #{tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && (
                    <span className="text-[8px] text-[var(--text-tertiary)] px-1 py-0.5">+{note.tags.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

RecentNotes.displayName = 'RecentNotes'
export default RecentNotes
