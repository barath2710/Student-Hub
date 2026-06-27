import React, { useState, useEffect } from 'react'

const colorBorders = {
  default: 'border-t-[var(--border-strong)]',
  red: 'border-t-[var(--danger)]',
  orange: 'border-t-[var(--warning)]',
  yellow: 'border-t-[var(--warning)]',
  green: 'border-t-[var(--success)]',
  teal: 'border-t-[var(--text-secondary)]',
  purple: 'border-t-[var(--text-primary)]',
}

const formatRelativeTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function NoteCard({ note, onEdit, onDelete, onTogglePin, onToggleArchive }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (confirmDelete) {
      const timer = setTimeout(() => setConfirmDelete(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [confirmDelete])

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    if (confirmDelete) {
      onDelete(note._id)
    } else {
      setConfirmDelete(true)
    }
  }

  // Truncate content preview to ~120 characters
  const getContentPreview = () => {
    if (!note.content) return ''
    if (note.content.length <= 120) return note.content
    return `${note.content.slice(0, 120)}...`
  }

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border border-[var(--border)] border-t-[5px] bg-[var(--card-bg)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-300 hover:-translate-y-1 ${colorBorders[note.color] || colorBorders.default}`}
    >
      {/* Pin button top right */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onTogglePin(note._id)
        }}
        className={`absolute top-4 right-4 p-1.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-[var(--surface-3)] cursor-pointer ${
          note.isPinned ? 'opacity-100 text-[var(--warning)] border-[var(--warning)]/20' : 'text-[var(--text-tertiary)]'
        }`}
        title={note.isPinned ? 'Unpin note' : 'Pin note'}
      >
        📌
      </button>

      <div>
        {/* Subject and word count */}
        <div className="flex flex-wrap items-center gap-2 mb-3 pr-6">
          {note.subject && (
            <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-primary)] text-[10px] font-semibold tracking-wide uppercase">
              {note.subject}
            </span>
          )}
          <span className="text-[10px] text-[var(--text-tertiary)] font-medium">
            ⏱️ {note.wordCount || 0} words
          </span>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-[var(--text-primary)] mb-2 leading-snug tracking-tight truncate pr-6">
          {note.title}
        </h4>

        {/* Content preview */}
        <p className="text-sm text-[var(--text-secondary)] mb-4 whitespace-pre-wrap break-words leading-relaxed font-sans line-clamp-3">
          {getContentPreview()}
        </p>
      </div>

      <div>
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.tags.map((tag) => (
              <span key={tag} className="text-[10px] text-[var(--text-secondary)] bg-[var(--surface-2)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer actions & meta */}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-3.5 mt-auto">
          <span className="text-[10px] text-[var(--text-tertiary)]">
            {formatRelativeTime(note.lastEditedAt || note.updatedAt)}
          </span>

          <div className="flex items-center gap-1">
            {/* Edit */}
            <button
              onClick={() => onEdit(note)}
              className="p-1.5 hover:bg-[var(--surface-2)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-xs"
              title="Edit Note"
            >
              ✏️
            </button>

            {/* Archive */}
            <button
              onClick={() => onToggleArchive(note._id)}
              className="p-1.5 hover:bg-[var(--surface-2)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-xs"
              title={note.isArchived ? 'Send to Notes' : 'Archive Note'}
            >
              📁
            </button>

            {/* Delete */}
            <button
              onClick={handleDeleteClick}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                confirmDelete
                  ? 'bg-[var(--danger)] text-[var(--text-inverse)] animate-pulse'
                  : 'hover:bg-[var(--danger-subtle)] text-[var(--text-tertiary)] hover:text-[var(--danger)]'
              }`}
              title="Delete Note"
            >
              {confirmDelete ? 'Confirm?' : '🗑️'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
