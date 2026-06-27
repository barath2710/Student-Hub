import React, { useState, useEffect } from 'react'
import NoteEditor from './NoteEditor'
import TagInput from './TagInput'
import ColorPicker from './ColorPicker'

export default function NoteModal({ isOpen, onClose, onSave, note = null, submitting = false }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subject, setSubject] = useState('')
  const [tags, setTags] = useState([])
  const [color, setColor] = useState('default')
  const [formError, setFormError] = useState('')

  // Initialize fields on note change or opening
  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
      setSubject(note.subject || '')
      setTags(note.tags || [])
      setColor(note.color || 'default')
    } else {
      setTitle('')
      setContent('')
      setSubject('')
      setTags([])
      setColor('default')
    }
    setFormError('')
  }, [note, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!title.trim()) {
      setFormError('Title is required')
      return
    }
    if (!content.trim()) {
      setFormError('Content is required')
      return
    }

    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        subject: subject.trim(),
        tags,
        color,
      })
      onClose()
    } catch (err) {
      setFormError(err.message || 'An error occurred while saving the note.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 md:p-8 my-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            {note ? '✏️ Edit Note' : '📝 New Note'}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg transition-colors cursor-pointer"
            disabled={submitting}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {formError && (
            <div className="bg-[var(--danger-subtle)] border border-[var(--danger)] text-[var(--danger-text)] px-4 py-2.5 rounded-xl text-sm">
              ⚠️ {formError}
            </div>
          )}

          {/* Title & Content Editor */}
          <NoteEditor
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
          />

          {/* Subject Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Subject / Category</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value.slice(0, 100))}
              placeholder="e.g., MATH-101, Personal, Science..."
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] focus:border-transparent transition-all"
            />
          </div>

          {/* Tags Field */}
          <TagInput tags={tags} onChange={setTags} />

          {/* Color swatches */}
          <ColorPicker value={color} onChange={setColor} />

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text-primary)] font-medium rounded-xl text-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-semibold rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Note'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
