import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useTasks from '../../hooks/useTasks'
import TaskCard from '../../components/tasks/TaskCard'
import TaskModal from '../../components/tasks/TaskModal'
import TaskFilters from '../../components/tasks/TaskFilters'
import TaskStats from '../../components/tasks/TaskStats'

function CardSkeleton() {
  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 animate-pulse h-48 justify-between">
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <div className="h-5 w-1/2 bg-[var(--surface-3)] rounded" />
          <div className="h-4 w-12 bg-[var(--surface-2)] rounded-full" />
        </div>
        <div className="h-3 w-5/6 bg-[var(--surface-2)] rounded" />
        <div className="h-3 w-4/6 bg-[var(--surface-2)] rounded" />
      </div>
      <div className="flex justify-between items-center border-t border-[var(--border)] pt-3.5">
        <div className="h-3 w-1/3 bg-[var(--surface-2)] rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-6 bg-[var(--surface-2)] rounded" />
          <div className="h-6 w-6 bg-[var(--surface-2)] rounded" />
        </div>
      </div>
    </div>
  )
}

export default function Tasks() {
  const navigate = useNavigate()

  const {
    tasks,
    pagination,
    stats,
    loading,
    statsLoading,
    submitting,
    error,
    clearError,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    page,
    setPage,
    handleCreateTask,
    handleUpdateTask,
    handleToggleTaskStatus,
    handleDeleteTask
  } = useTasks()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [localError, setLocalError] = useState('')

  const handleOpenCreateModal = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleSaveTask = async (taskData) => {
    setLocalError('')
    try {
      if (editingTask) {
        await handleUpdateTask(editingTask._id, taskData)
      } else {
        await handleCreateTask(taskData)
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to save task')
      throw err
    }
  }

  const handleToggleTaskAction = async (id) => {
    try {
      await handleToggleTaskStatus(id)
    } catch (err) {
      setLocalError(err.message || 'Failed to toggle task status')
    }
  }

  const handleDeleteTaskAction = async (id) => {
    try {
      await handleDeleteTask(id)
    } catch (err) {
      setLocalError(err.message || 'Failed to delete task')
    }
  }

  const activeError = error || localError

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Back link & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium flex items-center gap-1 mb-2 bg-transparent border-none cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Task Manager 🏆</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Organize your homework, schedules, and study tasks.</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="self-start sm:self-center px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-semibold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>➕</span> New Task
        </button>
      </div>

      {/* Stats Row */}
      <TaskStats stats={stats} loading={statsLoading} />

      {/* Error Banner */}
      {activeError && (
        <div className="bg-[var(--danger-subtle)] border border-[var(--danger)] text-[var(--danger-text)] px-5 py-3 rounded-xl text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>⚠️</span>
            {activeError}
          </span>
          <button
            onClick={() => {
              setLocalError('')
              if (error) clearError()
            }}
            className="text-[var(--danger-text)] opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filters */}
      <TaskFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
      />

      {/* Tasks Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        /* Empty States */
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl gap-4 mt-2">
          <div className="text-5xl">🏜️</div>
          {searchQuery || statusFilter || priorityFilter ? (
            <>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">No tasks found</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm">No tasks match your active filters. Try clearing them.</p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('')
                  setPriorityFilter('')
                }}
                className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">All caught up!</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-sm">You don't have any tasks created. Plan your next milestone now!</p>
              <button
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] font-semibold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                Create Your First Task
              </button>
            </>
          )}
        </div>
      ) : (
        /* Tasks Render */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTaskAction}
              onToggle={handleToggleTaskAction}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 border-t border-[var(--border)] pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-[var(--surface-1)] border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer text-[var(--text-primary)]"
          >
            Previous
          </button>
          <span className="text-xs text-[var(--text-secondary)]">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
            disabled={page === pagination.pages}
            className="px-3 py-1.5 bg-[var(--surface-1)] border border-[var(--border)] hover:bg-[var(--surface-2)] disabled:opacity-30 disabled:pointer-events-none rounded-lg text-xs font-semibold tracking-wide transition-colors cursor-pointer text-[var(--text-primary)]"
          >
            Next
          </button>
        </div>
      )}

      {/* Task Modal overlay */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        submitting={submitting}
      />
    </div>
  )
}
