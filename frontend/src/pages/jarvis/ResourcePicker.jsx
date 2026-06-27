import React, { useState, useEffect } from 'react'
import { getResources } from '../../services/resourceService'

export default function ResourcePicker({ isOpen, onClose, onSelect, selectedId }) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [subject, setSubject] = useState('')
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    if (!isOpen) return

    const loadResources = async () => {
      setLoading(true)
      try {
        const res = await getResources({ limit: 50, search, subject })
        setResources(res.data.data.resources || [])
        setSubjects(res.data.data.allSubjects || [])
      } catch (err) {
        console.error('Failed to load resources', err)
      } finally {
        setLoading(false)
      }
    }

    loadResources()
  }, [isOpen, search, subject])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-[fadeIn_0.15s_ease-out]">
      <div className="relative w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-xl)] flex flex-col max-h-[80vh] overflow-hidden modal-enter">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Select Study Resource</h3>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--surface-2)]"
          >
            ✕
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-[var(--surface-1)] border-b border-[var(--border)] flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--border)] bg-[var(--card-bg)] rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)]"
          />
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSubject('')}
              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                subject === ''
                  ? 'bg-[var(--primary)] text-[var(--text-inverse)] border-[var(--primary)]'
                  : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
              }`}
            >
              All Subjects
            </button>
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => setSubject(subj)}
                className={`px-3 py-1 text-xs font-semibold rounded-full border capitalize transition-all ${
                  subject === subj
                    ? 'bg-[var(--primary)] text-[var(--text-inverse)] border-[var(--primary)]'
                    : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-[250px]">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <span className="spinner text-[var(--text-secondary)]" />
              <span className="text-sm text-[var(--text-secondary)]">Loading resources...</span>
            </div>
          ) : resources.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <span className="text-3xl mb-2">📁</span>
              <p className="font-bold text-[var(--text-primary)]">No resources found</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-[240px]">
                Upload PDF or text files in the Resource Hub to use them with Jarvis.
              </p>
            </div>
          ) : (
            resources.map((res) => {
              const isSelected = selectedId === res._id
              const isSupported = ['pdf', 'txt', 'md', 'json', 'js', 'css', 'html'].includes(
                res.fileType?.toLowerCase()
              )

              return (
                <button
                  key={res._id}
                  onClick={() => isSupported && onSelect(res)}
                  disabled={!isSupported}
                  className={`w-full flex items-start gap-3.5 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[var(--primary-subtle)] border-[var(--primary)]'
                      : !isSupported
                      ? 'opacity-40 cursor-not-allowed border-transparent bg-transparent'
                      : 'bg-[var(--card-bg)] border-[var(--border)] hover:bg-[var(--surface-1)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <span className="text-2xl mt-0.5">
                    {res.fileType?.toLowerCase() === 'pdf' ? '📕' : '📄'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {res.title}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate capitalize mt-0.5">
                      {res.subject} • {res.fileType?.toUpperCase()} • {(res.fileSize / 1024).toFixed(1)} KB
                    </p>
                    {!isSupported && (
                      <p className="text-[10px] text-[var(--danger-text)] font-semibold mt-1">
                        AI context only supports PDF and Text files.
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <span className="text-sm text-[var(--text-primary)] font-bold self-center">
                      ✓
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-1)] flex justify-end gap-3">
          {selectedId && (
            <button
              onClick={() => onSelect(null)}
              className="px-4 py-2 text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger-subtle)] border border-transparent rounded-xl transition-all"
            >
              Clear Selection
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-2)] border border-[var(--border)] rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
