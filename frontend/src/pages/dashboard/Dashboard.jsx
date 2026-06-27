import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useDashboard from '../../hooks/useDashboard'

import DashboardHeader    from '../../components/dashboard/DashboardHeader'
import StatsGrid          from '../../components/dashboard/StatsGrid'
import UpcomingTasks      from '../../components/dashboard/UpcomingTasks'
import RecentNotes        from '../../components/dashboard/RecentNotes'
import ProductivityInsights from '../../components/dashboard/ProductivityInsights'
import QuickActions       from '../../components/dashboard/QuickActions'
import RecentResources    from '../../components/dashboard/RecentResources'

import TaskModal from '../../components/tasks/TaskModal'
import NoteModal from '../../components/notes/NoteModal'

import * as taskService from '../../services/taskService'
import * as noteService from '../../services/noteService'

// ─── Error Banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="bg-[var(--danger-subtle)] border border-[var(--danger)] text-[var(--danger-text)] px-5 py-3 rounded-xl text-sm flex items-center justify-between">
      <span className="flex items-center gap-2">
        <span>⚠️</span>
        {message}
      </span>
      <button
        onClick={onDismiss}
        className="text-[var(--danger-text)] opacity-60 hover:opacity-100 transition-opacity cursor-pointer ml-4"
      >
        ✕
      </button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  Dashboard Page
// ══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user } = useAuth()

  const {
    noteStats,
    taskStats,
    resourceStats,
    recentNotes,
    upcomingTasks,
    recentResources,
    loading,
    error,
    clearError,
    refetch,
    handleToggleTask,
  } = useDashboard()

  // ── Quick-create modal state ────────────────────────────────────────────────
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [localError, setLocalError]           = useState('')
  const [submitting, setSubmitting]           = useState(false)

  // ── Quick create handlers ───────────────────────────────────────────────────
  const handleQuickCreateTask = async (taskData) => {
    setSubmitting(true)
    setLocalError('')
    try {
      await taskService.createTask(taskData, {
        timezoneOffset: new Date().getTimezoneOffset()
      })
      setIsTaskModalOpen(false)
      await refetch()
    } catch (err) {
      setLocalError(err.message || 'Failed to create task')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickCreateNote = async (noteData) => {
    setSubmitting(true)
    setLocalError('')
    try {
      await noteService.createNote(noteData)
      setIsNoteModalOpen(false)
      await refetch()
    } catch (err) {
      setLocalError(err.message || 'Failed to create note')
      throw err
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleTaskAction = async (id) => {
    try {
      await handleToggleTask(id)
    } catch (err) {
      setLocalError(err.message || 'Failed to update task')
    }
  }

  const activeError = error || localError

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header: Greeting + Date */}
      <DashboardHeader userName={user?.name?.split(' ')[0]} streak={user?.currentStreak} />

      {/* 2. KPI Stats Grid */}
      <StatsGrid noteStats={noteStats} taskStats={taskStats} resourceStats={resourceStats} loading={loading} />

      {/* 3. Error Banner */}
      {activeError && (
        <ErrorBanner
          message={activeError}
          onDismiss={() => {
            setLocalError('')
            if (error) clearError()
          }}
        />
      )}

      {/* 4. Main Workspace – asymmetric two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">

        {/* ── Left column: Upcoming Tasks + Recent Notes ──────────────── */}
        <div className="flex flex-col gap-5">
          {/* Action Required / Upcoming Tasks */}
          <UpcomingTasks
            tasks={upcomingTasks}
            loading={loading}
            onToggle={handleToggleTaskAction}
            onCreateTask={() => setIsTaskModalOpen(true)}
          />

          {/* Recent Notes */}
          <RecentNotes
            notes={recentNotes}
            loading={loading}
            onCreateNote={() => setIsNoteModalOpen(true)}
          />
        </div>

        {/* ── Right column: Insights + Quick Actions + Recent Resources ──────────────── */}
        <div className="flex flex-col gap-5">
          {/* Productivity Insights: ring + priority bar + feedback */}
          <ProductivityInsights
            taskStats={taskStats}
            loading={loading}
          />

          {/* Quick Actions: navigation + creation shortcuts */}
          <QuickActions
            onCreateTask={() => setIsTaskModalOpen(true)}
            onCreateNote={() => setIsNoteModalOpen(true)}
          />

          {/* Recent Resources */}
          <RecentResources
            recentResources={recentResources}
            loading={loading}
          />
        </div>
      </div>

      {/* ── Quick-create Task Modal ─────────────────────────────────────────── */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleQuickCreateTask}
        task={null}
        submitting={submitting}
      />

      {/* ── Quick-create Note Modal ─────────────────────────────────────────── */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleQuickCreateNote}
        note={null}
        submitting={submitting}
      />
    </div>
  )
}
