import React, { useState, useRef, useEffect } from 'react'

export default function ChatInput({
  onSend,
  disabled,
  onAttachClick,
  attachedResource,
  onRemoveResource
}) {
  const [content, setContent] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea heights
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
    }
  }, [content])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (!content.trim() || disabled) return
    onSend(content.trim())
    setContent('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  return (
    <div className="p-4 border-t border-[var(--border)] bg-[var(--card-bg)] flex flex-col gap-3">
      {/* Attached Resource Pill */}
      {attachedResource && (
        <div className="flex items-center self-start gap-2 px-3 py-1 bg-[var(--primary-subtle)] border border-[var(--primary)] rounded-full text-xs font-semibold animate-[scaleIn_0.15s_ease-out]">
          <span className="text-base select-none">
            {attachedResource.fileType?.toLowerCase() === 'pdf' ? '📕' : '📄'}
          </span>
          <span className="text-[var(--text-primary)] max-w-[200px] truncate">
            {attachedResource.title}
          </span>
          <button
            onClick={onRemoveResource}
            className="text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors ml-1 font-bold rounded-full p-0.5"
            title="Remove attachment"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input box row */}
      <div className="flex items-end gap-2 border border-[var(--border)] focus-within:border-[var(--border-strong)] rounded-2xl p-2 bg-[var(--surface-1)] transition-colors">
        {/* Attachment button */}
        <button
          type="button"
          onClick={onAttachClick}
          disabled={disabled}
          className="p-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] disabled:opacity-40 disabled:hover:bg-transparent rounded-xl transition-all"
          title="Attach study resource"
        >
          📁
        </button>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={attachedResource ? `Ask Jarvis about "${attachedResource.title}"...` : "Ask Jarvis anything..."}
          disabled={disabled}
          rows={1}
          className="flex-1 max-h-[180px] bg-transparent border-0 px-2 py-2 text-sm focus:ring-0 focus:outline-none resize-none text-[var(--text-primary)] placeholder-[var(--text-tertiary)] leading-relaxed"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          className="p-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] disabled:opacity-30 disabled:hover:bg-[var(--primary)] rounded-xl transition-all shadow-xs"
          title="Send message"
        >
          ➔
        </button>
      </div>
      <p className="text-[10px] text-[var(--text-tertiary)] text-center">
        Jarvis can make mistakes. Verify important study facts.
      </p>
    </div>
  )
}
