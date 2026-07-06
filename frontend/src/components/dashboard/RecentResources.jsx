import React from 'react'
import { useNavigate } from 'react-router-dom'

const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
const BASE_URL = apiBase.startsWith('http') ? apiBase.replace(/\/api$/, '') : ''

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)         return 'just now'
  if (diff < 3600)       return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)      return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString()
}

const FILE_CONFIG = {
  pdf:  { bg: '#fee2e2', color: '#dc2626', icon: '📄', label: 'PDF' },
  docx: { bg: '#dbeafe', color: '#2563eb', icon: '📝', label: 'DOCX' },
  doc:  { bg: '#dbeafe', color: '#2563eb', icon: '📝', label: 'DOC' },
  pptx: { bg: '#ffedd5', color: '#ea580c', icon: '📊', label: 'PPTX' },
  ppt:  { bg: '#ffedd5', color: '#ea580c', icon: '📊', label: 'PPT' },
  png:  { bg: '#d1fae5', color: '#059669', icon: '🖼',  label: 'IMG' },
  jpg:  { bg: '#d1fae5', color: '#059669', icon: '🖼',  label: 'IMG' },
  jpeg: { bg: '#d1fae5', color: '#059669', icon: '🖼',  label: 'IMG' },
}

function getFC(type) {
  return FILE_CONFIG[type?.toLowerCase()] || { bg: 'var(--surface-3)', color: 'var(--text-secondary)', icon: '📎', label: 'FILE' }
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 0', borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface-3)', flexShrink: 0, animation: 'pulse 1.4s ease-in-out infinite' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 12, borderRadius: 4, background: 'var(--surface-3)', width: '70%', animation: 'pulse 1.4s ease-in-out infinite' }} />
            <div style={{ height: 10, borderRadius: 4, background: 'var(--surface-3)', width: '40%', animation: 'pulse 1.4s ease-in-out infinite' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  Recent Resources Widget
// ══════════════════════════════════════════════════════════════════════════════
const RecentResources = React.memo(({ recentResources = [], loading }) => {
  const navigate = useNavigate()

  return (
    <div style={{
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📂</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Recent Resources
          </span>
        </div>
        <button
          onClick={() => navigate('/resources')}
          style={{
            fontSize: 12, fontWeight: 600, color: 'var(--primary)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >View all →</button>
      </div>

      {/* Content */}
      {loading ? (
        <Skeleton />
      ) : recentResources.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>No resources yet</p>
          <button
            onClick={() => navigate('/resources')}
            style={{
              marginTop: 10, fontSize: 12, fontWeight: 600, color: 'var(--primary)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >Upload your first file →</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recentResources.map((r, idx) => {
            const cfg = getFC(r.fileType)
            const fileUrl = `${BASE_URL}${r.fileUrl}`
            return (
              <a
                key={r._id}
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: idx < recentResources.length - 1 ? '1px solid var(--border)' : 'none',
                  textDecoration: 'none',
                  transition: 'opacity 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: cfg.bg, color: cfg.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {cfg.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    margin: 0, fontSize: 13, fontWeight: 600,
                    color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {r.title}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                    {r.subject} · {timeAgo(r.createdAt)}
                  </p>
                </div>

                {/* Badge */}
                <span style={{
                  padding: '2px 7px', borderRadius: 99, fontSize: 9, fontWeight: 700,
                  background: cfg.bg, color: cfg.color, letterSpacing: '0.04em', flexShrink: 0,
                }}>
                  {cfg.label}
                </span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
})

RecentResources.displayName = 'RecentResources'
export default RecentResources
