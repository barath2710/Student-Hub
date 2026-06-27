import { useState, useRef, useCallback, useEffect } from 'react'
import { uploadResource } from '../../services/resourceService'

// ─── Accepted file types ───────────────────────────────────────────────────────
const ACCEPTED_TYPES = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
}
const ACCEPTED_MIME_LIST = Object.keys(ACCEPTED_TYPES).join(',')
const MAX_SIZE_MB = 20
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

// ─── Format file size ─────────────────────────────────────────────────────────
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── File type icon ───────────────────────────────────────────────────────────
function FileIcon({ type }) {
  const icons = {
    pdf:  { bg: '#fee2e2', color: '#dc2626', label: 'PDF' },
    doc:  { bg: '#dbeafe', color: '#2563eb', label: 'DOC' },
    docx: { bg: '#dbeafe', color: '#2563eb', label: 'DOCX' },
    ppt:  { bg: '#ffedd5', color: '#ea580c', label: 'PPT' },
    pptx: { bg: '#ffedd5', color: '#ea580c', label: 'PPTX' },
    png:  { bg: '#d1fae5', color: '#059669', label: 'IMG' },
    jpg:  { bg: '#d1fae5', color: '#059669', label: 'IMG' },
    jpeg: { bg: '#d1fae5', color: '#059669', label: 'IMG' },
  }
  const info = icons[type?.toLowerCase()] || { bg: 'var(--surface-3)', color: 'var(--text-secondary)', label: 'FILE' }
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 8,
      background: info.bg, color: info.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 9, fontWeight: 700, letterSpacing: '0.03em',
      flexShrink: 0,
    }}>
      {info.label}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  Upload Modal
// ══════════════════════════════════════════════════════════════════════════════
export default function UploadModal({ isOpen, onClose, onUploaded }) {
  const [file, setFile]             = useState(null)
  const [title, setTitle]           = useState('')
  const [description, setDesc]      = useState('')
  const [subject, setSubject]       = useState('')
  const [dragging, setDragging]     = useState(false)
  const [progress, setProgress]     = useState(0)
  const [uploading, setUploading]   = useState(false)
  const [error, setError]           = useState('')

  const dropRef   = useRef(null)
  const fileInput = useRef(null)

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setFile(null); setTitle(''); setDesc(''); setSubject('')
      setProgress(0); setUploading(false); setError('')
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const validateFile = (f) => {
    if (!ACCEPTED_TYPES[f.type]) return 'Unsupported file type. Allowed: PDF, DOCX, PPT/PPTX, PNG, JPG.'
    if (f.size > MAX_SIZE_BYTES) return `File too large. Maximum size is ${MAX_SIZE_MB} MB.`
    return null
  }

  const handleFileDrop = useCallback((f) => {
    const err = validateFile(f)
    if (err) { setError(err); return }
    setError('')
    setFile(f)
    // Pre-fill title from filename (strip extension)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
  }, [title])

  // ── Drag events ──────────────────────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = ()  => setDragging(false)
  const onDrop      = (e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFileDrop(f)
  }

  const onFileInputChange = (e) => {
    const f = e.target.files?.[0]
    if (f) handleFileDrop(f)
    e.target.value = ''
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file)    { setError('Please select a file.'); return }
    if (!title.trim())   { setError('Title is required.'); return }
    if (!subject.trim()) { setError('Subject is required.'); return }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title.trim())
    formData.append('description', description.trim())
    formData.append('subject', subject.trim())

    setUploading(true)
    setError('')
    try {
      await uploadResource(formData, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100))
      })
      onUploaded?.()
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Upload failed. Please try again.')
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(3px)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        style={{
          position: 'fixed', inset: 0, zIndex: 61,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
          pointerEvents: 'none',
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            pointerEvents: 'auto',
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '28px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxHeight: '90vh',
            overflowY: 'auto',
            animation: 'slideUp 0.2s ease',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 id="upload-modal-title" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                Upload Resource
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                PDF, DOCX, PPT/PPTX, PNG, JPG · Max {MAX_SIZE_MB} MB
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, lineHeight: 1,
              }}
            >✕</button>
          </div>

          {/* Drop Zone */}
          <div
            ref={dropRef}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInput.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--primary)' : file ? 'var(--border-strong)' : 'var(--border)'}`,
              borderRadius: 12,
              padding: '24px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? 'var(--primary-subtle)' : 'var(--surface-2)',
              transition: 'all 0.15s ease',
              userSelect: 'none',
            }}
          >
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPTED_MIME_LIST}
              onChange={onFileInputChange}
              style={{ display: 'none' }}
              aria-label="File input"
            />
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                <FileIcon type={file.name.split('.').pop()} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                    {file.name}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-tertiary)' }}>
                    {formatSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  style={{
                    marginLeft: 'auto', background: 'var(--surface-3)',
                    border: 'none', borderRadius: 6, width: 28, height: 28,
                    cursor: 'pointer', color: 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                  }}
                  aria-label="Remove file"
                >✕</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {dragging ? 'Drop it here!' : 'Drag & drop or click to browse'}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-tertiary)' }}>
                  PDF, DOCX, PPT, PPTX, PNG, JPG
                </p>
              </>
            )}
          </div>

          {/* Upload progress */}
          {uploading && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Uploading…</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{progress}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: 'var(--surface-3)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  borderRadius: 99,
                  background: 'var(--primary)',
                  transition: 'width 0.2s ease',
                }} />
              </div>
            </div>
          )}

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Title */}
            <div>
              <label htmlFor="res-title" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Title <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="res-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Linear Algebra Lecture Notes"
                maxLength={100}
                required
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--surface-2)',
                  color: 'var(--text-primary)', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="res-subject" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Subject <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="res-subject"
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Mathematics, Physics, CS"
                maxLength={50}
                required
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--surface-2)',
                  color: 'var(--text-primary)', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="res-desc" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                Description <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                id="res-desc"
                value={description}
                onChange={e => setDesc(e.target.value)}
                placeholder="Brief description of this resource…"
                rows={2}
                maxLength={500}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: '1px solid var(--border)', background: 'var(--surface-2)',
                  color: 'var(--text-primary)', fontSize: 14,
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  fontFamily: 'inherit', minHeight: 60,
                }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⚠️</span> {error}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              style={{
                padding: '9px 18px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--surface-2)',
                color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
                cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              style={{
                padding: '9px 20px', borderRadius: 8,
                border: 'none', background: 'var(--primary)',
                color: 'var(--text-inverse)', fontSize: 14, fontWeight: 600,
                cursor: uploading || !file ? 'not-allowed' : 'pointer',
                opacity: uploading || !file ? 0.65 : 1,
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'opacity 0.15s',
              }}
            >
              {uploading ? (
                <>
                  <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Uploading…
                </>
              ) : '⬆ Upload'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
