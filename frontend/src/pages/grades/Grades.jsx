import { useState, useEffect, useCallback, useMemo } from 'react'

// ─── localStorage helpers ──────────────────────────────────────────────────────
const GRADES_KEY      = 'studenthub_grades'
const ASSIGNMENTS_KEY = 'studenthub_assignments'
const COURSES_KEY     = 'studenthub_courses'
const load = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] } }
const save = (data) => localStorage.setItem(GRADES_KEY, JSON.stringify(data))

// ─── Icons ─────────────────────────────────────────────────────────────────────
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
)
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
  </svg>
)
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M9 6V4h6v2" />
  </svg>
)

// ─── Grade helpers ─────────────────────────────────────────────────────────────
function scoreToLetter(pct) {
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  return 'F'
}
function letterToGPA(letter) {
  const map = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 }
  return map[letter] ?? 0
}
function gradeColor(pct) {
  if (pct >= 90) return '#16A34A'
  if (pct >= 80) return '#2563EB'
  if (pct >= 70) return '#D97706'
  if (pct >= 60) return '#DC2626'
  return '#7F1D1D'
}

// ─── Grade Entry Modal ─────────────────────────────────────────────────────────
function GradeModal({ grade, courses, assignments, onSave, onClose }) {
  const [form, setForm] = useState({
    subject:      grade?.subject       ?? '',
    courseId:     grade?.courseId      ?? '',
    assignmentId: grade?.assignmentId  ?? '',
    type:         grade?.type          ?? 'assignment',
    score:        grade?.score         ?? '',
    maxScore:     grade?.maxScore      ?? 100,
    semester:     grade?.semester      ?? '',
    notes:        grade?.notes         ?? '',
  })

  const pct = form.score !== '' ? Math.round((Number(form.score) / Number(form.maxScore)) * 100) : null
  const letter = pct !== null ? scoreToLetter(pct) : '—'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.subject.trim() && !form.courseId) return
    onSave({
      ...grade,
      ...form,
      score: Number(form.score),
      maxScore: Number(form.maxScore),
      id: grade?.id ?? Date.now().toString(),
      createdAt: grade?.createdAt ?? new Date().toISOString(),
      percentage: pct,
      letter,
    })
    onClose()
  }

  const inputSt = { width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-enter" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-xl)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 24px', letterSpacing: '-0.02em' }}>
          {grade ? 'Edit Grade' : 'Add Grade'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subject *</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g. Data Structures" required autoFocus style={inputSt} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Course</label>
              <select value={form.courseId} onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))} style={inputSt}>
                <option value="">— None —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputSt}>
                {['assignment', 'quiz', 'midterm', 'final', 'project', 'lab', 'presentation'].map(t => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Semester</label>
              <input value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} placeholder="Fall 2025" style={inputSt} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score</label>
              <input type="number" min="0" max={form.maxScore} value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} placeholder="87" style={inputSt} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Out of</label>
              <input type="number" min="1" value={form.maxScore} onChange={e => setForm(f => ({ ...f, maxScore: e.target.value }))} style={inputSt} />
            </div>
          </div>

          {/* Live preview */}
          {pct !== null && (
            <div style={{ display: 'flex', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--border)', alignItems: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: gradeColor(pct), letterSpacing: '-0.04em' }}>{letter}</div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{pct}%</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>GPA Points: {letterToGPA(letter).toFixed(1)}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any remarks..." rows={2} style={{ ...inputSt, resize: 'none' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: 'var(--primary)', color: 'var(--text-inverse)', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              {grade ? 'Save' : 'Add Grade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Grade Row ─────────────────────────────────────────────────────────────────
function GradeRow({ grade, course, onEdit, onDelete }) {
  const pct = grade.percentage ?? (grade.score !== undefined ? Math.round((grade.score / grade.maxScore) * 100) : null)
  const letter = grade.letter ?? (pct !== null ? scoreToLetter(pct) : '—')
  const color = pct !== null ? gradeColor(pct) : 'var(--text-secondary)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px', boxShadow: 'var(--shadow-card)', transition: 'border-color 0.15s ease' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Grade letter */}
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${color}15`, border: `2px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: '18px', fontWeight: 800, color, letterSpacing: '-0.02em' }}>{letter}</span>
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px', letterSpacing: '-0.01em' }}>
          {grade.subject}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {course && <span style={{ fontSize: '11px', color: course.color, fontWeight: 600 }}>{course.code || course.name}</span>}
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{grade.type}</span>
          {grade.semester && <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{grade.semester}</span>}
        </div>
      </div>

      {/* Score */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color, letterSpacing: '-0.02em' }}>
          {pct !== null ? `${pct}%` : '—'}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
          {grade.score}/{grade.maxScore}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
        <ActionBtn onClick={() => onEdit(grade)}><EditIcon /></ActionBtn>
        <ActionBtn onClick={() => onDelete(grade.id)} danger><TrashIcon /></ActionBtn>
      </div>
    </div>
  )
}

