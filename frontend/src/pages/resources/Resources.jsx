import { useState, useCallback } from 'react'
import useResources from '../../hooks/useResources'
import UploadModal from '../../components/resources/UploadModal'

// ─── Constants ────────────────────────────────────────────────────────────────
const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
const BASE_URL = apiBase.startsWith('http') ? apiBase.replace(/\/api$/, '') : ''

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)           return 'just now'
  if (diff < 3600)         return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)        return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 30)   return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

// ─── File type config ─────────────────────────────────────────────────────────
const FILE_CONFIG = {
  pdf:  { bg: '#fee2e2', color: '#dc2626', label: 'PDF',  icon: '📄' },
  doc:  { bg: '#dbeafe', color: '#2563eb', label: 'DOC',  icon: '📝' },
  docx: { bg: '#dbeafe', color: '#2563eb', label: 'DOCX', icon: '📝' },
  ppt:  { bg: '#ffedd5', color: '#ea580c', label: 'PPT',  icon: '📊' },
  pptx: { bg: '#ffedd5', color: '#ea580c', label: 'PPTX', icon: '📊' },
  png:  { bg: '#d1fae5', color: '#059669', label: 'IMG',  icon: '🖼' },
  jpg:  { bg: '#d1fae5', color: '#059669', label: 'IMG',  icon: '🖼' },
  jpeg: { bg: '#d1fae5', color: '#059669', label: 'IMG',  icon: '🖼' },
}

function getFileConfig(type) {
  return FILE_CONFIG[type?.toLowerCase()] || { bg: 'var(--surface-3)', color: 'var(--text-secondary)', label: type?.toUpperCase() || 'FILE', icon: '📎' }
}

// ─── File Badge ───────────────────────────────────────────────────────────────
function FileBadge({ type }) {
  const cfg = getFileConfig(type)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
      background: cfg.bg, color: cfg.color, letterSpacing: '0.04em',
    }}>
      {cfg.label}
    </span>
  )
}

