import React from 'react'

export default function TagFilter({ tags = [], activeTag, onSelectTag }) {
  return (
    <div className="w-full overflow-x-auto flex gap-2 py-2 no-scrollbar">
      <button
        onClick={() => onSelectTag(null)}
        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
          activeTag === null
            ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--text-inverse)] shadow-sm'
            : 'bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
        }`}
      >
        🏷️ All Notes
      </button>

      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelectTag(tag)}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
            activeTag === tag
              ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--text-inverse)] shadow-sm'
              : 'bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]'
          }`}
        >
          #{tag}
        </button>
      ))}
    </div>
  )
}