function ActionBtn({ onClick, danger, children }) {
  return (
    <button onClick={onClick} style={{ width: '28px', height: '28px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s ease' }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? 'var(--danger-subtle)' : 'var(--surface-2)'; e.currentTarget.style.color = danger ? 'var(--danger)' : 'var(--text-primary)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
    >
      {children}
    </button>
  )
}

// ─── GPA Ring ─────────────────────────────────────────────────────────────────
function GPARing({ gpa }) {
  const pct = (gpa / 4.0) * 100
  const SIZE = 120, STROKE = 10, R = (SIZE - STROKE * 2) / 2
  const CIRC = 2 * Math.PI * R
  const offset = CIRC * (1 - pct / 100)
  const color = gpa >= 3.5 ? '#16A34A' : gpa >= 3.0 ? '#2563EB' : gpa >= 2.0 ? '#D97706' : '#DC2626'

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--surface-3)" strokeWidth={STROKE} />
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round"
          strokeDasharray={CIRC} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }} />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color, letterSpacing: '-0.04em', lineHeight: 1 }}>{gpa.toFixed(2)}</div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>GPA</div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Grades() {
  const [grades, setGrades]           = useState([])
  const [courses, setCourses]         = useState([])
  const [assignments, setAssignments] = useState([])
  const [modalOpen, setModalOpen]     = useState(false)
  const [editTarget, setEditTarget]   = useState(null)
  const [filter, setFilter]           = useState('all')

  useEffect(() => {
    setGrades(load(GRADES_KEY))
    setCourses(load(COURSES_KEY))
    setAssignments(load(ASSIGNMENTS_KEY))
  }, [])

  const persist = useCallback((updated) => { setGrades(updated); save(updated) }, [])

  const handleSave    = (g) => { const ex = grades.find(x => x.id === g.id); persist(ex ? grades.map(x => x.id === g.id ? g : x) : [g, ...grades]) }
  const handleDelete  = (id) => { if (!window.confirm('Delete this grade?')) return; persist(grades.filter(g => g.id !== id)) }

  const courseMap = Object.fromEntries(courses.map(c => [c.id, c]))

  // GPA calculation
  const { gpa, gradeDistribution } = useMemo(() => {
    const valid = grades.filter(g => g.percentage !== null && g.percentage !== undefined)
    if (valid.length === 0) return { gpa: 0, gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 } }
    const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    let total = 0
    valid.forEach(g => {
      const l = g.letter ?? scoreToLetter(g.percentage)
      dist[l] = (dist[l] || 0) + 1
      total += letterToGPA(l)
    })
    return { gpa: total / valid.length, gradeDistribution: dist }
  }, [grades])

  // Filter by subject/course
  const semesters = [...new Set(grades.map(g => g.semester).filter(Boolean))]
  const filtered = (filter === 'all' ? grades : grades.filter(g => g.semester === filter))
    .slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const avgPct = filtered.length === 0 ? null
    : Math.round(filtered.reduce((s, g) => s + (g.percentage ?? 0), 0) / filtered.length)

  const distMax = Math.max(...Object.values(gradeDistribution), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1000px', margin: '0 auto' }} className="page-enter">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Grades</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
            Track scores, calculate your GPA, and monitor academic performance.
          </p>
        </div>
        <button
          id="add-grade-btn"
          onClick={() => { setEditTarget(null); setModalOpen(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'var(--text-inverse)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
        >
          <PlusIcon /> Add Grade
        </button>
      </div>

      {/* Summary panel */}
      {grades.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-md)', flexWrap: 'wrap' }}>
          {/* GPA ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <GPARing gpa={gpa} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Cumulative GPA
            </span>
          </div>

          {/* Distribution bars + quick stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
            {/* Quick stats */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {[
                { label: 'Total Grades', value: grades.length },
                { label: 'Avg Score', value: avgPct !== null ? `${avgPct}%` : '—' },
                { label: 'Highest', value: grades.length ? `${Math.max(...grades.map(g => g.percentage ?? 0))}%` : '—' },
                { label: 'Lowest', value: grades.length ? `${Math.min(...grades.filter(g => g.percentage !== null).map(g => g.percentage))}%` : '—' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Grade distribution mini bar chart */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Grade Distribution</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '48px' }}>
                {Object.entries(gradeDistribution).map(([letter, count]) => {
                  const h = Math.max((count / distMax) * 100, count > 0 ? 10 : 0)
                  const col = gradeColor(letter === 'A' ? 95 : letter === 'B' ? 85 : letter === 'C' ? 75 : letter === 'D' ? 65 : 30)
                  return (
                    <div key={letter} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }} title={`${letter}: ${count}`}>
                      <div style={{ width: '100%', height: `${h}%`, borderRadius: '4px 4px 0 0', background: col, transition: 'height 0.4s ease', minHeight: count > 0 ? '4px' : '0', alignSelf: 'flex-end' }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: col }}>{letter}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Semester filter */}
      {semesters.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['all', ...semesters].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '5px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
              border: `1px solid ${filter === s ? 'var(--primary)' : 'var(--border)'}`,
              background: filter === s ? 'var(--primary)' : 'transparent',
              color: filter === s ? 'var(--text-inverse)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}>
              {s === 'all' ? 'All Semesters' : s}
            </button>
          ))}
        </div>
      )}

      {/* Grade list */}
      {filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '56px' }}>📊</span>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              {grades.length === 0 ? 'No grades recorded' : 'No grades this semester'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '340px' }}>
              {grades.length === 0
                ? 'Start adding your grades to track your GPA and academic progress.'
                : 'No grades found for the selected semester.'}
            </p>
          </div>
          {grades.length === 0 && (
            <button onClick={() => { setEditTarget(null); setModalOpen(true) }} style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'var(--text-inverse)', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              Add Your First Grade
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(g => (
            <GradeRow
              key={g.id}
              grade={g}
              course={courseMap[g.courseId]}
              onEdit={x => { setEditTarget(x); setModalOpen(true) }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <GradeModal
          grade={editTarget}
          courses={courses}
          assignments={assignments}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(null) }}
        />
      )}
    </div>
  )
}