// ─── Resource Card ────────────────────────────────────────────────────────────
function ResourceCard({ resource, onDelete, onRename }) {
  const [menuOpen, setMenuOpen]     = useState(false)
  const [renaming, setRenaming]     = useState(false)
  const [newTitle, setNewTitle]     = useState(resource.title)
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(false)

  const cfg = getFileConfig(resource.fileType)
  const fileUrl = `${BASE_URL}${resource.fileUrl}`

  const handleRename = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || newTitle.trim() === resource.title) { setRenaming(false); return }
    setSaving(true)
    try {
      await onRename(resource._id, { title: newTitle.trim() })
      setRenaming(false)
    } catch { /* silently ignore */ }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) return
    setDeleting(true)
    try { await onDelete(resource._id) }
    catch { setDeleting(false) }
  }

  return (
    <div style={{
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      transition: 'box-shadow 0.15s, border-color 0.15s',
      position: 'relative',
      opacity: deleting ? 0.5 : 1,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      e.currentTarget.style.borderColor = 'var(--border-strong)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = 'none'
      e.currentTarget.style.borderColor = 'var(--border)'
    }}
    >
      {/* Top: file icon + type badge + menu */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: cfg.bg, color: cfg.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>
          {cfg.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <FileBadge type={resource.fileType} />
        </div>

        {/* ⋯ Menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen(p => !p)}
            aria-label="Resource options"
            style={{
              width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)',
              background: 'var(--surface-2)', color: 'var(--text-secondary)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, lineHeight: 1,
            }}
          >⋯</button>
          {menuOpen && (
            <>
              <div
                aria-hidden="true"
                onClick={() => setMenuOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 5 }}
              />
              <div style={{
                position: 'absolute', right: 0, top: 32, zIndex: 10,
                background: 'var(--surface-1)', border: '1px solid var(--border)',
                borderRadius: 10, boxShadow: 'var(--shadow-md)',
                padding: '4px', minWidth: 140, overflow: 'hidden',
              }}>
                {[
                  { label: '✏️ Rename',   action: () => { setRenaming(true); setMenuOpen(false) } },
                  { label: '⬇️ Download', action: () => { window.open(fileUrl, '_blank'); setMenuOpen(false) } },
                  { label: '🗑 Delete',   action: () => { setMenuOpen(false); handleDelete() }, danger: true },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      display: 'block', width: '100%', padding: '8px 12px',
                      background: 'transparent', border: 'none', borderRadius: 7,
                      color: item.danger ? 'var(--danger)' : 'var(--text-primary)',
                      fontSize: 13, fontWeight: 500, textAlign: 'left', cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = item.danger ? 'var(--danger-subtle)' : 'var(--surface-2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >{item.label}</button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title / Rename inline */}
      {renaming ? (
        <form onSubmit={handleRename} style={{ display: 'flex', gap: 6 }}>
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            maxLength={100}
            style={{
              flex: 1, padding: '6px 10px', borderRadius: 7,
              border: '1px solid var(--primary)',
              background: 'var(--surface-2)', color: 'var(--text-primary)',
              fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '6px 10px', borderRadius: 7, border: 'none',
              background: 'var(--primary)', color: '#fff',
              fontSize: 12, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >{saving ? '…' : '✓'}</button>
          <button
            type="button"
            onClick={() => { setRenaming(false); setNewTitle(resource.title) }}
            style={{
              padding: '6px 10px', borderRadius: 7,
              border: '1px solid var(--border)', background: 'var(--surface-2)',
              color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
            }}
          >✕</button>
        </form>
      ) : (
        <p style={{
          margin: 0, fontSize: 14, fontWeight: 600,
          color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          lineHeight: 1.4,
        }}>
          {resource.title}
        </p>
      )}

      {/* Subject pill */}
      <span style={{
        alignSelf: 'flex-start', padding: '3px 10px', borderRadius: 99,
        background: 'var(--surface-3)', color: 'var(--text-secondary)',
        fontSize: 11, fontWeight: 600, letterSpacing: '0.03em',
        textTransform: 'capitalize',
      }}>
        {resource.subject}
      </span>

      {/* Footer: size + time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{formatSize(resource.fileSize)}</span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{timeAgo(resource.createdAt)}</span>
      </div>

      {/* Download CTA */}
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '8px', borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface-2)',
          color: 'var(--text-secondary)',
          fontSize: 12, fontWeight: 500, textDecoration: 'none',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--primary-subtle)'
          e.currentTarget.style.color = 'var(--primary)'
          e.currentTarget.style.borderColor = 'var(--primary)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--surface-2)'
          e.currentTarget.style.color = 'var(--text-secondary)'
          e.currentTarget.style.borderColor = 'var(--border)'
        }}
      >
        ⬇ Open / Download
      </a>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ search, subject, onUpload }) {
  const hasFilter = search || subject
  return (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '64px 24px', textAlign: 'center',
      background: 'var(--surface-1)', border: '1px solid var(--border)',
      borderRadius: 16,
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{hasFilter ? '🔍' : '📂'}</div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
        {hasFilter ? 'No results found' : 'No resources yet'}
      </h3>
      <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--text-secondary)', maxWidth: 320 }}>
        {hasFilter
          ? 'Try adjusting your search or filters.'
          : 'Upload your first study resource to get started.'}
      </p>
      {!hasFilter && (
        <button
          onClick={onUpload}
          style={{
            padding: '10px 22px', borderRadius: 10,
            border: 'none', background: 'var(--primary)',
            color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >⬆ Upload Resource</button>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--surface-1)', border: '1px solid var(--border)',
      borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {[44, 16, 10, 10, 32].map((h, i) => (
        <div key={i} style={{
          height: h, borderRadius: 8,
          background: 'var(--surface-3)',
          animation: 'pulse 1.4s ease-in-out infinite',
          width: i === 2 ? '60%' : '100%',
        }} />
      ))}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
//  Resources Page
// ──────────────────────────────────────────────────────────────────────────────
export default function Resources() {
  const {
    resources, allSubjects, pagination, loading, error, setError,
    search, subject,
    handleSearch, handleSubjectFilter, handlePageChange,
    handleDelete, handleRename,
    refetch,
  } = useResources()

  const [uploadOpen, setUploadOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')

  // Debounce search
  const searchTimeoutRef = { current: null }
  const onSearchChange = useCallback((val) => {
    setSearchInput(val)
    clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => handleSearch(val), 400)
  }, [handleSearch])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Study Resources
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
            {pagination.total} {pagination.total === 1 ? 'file' : 'files'} · Organize and access your study materials
          </p>
        </div>
        <button
          id="upload-resource-btn"
          onClick={() => setUploadOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            border: 'none', background: 'var(--primary)',
            color: 'var(--text-inverse)', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'opacity 0.15s, transform 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <span style={{ fontSize: 16 }}>⬆</span> Upload
        </button>
      </div>

      {/* ── Search + Filters ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 200 }}>
          <span style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-tertiary)', fontSize: 14, pointerEvents: 'none',
          }}>🔍</span>
          <input
            type="search"
            aria-label="Search resources"
            placeholder="Search by title…"
            value={searchInput}
            onChange={e => onSearchChange(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 36px', borderRadius: 10,
              border: '1px solid var(--border)', background: 'var(--surface-2)',
              color: 'var(--text-primary)', fontSize: 14, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Subject Filters */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['', ...allSubjects].map(s => (
            <button
              key={s || 'all'}
              onClick={() => handleSubjectFilter(s)}
              style={{
                padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                border: '1px solid var(--border)', cursor: 'pointer',
                background: subject === s ? 'var(--primary)' : 'var(--surface-2)',
                color: subject === s ? 'var(--text-inverse)' : 'var(--text-secondary)',
                transition: 'all 0.12s', textTransform: 'capitalize',
              }}
            >
              {s || 'All Subjects'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────────────── */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderRadius: 10,
          background: 'var(--danger-subtle)', border: '1px solid var(--danger)',
          color: 'var(--danger)', fontSize: 13,
        }}>
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 15 }}
          >✕</button>
        </div>
      )}

      {/* ── Grid ─────────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16,
      }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : resources.length === 0 ? (
          <EmptyState search={search} subject={subject} onUpload={() => setUploadOpen(true)} />
        ) : (
          resources.map(r => (
            <ResourceCard
              key={r._id}
              resource={r}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ))
        )}
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      {pagination.pages > 1 && !loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 8 }}>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            style={{
              padding: '7px 14px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface-2)',
              color: pagination.page <= 1 ? 'var(--text-disabled)' : 'var(--text-primary)',
              fontSize: 13, fontWeight: 500,
              cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
            }}
          >← Prev</button>

          <span style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '0 8px' }}>
            Page {pagination.page} of {pagination.pages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
            style={{
              padding: '7px 14px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--surface-2)',
              color: pagination.page >= pagination.pages ? 'var(--text-disabled)' : 'var(--text-primary)',
              fontSize: 13, fontWeight: 500,
              cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer',
            }}
          >Next →</button>
        </div>
      )}

      {/* ── Upload Modal ──────────────────────────────────────────────────────── */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploaded={refetch}
      />
    </div>
  )
}
