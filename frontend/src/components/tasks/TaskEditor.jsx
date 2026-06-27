import React from 'react'

export default function TaskEditor({
  title,
  setTitle,
  description,
  setDescription,
  priority,
  setPriority,
  dueDate,
  setDueDate,
  status,
  setStatus,
  isEditing
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Title</label>
          <span className={`text-[10px] ${title.length > 90 ? 'text-[var(--warning)] font-semibold' : 'text-[var(--text-tertiary)]'}`}>
            {title.length}/100
          </span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.slice(0, 100))}
          placeholder="Task title..."
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] focus:border-transparent transition-all"
          required
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Description</label>
          <span className={`text-[10px] ${description.length > 900 ? 'text-[var(--warning)] font-semibold' : 'text-[var(--text-tertiary)]'}`}>
            {description.length}/1000
          </span>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
          placeholder="Task description..."
          rows={3}
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Grid for Priority, Due Date and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Priority</label>
          <div className="flex bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-1">
            {['low', 'medium', 'high'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  priority === p
                    ? p === 'high'
                      ? 'bg-[var(--danger-subtle)] border-[var(--danger)] text-[var(--danger-text)] shadow-sm'
                      : p === 'medium'
                      ? 'bg-[var(--warning-subtle)] border-[var(--warning)] text-[var(--warning-text)] shadow-sm'
                      : 'bg-[var(--success-subtle)] border-[var(--success)] text-[var(--success-text)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-transparent'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] focus:border-transparent transition-all"
          />
        </div>

        {/* Status (Only when editing) */}
        {isEditing && (
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Status</label>
            <div className="flex bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-1 max-w-[300px]">
              {['pending', 'completed'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer border ${
                    status === s
                      ? 'bg-[var(--surface-3)] text-[var(--text-primary)] border-[var(--border-strong)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-transparent'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
