import React, { useState, useEffect } from 'react'

export default function TaskCard({ task, onEdit, onDelete, onToggle }) {
  const { title, description, priority, status, dueDate, isOverdue } = task
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
      onDelete(task._id)
    } else {
      setConfirmDelete(true)
    }
  }

  // Format date nicely
  const formatDueDate = (dateStr) => {
    if (!dateStr) return 'No due date'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  };

  // Priority color styles using theme semantic classes
  const getPriorityBadgeClass = (p) => {
    switch (p) {
      case 'high':
        return 'bg-[var(--danger-subtle)] border border-[var(--danger)] text-[var(--danger-text)]'
      case 'medium':
        return 'bg-[var(--warning-subtle)] border border-[var(--warning)] text-[var(--warning-text)]'
      case 'low':
      default:
        return 'bg-[var(--success-subtle)] border border-[var(--success)] text-[var(--success-text)]'
    }
  }

  return (
    <div
      className={`bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:translate-y-[-2px] hover:shadow-[var(--shadow-sm)] relative overflow-hidden ${
        status === 'completed' ? 'opacity-65' : ''
      }`}
    >
      {/* Complete/Incomplete status indicators */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Custom checkbox */}
          <button
            onClick={() => onToggle(task._id)}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
              status === 'completed'
                ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--text-inverse)]'
                : 'border-[var(--border-strong)] hover:border-[var(--text-primary)] hover:bg-[var(--surface-2)] text-transparent'
            }`}
          >
            ✓
          </button>
          <h3
            className={`font-bold text-[var(--text-primary)] text-base leading-tight transition-all truncate max-w-[180px] md:max-w-[200px] ${
              status === 'completed' ? 'line-through text-[var(--text-tertiary)]' : ''
            }`}
            title={title}
          >
            {title}
          </h3>
        </div>

        {/* Priority & Overdue Badges */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${getPriorityBadgeClass(priority)}`}>
            {priority}
          </span>
          {isOverdue && status !== 'completed' && (
            <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[var(--danger)] text-[var(--text-inverse)] animate-pulse">
              Overdue
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p
        className={`text-sm text-[var(--text-secondary)] leading-relaxed min-h-[40px] line-clamp-2 ${
          status === 'completed' ? 'text-[var(--text-tertiary)]' : ''
        }`}
      >
        {description || <span className="italic opacity-50">No description provided</span>}
      </p>

      {/* Bottom Footer Actions */}
      <div className="flex items-center justify-between border-t border-[var(--border)] pt-3.5 mt-1">
        {/* Due Date */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <span>📅</span>
          <span className={isOverdue && status !== 'completed' ? 'text-[var(--danger)] font-semibold' : ''}>
            {formatDueDate(dueDate)}
          </span>
        </div>

        {/* Edit/Delete Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="w-8 h-8 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center text-xs transition-all cursor-pointer"
            title="Edit Task"
          >
            ✏️
          </button>
          <button
            onClick={handleDeleteClick}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer border ${
              confirmDelete
                ? 'bg-[var(--danger)] text-[var(--text-inverse)] border-[var(--danger)] animate-pulse'
                : 'bg-[var(--surface-2)] hover:bg-[var(--danger-subtle)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--danger)]'
            }`}
            title="Delete Task"
          >
            {confirmDelete ? '✓' : '🗑️'}
          </button>
        </div>
      </div>
    </div>
  )
}
