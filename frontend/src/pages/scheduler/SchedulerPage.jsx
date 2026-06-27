import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStudyPlans, createStudyPlan, updateBlockStatus, deleteStudyPlan } from '../../services/studyPlanService'

export default function SchedulerPage() {
  const navigate = useNavigate()

  // ─── State
  const [plans, setPlans] = useState([])
  const [activePlan, setActivePlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // ─── Selected Date State (for calendar details)
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })

  // ─── Calendar Month State
  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  // ─── Form State
  const [form, setForm] = useState({
    title: '',
    subject: '',
    targetDate: '',
    intensity: 'balanced',
    syllabus: ''
  })

  // ─── Load Study Plans
  const fetchPlans = async (selectLatest = false) => {
    try {
      setLoading(true)
      const data = await getStudyPlans()
      setPlans(data)
      if (data.length > 0) {
        // Default to first/latest active plan
        if (selectLatest) {
          setActivePlan(data[0])
        } else {
          // Keep active plan selection if it exists in the new dataset
          const currentActive = data.find(p => p._id === activePlan?._id)
          setActivePlan(currentActive || data[0])
        }
      } else {
        setActivePlan(null)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch study plans')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans(true)
  }, [])

  // ─── Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCreatePlan = async (e) => {
    e.preventDefault()
    setError('')
    setGenerating(true)
    try {
      const newPlan = await createStudyPlan(form)
      await fetchPlans()
      setActivePlan(newPlan)
      setIsModalOpen(false)
      // Reset form
      setForm({
        title: '',
        subject: '',
        targetDate: '',
        intensity: 'balanced',
        syllabus: ''
      })
    } catch (err) {
      setError(err.message || 'Failed to generate study plan')
    } finally {
      setGenerating(false)
    }
  }

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study plan?')) return
    setError('')
    try {
      await deleteStudyPlan(id)
      await fetchPlans(true)
    } catch (err) {
      setError(err.message || 'Failed to delete study plan')
    }
  }

  // ─── Toggle Block Status
  const handleToggleBlock = async (blockId, currentStatus) => {
    if (!activePlan) return
    setError('')
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    try {
      // Optimistic Update
      setActivePlan(prev => {
        const updatedBlocks = prev.blocks.map(b => 
          b._id === blockId ? { ...b, status: newStatus } : b
        )
        return { ...prev, blocks: updatedBlocks }
      })

      await updateBlockStatus(activePlan._id, blockId, newStatus)
      // Refetch full data to keep sync
      const updatedPlans = await getStudyPlans()
      setPlans(updatedPlans)
      const freshActive = updatedPlans.find(p => p._id === activePlan._id)
      if (freshActive) setActivePlan(freshActive)
    } catch (err) {
      setError(err.message || 'Failed to update block status')
      // Rollback
      fetchPlans()
    }
  }

  // ─── Memoized Calculations for Active Plan
  const planStats = useMemo(() => {
    if (!activePlan || !activePlan.blocks || activePlan.blocks.length === 0) {
      return { total: 0, completed: 0, percentage: 0, daysRemaining: 0 }
    }

    const total = activePlan.blocks.length
    const completed = activePlan.blocks.filter(b => b.status === 'completed').length
    const percentage = Math.round((completed / total) * 100)

    const today = new Date()
    today.setHours(0,0,0,0)
    const target = new Date(activePlan.targetDate)
    target.setHours(0,0,0,0)
    const diffTime = target - today
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

    return { total, completed, percentage, daysRemaining }
  }, [activePlan])

  // ─── Active Blocks indexed by date map
  const blocksByDate = useMemo(() => {
    if (!activePlan || !activePlan.blocks) return {}
    const map = {}
    activePlan.blocks.forEach(b => {
      map[b.date] = b
    })
    return map
  }, [activePlan])

  // ─── Calendar Helpers
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const calendarDays = useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const days = []

    // Previous month padding
    const prevMonthTotalDays = new Date(year, month, 0).getDate()
    for (let i = firstDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthTotalDays - i)
      days.push({ date: prevDate, isCurrentMonth: false })
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const currentDate = new Date(year, month, i)
      days.push({ date: currentDate, isCurrentMonth: true })
    }

    // Next month padding to fill grid
    const remainingCells = 42 - days.length
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i)
      days.push({ date: nextDate, isCurrentMonth: false })
    }

    return days
  }, [year, month])

  const selectedDayBlock = activePlan ? blocksByDate[selectedDate] : null

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Header Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium flex items-center gap-1 mb-2 bg-transparent border-none cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">AI Study Planner 📅</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Jarvis-generated daily roadmap split from your syllabus.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-center px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-semibold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>✨</span> Create AI Study Plan
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="bg-[var(--danger-subtle)] border border-[var(--danger)] text-[var(--danger-text)] px-5 py-3 rounded-xl text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </span>
          <button onClick={() => setError('')} className="text-[var(--danger-text)] opacity-60 hover:opacity-100 cursor-pointer bg-transparent border-none">✕</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 text-[var(--text-secondary)]">
          <div className="flex flex-col items-center gap-2">
            <span className="animate-spin text-2xl">⏳</span>
            <span>Loading study roadmaps...</span>
          </div>
        </div>
      ) : plans.length === 0 ? (
        /* ── Empty State ── */
        <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl gap-5">
          <div className="text-6xl">🗓️</div>
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">No active study roadmaps</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mt-1">Generate a day-by-day roadmap with Jarvis to prepare for exams efficiently.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer"
          >
            Create Your First Plan
          </button>
        </div>
      ) : (
        /* ── Active Planner Workspace ── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ── Left Column: Plan Selector & Calendar ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Plan selector block */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl">
              <div className="flex flex-col gap-1 w-full max-w-md">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Active Study Roadmap</label>
                <select
                  value={activePlan?._id || ''}
                  onChange={(e) => {
                    const plan = plans.find(p => p._id === e.target.value)
                    if (plan) {
                      setActivePlan(plan)
                    }
                  }}
                  className="w-full px-3 py-2 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] font-medium"
                >
                  {plans.map(p => (
                    <option key={p._id} value={p._id}>{p.subject} – {p.title}</option>
                  ))}
                </select>
              </div>

              {activePlan && (
                <button
                  onClick={() => handleDeletePlan(activePlan._id)}
                  className="px-4 py-2 border border-[var(--danger)] hover:bg-[var(--danger-subtle)] text-[var(--danger)] font-medium rounded-xl text-xs transition-colors cursor-pointer self-start sm:self-end"
                >
                  🗑️ Delete Plan
                </button>
              )}
            </div>

            {/* Calendar Widget */}
            <div className="p-6 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl flex flex-col gap-5">
              
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-[var(--text-primary)] text-lg flex items-center gap-2">
                  <span>📅</span>
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                  >
                    ◀
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="px-3 py-2 border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] rounded-lg text-xs font-semibold hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* Weekdays Header */}
              <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[var(--text-secondary)] text-xs border-b border-[var(--border)] pb-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((cell, index) => {
                  const dateString = cell.date.toISOString().split('T')[0]
                  const hasBlock = blocksByDate[dateString]
                  const isSelected = dateString === selectedDate
                  const isToday = new Date().toISOString().split('T')[0] === dateString

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(dateString)}
                      style={{ aspectRatio: '1.2' }}
                      className={`relative flex flex-col items-start p-2 border rounded-xl transition-all cursor-pointer select-none text-left
                        ${cell.isCurrentMonth ? 'text-[var(--text-primary)] bg-[var(--surface-1)]' : 'text-[var(--text-tertiary)] bg-transparent border-dashed'}
                        ${isSelected ? 'border-[var(--primary)] ring-2 ring-[var(--primary-subtle)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'}
                      `}
                    >
                      {/* Day Number */}
                      <span className={`text-xs font-bold ${isToday ? 'bg-[var(--primary)] text-[var(--text-inverse)] w-5 h-5 flex items-center justify-center rounded-full' : ''}`}>
                        {cell.date.getDate()}
                      </span>

                      {/* Study Block Indicator */}
                      {hasBlock && (
                        <div className={`mt-auto w-full rounded px-1.5 py-0.5 text-[9px] font-semibold truncate
                          ${hasBlock.status === 'completed' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' 
                            : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'}
                        `}>
                          {hasBlock.topic}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

          {/* ── Right Column: Selected Day Detail & Plan Stats ── */}
          <div className="flex flex-col gap-6">
            
            {/* Stats Dashboard */}
            <div className="p-5 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl flex flex-col gap-4">
              <h3 className="font-bold text-[var(--text-primary)] text-sm uppercase tracking-wider">Plan Summary</h3>
              
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <span className="text-xs text-[var(--text-secondary)] font-medium">Days until exam:</span>
                <span className="text-lg font-extrabold text-[var(--text-primary)]">
                  {planStats.daysRemaining} days ⏱️
                </span>
              </div>

              {/* Progress Ring */}
              <div className="flex flex-col gap-2 mt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--text-secondary)] font-medium">Syllabus Completion</span>
                  <span className="font-bold text-[var(--text-primary)]">{planStats.percentage}%</span>
                </div>
                <div className="w-full bg-[var(--surface-3)] h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[var(--primary)] h-full transition-all duration-300"
                    style={{ width: `${planStats.percentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                  Completed {planStats.completed} of {planStats.total} study blocks.
                </p>
              </div>
            </div>

            {/* Selected Day Block Details */}
            <div className="p-6 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl flex flex-col gap-5">
              <div>
                <h3 className="font-bold text-[var(--text-secondary)] text-xs uppercase tracking-wider">Selected Day Plan</h3>
                <h4 className="font-bold text-[var(--text-primary)] text-sm mt-1">
                  {new Date(selectedDate).toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h4>
              </div>

              {selectedDayBlock ? (
                <div className="flex flex-col gap-5">
                  <div className="p-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl flex flex-col gap-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary-subtle)] px-2 py-0.5 rounded w-fit">
                      Daily Topic
                    </span>
                    <h5 className="font-bold text-[var(--text-primary)] text-base leading-tight">
                      {selectedDayBlock.topic}
                    </h5>
                    
                    <div className="flex gap-4 text-xs text-[var(--text-secondary)] mt-1.5 pt-2 border-t border-[var(--border)]">
                      <span className="flex items-center gap-1 font-medium">
                        ⏱️ {selectedDayBlock.duration} mins
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        🍅 {selectedDayBlock.pomodoroCount} Pomodoros
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleToggleBlock(selectedDayBlock._id, selectedDayBlock.status)}
                      className={`w-full py-3 px-4 font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2
                        ${selectedDayBlock.status === 'completed'
                          ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-300'
                          : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] shadow-md'}
                      `}
                    >
                      {selectedDayBlock.status === 'completed' ? (
                        <>
                          <span>✓</span> Completed! (Mark Pending)
                        </>
                      ) : (
                        <>
                          <span>✓</span> Mark Day Completed
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => navigate('/pomodoro')}
                      className="w-full py-3 px-4 border border-[var(--border)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)] text-[var(--text-primary)] font-semibold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>🍅</span> Start Pomodoro Session
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 bg-[var(--surface-2)] rounded-xl border border-dashed border-[var(--border)] gap-2">
                  <div className="text-3xl">☕</div>
                  <h5 className="text-xs font-bold text-[var(--text-primary)]">Rest or Review Day</h5>
                  <p className="text-[11px] text-[var(--text-secondary)] max-w-[200px]">No study blocks scheduled for this date. Good day to catch up or take a break!</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ── Create Plan Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <h3 className="font-extrabold text-[var(--text-primary)] text-lg flex items-center gap-2">
                <span>✨</span> Generate AI study plan with Jarvis
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer text-lg bg-transparent border-none"
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreatePlan} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Subject */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Subject Name</label>
                  <input
                    type="text"
                    name="subject"
                    required
                    placeholder="e.g. Computer Networks"
                    value={form.subject}
                    onChange={handleInputChange}
                    className="px-3.5 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] text-sm font-medium"
                  />
                </div>
                
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Plan Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Midterm Preparation"
                    value={form.title}
                    onChange={handleInputChange}
                    className="px-3.5 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Target date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Exam / Target Date</label>
                  <input
                    type="date"
                    name="targetDate"
                    required
                    value={form.targetDate}
                    onChange={handleInputChange}
                    className="px-3.5 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] text-sm font-medium"
                  />
                </div>

                {/* Intensity */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Study Intensity</label>
                  <select
                    name="intensity"
                    value={form.intensity}
                    onChange={handleInputChange}
                    className="px-3.5 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] text-sm font-medium"
                  >
                    <option value="relaxed">Relaxed (30 min / day)</option>
                    <option value="balanced">Balanced (45-60 min / day)</option>
                    <option value="intense">Intense (90 min / day)</option>
                  </select>
                </div>
              </div>

              {/* Syllabus details */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Syllabus Topics / Outline</label>
                <textarea
                  name="syllabus"
                  required
                  rows={6}
                  placeholder="Paste syllabus modules, outline list, or topics to study. Add as many details as possible (separated by commas or lines) so Jarvis can allocate them correctly..."
                  value={form.syllabus}
                  onChange={handleInputChange}
                  className="px-3.5 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] text-sm font-medium resize-y"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text-secondary)] font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-semibold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Jarvis is generating...</span>
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      <span>Generate Roadmap</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
