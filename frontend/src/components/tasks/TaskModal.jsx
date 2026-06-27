import React, { useState, useEffect } from 'react'
import TaskEditor from './TaskEditor'

export default function TaskModal({ isOpen, onClose, onSave, task = null, submitting = false }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('pending')
  const [formError, setFormError] = useState('')

  // Initialize fields on task change or opening
  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setPriority(task.priority || 'medium')
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '')
      setStatus(task.status || 'pending')
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
      setStatus('pending')
    }
    setFormError('')
  }, [task, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!title.trim()) {
      setFormError('Title is required')
      return
    }

    try {
      // Build task data to send to backend
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate: dueDate || null
      }
      
      await onSave(taskData)
      onClose()
    } catch (err) {
      setFormError(err.message || 'An error occurred while saving the task.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 md:p-8 my-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            {task ? '✏️ Edit Task' : '📋 New Task'}
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg transition-colors cursor-pointer bg-transparent border-none"
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

          {/* Form Content */}
          <TaskEditor
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            priority={priority}
            setPriority={setPriority}
            dueDate={dueDate}
            setDueDate={setDueDate}
            status={status}
            setStatus={setStatus}
            isEditing={!!task}
          />

          {/* Action Buttons */}
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
                'Save Task'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
