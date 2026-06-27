import React, { useRef, useEffect } from 'react'

export default function NoteEditor({ title, setTitle, content, setContent }) {
  const contentRef = useRef(null)

  // Auto-resize content textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto'
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`
    }
  }, [content])

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
          placeholder="Note Title..."
          autoFocus
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] focus:border-transparent transition-all"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Content</label>
          <span className={`text-[10px] ${content.length > 45000 ? 'text-[var(--warning)] font-semibold' : 'text-[var(--text-tertiary)]'}`}>
            {content.length.toLocaleString()}/50,000
          </span>
        </div>
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 50000))}
          placeholder="Start writing..."
          rows={6}
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] focus:border-transparent transition-all resize-none overflow-y-hidden"
        />
      </div>
    </div>
  )
}
