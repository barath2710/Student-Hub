import React, { useState } from 'react'

export default function TagInput({ tags = [], onChange }) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  const addTag = () => {
    const cleanTag = input.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!cleanTag) return

    if (tags.includes(cleanTag)) {
      setInput('')
      return
    }

    if (tags.length >= 10) {
      alert('Maximum of 10 tags allowed per note.')
      return
    }

    onChange([...tags, cleanTag])
    setInput('')
  }

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove))
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[var(--text-secondary)]">Tags (Max 10)</label>
      <div className="flex flex-wrap gap-2 p-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl min-h-[46px] items-center">
        {tags.map((tag, idx) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-[var(--surface-3)] border border-[var(--border-strong)] text-[var(--text-primary)] px-2 py-0.5 rounded-md text-xs font-medium"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] ml-0.5 focus:outline-none cursor-pointer"
            >
              ✕
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length < 10 ? 'Add tag...' : 'Tags limit reached'}
          disabled={tags.length >= 10}
          className="flex-1 min-w-[80px] bg-transparent border-none text-[var(--text-primary)] text-xs placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-0 py-0.5"
        />
      </div>
      <p className="text-[10px] text-[var(--text-tertiary)]">Press Enter or comma to insert a tag. Only alphanumeric characters allowed.</p>
    </div>
  )
}
