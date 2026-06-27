import { useState, useEffect, useCallback } from 'react'
import * as courseService from '../../services/courseService'

const COLORS = [
  '#7C3AED', '#0D9488', '#D97706', '#DC2626',
  '#2563EB', '#DB2777', '#059669', '#EA580C',
]

// ─── Icons ─────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
)
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
)

// ─── Input / Label helpers ─────────────────────────────────────────────────────
const fieldStyle = {
  padding: '10px 14px', borderRadius: '10px',
  border: '1px solid var(--border)', background: 'var(--surface-2)',
  color: 'var(--text-primary)', fontSize: '14px',
  outline: 'none', width: '100%', boxSizing: 'border-box',
}
const labelStyle = {
  fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)',
  textTransform: 'uppercase', letterSpacing: '0.06em',
}

// ─── Course Modal ─────────────────────────────────────────────────────────────
function CourseModal({ course, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    name:       course?.name       ?? '',
    code:       course?.code       ?? '',
    instructor: course?.instructor ?? '',
    credits:    course?.credits    ?? 3,
    color:      course?.color      ?? COLORS[0],
    progress:   course?.progress   ?? 0,
    semester:   course?.semester   ?? '',
    status:     course?.status     ?? 'active',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="modal-enter"
        style={{
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
          {course ? 'Edit Course' : 'Add Course'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name + Code */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Course Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Data Structures"
                style={fieldStyle} autoFocus required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Code</label>
              <input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                placeholder="CS201"
                style={{ ...fieldStyle, width: '100px' }}
              />
            </div>
          </div>

          {/* Instructor + Credits */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Instructor</label>
              <input
                value={form.instructor}
                onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))}
                placeholder="Prof. Smith"
                style={fieldStyle}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Credits</label>
              <input
                type="number" min="1" max="6"
                value={form.credits}
                onChange={e => setForm(f => ({ ...f, credits: Number(e.target.value) }))}
                style={{ ...fieldStyle, width: '80px' }}
              />
            </div>
          </div>

          {/* Semester + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Semester</label>
              <input
                value={form.semester}
                onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                placeholder="Fall 2025"
                style={fieldStyle}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={labelStyle}>Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                style={{ ...fieldStyle, cursor: 'pointer' }}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={labelStyle}>Course Progress — {form.progress}%</label>
            <input
              type="range" min="0" max="100" step="5"
              value={form.progress}
              onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))}
              style={{ accentColor: form.color, width: '100%' }}
            />
          </div>

          {/* Color picker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={labelStyle}>Colour Tag</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button
                  key={c} type="button"
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: c, border: form.color === c ? `3px solid var(--text-primary)` : '2px solid transparent',
                    cursor: 'pointer', transition: 'transform 0.1s ease',
                    transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                    outline: 'none',
                  }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" onClick={onClose}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                border: '1px solid var(--border)', background: 'var(--surface-2)',
                color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: 'var(--primary)', color: 'var(--text-inverse)',
                fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)', opacity: saving ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {saving && <span className="spinner" style={{ width: '14px', height: '14px', borderColor: 'rgba(255,255,255,0.4)', borderTopColor: '#fff' }} />}
              {course ? 'Save Changes' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, onEdit, onDelete }) {
  const statusColors = {
    active:    { bg: 'var(--success-subtle)', text: 'var(--success-text)', border: 'var(--success)' },
    completed: { bg: 'var(--primary-subtle)', text: 'var(--primary-text)', border: 'var(--primary)' },
    dropped:   { bg: 'var(--danger-subtle)',  text: 'var(--danger-text)',  border: 'var(--danger)' },
  }
  const sc = statusColors[course.status] ?? statusColors.active

  return (
    <div
      style={{
        background: 'var(--card-bg)', border: '1px solid var(--border)',
        borderRadius: '18px', overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)' }}
    >
      <div style={{ height: '6px', background: course.color }} />

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {course.code && (
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em',
                padding: '2px 8px', borderRadius: '100px',
                background: `${course.color}18`, color: course.color,
                border: `1px solid ${course.color}30`, textTransform: 'uppercase',
              }}>
                {course.code}
              </span>
            )}
            <span style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em',
              padding: '2px 8px', borderRadius: '100px', textTransform: 'capitalize',
              background: sc.bg, color: sc.text, border: `1px solid ${sc.border}`,
            }}>
              {course.status}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <button
              onClick={() => onEdit(course)}
              style={{
                width: '28px', height: '28px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              title="Edit course"
            >
              <EditIcon />
            </button>
            <button
              onClick={() => onDelete(course._id)}
              style={{
                width: '28px', height: '28px', borderRadius: '8px',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-subtle)'; e.currentTarget.style.color = 'var(--danger)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              title="Delete course"
            >
              <TrashIcon />
            </button>
          </div>
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
          {course.name}
        </h3>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
          {course.instructor && <span>{course.instructor}</span>}
          {course.instructor && course.semester && <span> · </span>}
          {course.semester && <span>{course.semester}</span>}
          {course.credits > 0 && <span style={{ marginLeft: '4px', color: 'var(--text-tertiary)' }}>• {course.credits} credits</span>}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Progress</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: course.color }}>{course.progress}%</span>
          </div>
          <div style={{ height: '6px', borderRadius: '100px', background: 'var(--surface-3)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '100px', background: course.color,
              width: `${course.progress}%`, transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Skeleton loader ───────────────────────────────────────────────────────────
function CourseSkeleton() {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden' }}>
      <div style={{ height: '6px', background: 'var(--surface-3)' }} />
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="skeleton" style={{ width: '60px', height: '20px' }} />
          <span className="skeleton" style={{ width: '60px', height: '20px' }} />
        </div>
        <span className="skeleton" style={{ width: '70%', height: '20px' }} />
        <span className="skeleton" style={{ width: '50%', height: '14px' }} />
        <span className="skeleton" style={{ width: '100%', height: '6px', borderRadius: '100px' }} />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)
  const [filter,      setFilter]      = useState('all')

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const res = await courseService.getCourses()
      setCourses(res.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCourses() }, [fetchCourses])

  const handleSave = async (formData) => {
    setSaving(true)
    try {
      if (editTarget) {
        const res = await courseService.updateCourse(editTarget._id, formData)
        setCourses(prev => prev.map(c => c._id === editTarget._id ? res.data.data : c))
      } else {
        const res = await courseService.createCourse(formData)
        setCourses(prev => [res.data.data, ...prev])
      }
      setModalOpen(false)
      setEditTarget(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this course? This cannot be undone.')) return
    try {
      await courseService.deleteCourse(id)
      setCourses(prev => prev.filter(c => c._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course')
    }
  }

  const handleEdit = (course) => {
    setEditTarget(course)
    setModalOpen(true)
  }

  const filtered = filter === 'all' ? courses : courses.filter(c => c.status === filter)

  const totalCredits = courses.filter(c => c.status === 'active').reduce((s, c) => s + (c.credits || 0), 0)
  const avgProgress  = courses.length === 0 ? 0 : Math.round(courses.reduce((s, c) => s + c.progress, 0) / courses.length)

  const FILTERS = ['all', 'active', 'completed', 'dropped']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto' }} className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            My Courses
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Manage your enrolled courses and track academic progress.
          </p>
        </div>
        <button
          id="add-course-btn"
          onClick={() => { setEditTarget(null); setModalOpen(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '12px', border: 'none',
            background: 'var(--primary)', color: 'var(--text-inverse)',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)', transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.1)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'brightness(1)' }}
        >
          <PlusIcon /> Add Course
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'var(--danger-subtle)', border: '1px solid var(--danger)',
          color: 'var(--danger-text)', padding: '12px 16px', borderRadius: '12px',
          fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '16px' }}>✕</button>
        </div>
      )}

      {/* Stats */}
      {!loading && courses.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Total Courses',  value: courses.length,                                       icon: '📚' },
            { label: 'Active Credits', value: totalCredits,                                          icon: '⭐' },
            { label: 'Avg Progress',   value: `${avgProgress}%`,                                     icon: '📈' },
            { label: 'Completed',      value: courses.filter(c => c.status === 'completed').length,  icon: '✅' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--card-bg)', border: '1px solid var(--border)',
              borderRadius: '14px', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '8px',
              boxShadow: 'var(--shadow-card)',
            }}>
              <span style={{ fontSize: '20px' }}>{s.icon}</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      {!loading && courses.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px', borderRadius: '100px',
                border: `1px solid ${filter === f ? 'var(--primary)' : 'var(--border)'}`,
                background: filter === f ? 'var(--primary)' : 'transparent',
                color: filter === f ? 'var(--text-inverse)' : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                textTransform: 'capitalize', transition: 'all 0.15s ease',
              }}
            >
              {f}
              {f !== 'all' && (
                <span style={{ marginLeft: '6px', opacity: 0.7, fontSize: '11px' }}>
                  ({courses.filter(c => c.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[...Array(4)].map((_, i) => <CourseSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '40vh', gap: '16px', textAlign: 'center',
        }}>
          <span style={{ fontSize: '56px' }}>📚</span>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              {courses.length === 0 ? 'No courses yet' : `No ${filter} courses`}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '340px' }}>
              {courses.length === 0
                ? 'Add your first course to start tracking lectures, assignments, and academic progress.'
                : `You have no courses with "${filter}" status.`}
            </p>
          </div>
          {courses.length === 0 && (
            <button
              onClick={() => { setEditTarget(null); setModalOpen(true) }}
              style={{
                padding: '10px 24px', borderRadius: '12px', border: 'none',
                background: 'var(--primary)', color: 'var(--text-inverse)',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Add Your First Course
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filtered.map(course => (
            <CourseCard key={course._id} course={course} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <CourseModal
          course={editTarget}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(null) }}
          saving={saving}
        />
      )}
    </div>
  )
}
