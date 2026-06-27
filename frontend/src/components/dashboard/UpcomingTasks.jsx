import React from 'react'
import { useNavigate } from 'react-router-dom'

function TaskRowSkeleton() {
  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-3 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-3 w-2/3">
        <div className="w-5 h-5 rounded bg-[var(--surface-2)]" />
        <div className="flex flex-col gap-1.5 w-full">
          <div className="h-4 bg-[var(--surface-3)] rounded w-1/2" />
          <div className="h-3 bg-[var(--surface-2)] rounded w-3/4" />
        </div>
      </div>
      <div className="h-4 bg-[var(--surface-2)] rounded w-12" />
    </div>
  )
}

const UpcomingTasks = React.memo(({ tasks, loading, onToggle, onCreateTask }) => {
  const navigate = useNavigate()

  const formatDueDate = (dateStr) => {
    if (!dateStr) return 'No due date'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getPriorityBorder = (p) => {
    switch (p) {
      case 'high':
        return 'border-l-[var(--danger)]'
      case 'medium':
        return 'border-l-[var(--warning)]'
      case 'low':
      default:
        return 'border-l-[var(--success)]'
    }
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 shadow-[var(--shadow-card)]">
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-2.5">
        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
          Action Required
        </h3>
        <button
          onClick={() => navigate('/tasks')}
          className="text-xs text-[var(--text-primary)] font-semibold transition-colors cursor-pointer bg-transparent border-none hover:underline"
        >
          View All Tasks →
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2.5">
          {[...Array(3)].map((_, i) => (
            <TaskRowSkeleton key={i} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-[var(--surface-1)] rounded-xl border border-[var(--border)] gap-3">
          <span className="text-3xl">🏜️</span>
          <p className="text-xs text-[var(--text-secondary)] max-w-[200px]">You are all caught up! No pending tasks require action.</p>
          <button
            onClick={onCreateTask}
            className="px-4 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`bg-[var(--surface-1)] hover:bg-[var(--surface-2)] border border-[var(--border)] border-l-4 ${getPriorityBorder(
                task.priority
              )} rounded-xl p-3 flex items-center justify-between gap-3 transition-all`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => onToggle(task._id)}
                  className="w-5 h-5 rounded border border-[var(--border-strong)] hover:border-[var(--text-primary)] hover:bg-[var(--surface-2)] flex items-center justify-center text-xs text-transparent hover:text-[var(--text-secondary)] transition-all cursor-pointer flex-shrink-0"
                >
                  ✓
                </button>
                <div className="min-w-0">
                  <h4 className="font-bold text-[var(--text-primary)] text-xs truncate leading-tight" title={task.title}>
                    {task.title}
                  </h4>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 truncate leading-snug">
                    {task.description || <span className="italic opacity-50">No description</span>}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
                <span className={`text-[9px] text-[var(--text-secondary)] font-medium ${task.isOverdue ? 'text-[var(--danger)] font-bold' : ''}`}>
                  {formatDueDate(task.dueDate)}
                </span>
                {task.isOverdue && (
                  <span className="text-[7px] uppercase tracking-widest font-bold text-[var(--danger-text)] bg-[var(--danger-subtle)] border border-[var(--danger)] px-1 py-[1px] rounded">
                    Overdue
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

UpcomingTasks.displayName = 'UpcomingTasks'
export default UpcomingTasks
