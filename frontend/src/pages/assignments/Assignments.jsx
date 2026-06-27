import { useState, useEffect, useCallback } from 'react'
import * as assignmentService from '../../services/assignmentService'
import * as courseService from '../../services/courseService'

// ─── Icons ─────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
)
const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
  </svg>
)
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
)
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M9 6V4h6v2" />
  </svg>
)

const STATUS_META = {
  'pending':     { color: 'var(--text-secondary)', bg: 'var(--surface-3)',      label: 'Pending' },
  'in-progress': { color: 'var(--warning-text)',   bg: 'var(--warning-subtle)', label: 'In Progress' },
  'submitted':   { color: '#2563EB',               bg: '#EFF6FF',               label: 'Submitted' },
  'graded':      { color: 'var(--success-text)',   bg: 'var(--success-subtle)', label: 'Graded' },
  'late':        { color: 'var(--danger-text)',    bg: 'var(--danger-subtle)',  label: 'Late' },
}

const PRIORITY_META = {
  low:    { color: 'var(--text-tertiary)', label: '●' },
  medium: { color: 'var(--warning)',       label: '●' },
  high:   { color: 'var(--danger)',        label: '●' },
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr) - Date.now()) / 86400000)
}

function DueBadge({ dateStr }) {
  const days = daysUntil(dateStr)
  if (days === null) return null
  const overdue = days < 0
  const urgent  = days >= 0 && days <= 2
  const color   = overdue ? 'var(--danger)' : urgent ? 'var(--warning)' : 'var(--text-secondary)'
  const label   = overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `${days}d left`
  return (
    <span style={{ fontSize: '11px', fontWeight: 600, color, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <CalIcon /> {label}
    </span>
  )
}

// ─── Field style helper ────────────────────────────────────────────────────────
const fld = { padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' }
const lbl = { fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }

// ─── Assignment Modal ──────────────────────────────────────────────────────────
function AssignmentModal({ assignment, courses, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    title:       assignment?.title       ?? '',
    courseId:    assignment?.courseId    ?? '',
    type:        assignment?.type        ?? 'homework',
    priority:    assignment?.priority    ?? 'medium',
    status:      assignment?.status      ?? 'pending',
    dueDate:     assignment?.dueDate
      ? new Date(assignment.dueDate).toISOString().slice(0, 10)
      : '',
    description: assignment?.description ?? '',
    maxGrade:    assignment?.maxGrade    ?? 100,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave({
      ...form,
      courseId: form.courseId || undefined,
      dueDate:  form.dueDate  || undefined,
    })
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-enter" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-xl)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
          {assignment ? 'Edit Assignment' : 'New Assignment'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Title */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Chapter 5 Problem Set" style={fld} autoFocus required />
          </div>

          {/* Course + Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={lbl}>Course</label>
              <select value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))} style={{ ...fld, cursor: 'pointer' }}>
                <option value="">— No Course —</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={lbl}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...fld, cursor: 'pointer' }}>
                {['homework','quiz','midterm','final','project','lab','other'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Due Date + Max Grade */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={lbl}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={fld} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={lbl}>Max Points</label>
              <input type="number" min="0" value={form.maxGrade} onChange={e => setForm(f => ({ ...f, maxGrade: Number(e.target.value) }))} style={{ ...fld, width: '100px' }} />
            </div>
          </div>

          {/* Priority + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={lbl}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={{ ...fld, cursor: 'pointer' }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={lbl}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ ...fld, cursor: 'pointer' }}>
                {['pending','in-progress','submitted','graded','late'].map(s => (
                  <option key={s} value={s}>{STATUS_META[s]?.label ?? s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={lbl}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Assignment details…" rows={3} style={{ ...fld, resize: 'vertical' }} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'var(--text-inverse)', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {saving && <span className="spinner" style={{ width: '14px', height: '14px', borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' }} />}
              {assignment ? 'Save Changes' : 'Add Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Assignment Card ───────────────────────────────────────────────────────────
function AssignmentCard({ assignment, onEdit, onDelete, onStatusChange }) {
  const sm = STATUS_META[assignment.status] ?? STATUS_META.pending
  const pm = PRIORITY_META[assignment.priority] ?? PRIORITY_META.medium
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'transform 0.15s, box-shadow 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', background: sm.bg, color: sm.color, textTransform: 'capitalize' }}>{sm.label}</span>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', background: 'var(--surface-2)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{assignment.type}</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button onClick={() => onEdit(assignment)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          ><EditIcon /></button>
          <button onClick={() => onDelete(assignment._id)} style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-subtle)'; e.currentTarget.style.color = 'var(--danger)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          ><TrashIcon /></button>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <span style={{ color: pm.color, fontSize: '10px' }}>{pm.label}</span>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{assignment.title}</h3>
        </div>
        {assignment.courseName && (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{assignment.courseName}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <DueBadge dateStr={assignment.dueDate} />
        <select
          value={assignment.status}
          onChange={e => onStatusChange(assignment._id, e.target.value)}
          style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none' }}
          onClick={e => e.stopPropagation()}
        >
          {['pending','in-progress','submitted','graded','late'].map(s => (
            <option key={s} value={s}>{STATUS_META[s]?.label ?? s}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '6px' }}><span className="skeleton" style={{ width: '70px', height: '20px' }} /><span className="skeleton" style={{ width: '60px', height: '20px' }} /></div>
      <span className="skeleton" style={{ width: '80%', height: '18px' }} />
      <span className="skeleton" style={{ width: '50%', height: '14px' }} />
      <span className="skeleton" style={{ width: '40%', height: '16px' }} />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Assignments() {
  const [assignments, setAssignments] = useState([])
  const [courses,     setCourses]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState('')
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [filter,      setFilter]      = useState('all')
  const [priority,    setPriority]    = useState('all')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [aRes, cRes] = await Promise.all([
        assignmentService.getAssignments(),
        courseService.getCourses(),
      ])
      setAssignments(aRes.data.data || [])
      setCourses(cRes.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async (formData) => {
    setSaving(true)
    try {
      if (editTarget) {
        const res = await assignmentService.updateAssignment(editTarget._id, formData)
        setAssignments(prev => prev.map(a => a._id === editTarget._id ? res.data.data : a))
      } else {
        const res = await assignmentService.createAssignment(formData)
        setAssignments(prev => [res.data.data, ...prev])
      }
      setModalOpen(false)
      setEditTarget(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save assignment')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return
    try {
      await assignmentService.deleteAssignment(id)
      setAssignments(prev => prev.filter(a => a._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete assignment')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const res = await assignmentService.updateAssignment(id, { status })
      setAssignments(prev => prev.map(a => a._id === id ? res.data.data : a))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleEdit = (a) => { setEditTarget(a); setModalOpen(true) }

  const filtered = assignments.filter(a => {
    if (filter   !== 'all' && a.status   !== filter)   return false
    if (priority !== 'all' && a.priority !== priority) return false
    return true
  })

  // Stats
  const overdue   = assignments.filter(a => daysUntil(a.dueDate) !== null && daysUntil(a.dueDate) < 0 && a.status !== 'submitted' && a.status !== 'graded').length
  const dueSoon   = assignments.filter(a => { const d = daysUntil(a.dueDate); return d !== null && d >= 0 && d <= 3 }).length
  const completed = assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length

  const STATUS_FILTERS   = ['all', 'pending', 'in-progress', 'submitted', 'graded', 'late']
  const PRIORITY_FILTERS = ['all', 'high', 'medium', 'low']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto' }} className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Assignments</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>Track and manage all your academic assignments.</p>
        </div>
        <button
          id="add-assignment-btn"
          onClick={() => { setEditTarget(null); setModalOpen(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'var(--text-inverse)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', transition: 'all 0.15s ease' }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }} onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)' }}
        >
          <PlusIcon /> New Assignment
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'var(--danger-subtle)', border: '1px solid var(--danger)', color: 'var(--danger-text)', padding: '12px 16px', borderRadius: '12px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
        </div>
      )}

      {/* Stats */}
      {!loading && assignments.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px' }}>
          {[
            { label: 'Total', value: assignments.length, icon: '📋' },
            { label: 'Overdue', value: overdue, icon: '🔴' },
            { label: 'Due Soon', value: dueSoon, icon: '⏰' },
            { label: 'Completed', value: completed, icon: '✅' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '18px' }}>{s.icon}</span>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {!loading && assignments.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginRight: '4px' }}>Status:</span>
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 12px', borderRadius: '100px', border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`, background: filter === f ? 'var(--primary)' : 'transparent', color: filter === f ? 'var(--text-inverse)' : 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s' }}>
              {STATUS_META[f]?.label ?? 'All'}
            </button>
          ))}
          <span style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 4px' }} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginRight: '4px' }}>Priority:</span>
          {PRIORITY_FILTERS.map(p => (
            <button key={p} onClick={() => setPriority(p)} style={{ padding: '5px 12px', borderRadius: '100px', border: `1px solid ${priority === p ? 'var(--primary)' : 'var(--border)'}`, background: priority === p ? 'var(--primary)' : 'transparent', color: priority === p ? 'var(--text-inverse)' : 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s' }}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[...Array(4)].map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '56px' }}>📋</span>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              {assignments.length === 0 ? 'No assignments yet' : 'No matching assignments'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '340px' }}>
              {assignments.length === 0 ? 'Create your first assignment to start tracking your academic workload.' : 'Try adjusting your filters.'}
            </p>
          </div>
          {assignments.length === 0 && (
            <button onClick={() => { setEditTarget(null); setModalOpen(true) }} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'var(--text-inverse)', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              Add First Assignment
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filtered.map(a => (
            <AssignmentCard key={a._id} assignment={a} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {modalOpen && (
        <AssignmentModal
          assignment={editTarget}
          courses={courses}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(null) }}
          saving={saving}
        />
      )}
    </div>
  )
}
