import React from 'react'

function StatCard({ label, value, emoji, colorClass, loading }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl px-5 py-4 flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]">
      <span className={`text-2xl w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)] ${colorClass}`}>
        {emoji}
      </span>
      <div>
        <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-bold">{label}</p>
        <p className="text-xl font-bold text-[var(--text-primary)] leading-none mt-1">
          {loading ? (
            <span className="inline-block w-8 h-5 bg-[var(--surface-3)] rounded animate-pulse" />
          ) : (
            value
          )}
        </p>
      </div>
    </div>
  )
}

export default function TaskStats({ stats, loading }) {
  const {
    totalTasks = 0,
    completedTasks = 0,
    pendingTasks = 0,
    overdueTasks = 0,
    dueTodayTasks = 0,
    completionRate = 0,
    priorityBreakdown = { low: 0, medium: 0, high: 0 }
  } = stats || {}

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Tasks"
          value={totalTasks}
          emoji="📋"
          colorClass="text-[var(--text-primary)]"
          loading={loading}
        />
        <StatCard
          label="Pending"
          value={pendingTasks}
          emoji="⏳"
          colorClass="text-[var(--warning-text)]"
          loading={loading}
        />
        <StatCard
          label="Completed"
          value={completedTasks}
          emoji="✅"
          colorClass="text-[var(--success-text)]"
          loading={loading}
        />
        <StatCard
          label="Due Today"
          value={dueTodayTasks}
          emoji="📅"
          colorClass="text-[var(--primary)]"
          loading={loading}
        />
        <StatCard
          label="Overdue"
          value={overdueTasks}
          emoji="🚨"
          colorClass="text-[var(--danger-text)]"
          loading={loading}
        />
      </div>

      {/* Completion & Priorities Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Completion Progress Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-[var(--shadow-sm)]">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Completion Rate</h4>
            <span className="text-2xl font-extrabold text-[var(--primary)]">{loading ? '...' : `${completionRate}%`}</span>
          </div>

          <div className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-full h-4 overflow-hidden p-[2px]">
            <div
              className="bg-[var(--primary)] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${loading ? 0 : Math.min(Math.max(completionRate, 0), 100)}%` }}
            />
          </div>

          <p className="text-xs text-[var(--text-tertiary)]">
            {completedTasks} of {totalTasks} tasks completed. Keep going!
          </p>
        </div>

        {/* Priority Breakdown Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-[var(--shadow-sm)]">
          <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Priority Distribution</h4>
          
          <div className="flex items-center justify-between gap-4 w-full">
            {/* Low Priority */}
            <div className="flex flex-col items-center flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl py-2 px-3">
              <span className="text-xs text-[var(--success-text)] font-semibold mb-1">Low</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">
                {loading ? '...' : priorityBreakdown.low}
              </span>
            </div>

            {/* Medium Priority */}
            <div className="flex flex-col items-center flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl py-2 px-3">
              <span className="text-xs text-[var(--warning-text)] font-semibold mb-1">Medium</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">
                {loading ? '...' : priorityBreakdown.medium}
              </span>
            </div>

            {/* High Priority */}
            <div className="flex flex-col items-center flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl py-2 px-3">
              <span className="text-xs text-[var(--danger-text)] font-semibold mb-1">High</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">
                {loading ? '...' : priorityBreakdown.high}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
