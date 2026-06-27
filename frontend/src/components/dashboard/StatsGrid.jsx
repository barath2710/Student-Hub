import React from 'react'
import StatsCard from './StatsCard'

const StatsGrid = React.memo(({ noteStats, taskStats, resourceStats, loading }) => {
  const { totalNotes = 0 } = noteStats || {}
  const {
    completedTasks = 0,
    pendingTasks = 0,
    overdueTasks = 0,
    dueTodayTasks = 0
  } = taskStats || {}
  const { totalResources = 0 } = resourceStats || {}

  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1 md:pb-0 md:grid md:grid-cols-3 lg:grid-cols-6 gap-4 scroll-smooth w-full">
      {/* 1. Study Notes */}
      <div className="min-w-[200px] flex-shrink-0 md:min-w-0 snap-center w-[80%] sm:w-auto md:w-full">
        <StatsCard
          emoji="📓"
          label="Study Notes"
          value={totalNotes}
          colorClass=""
          loading={loading}
        />
      </div>

      {/* 2. Pending Tasks */}
      <div className="min-w-[200px] flex-shrink-0 md:min-w-0 snap-center w-[80%] sm:w-auto md:w-full">
        <StatsCard
          emoji="⏳"
          label="Pending Tasks"
          value={pendingTasks}
          colorClass=""
          loading={loading}
        />
      </div>

      {/* 3. Completed Tasks */}
      <div className="min-w-[200px] flex-shrink-0 md:min-w-0 snap-center w-[80%] sm:w-auto md:w-full">
        <StatsCard
          emoji="✅"
          label="Completed"
          value={completedTasks}
          colorClass=""
          loading={loading}
        />
      </div>

      {/* 4. Due Today */}
      <div className="min-w-[200px] flex-shrink-0 md:min-w-0 snap-center w-[80%] sm:w-auto md:w-full">
        <StatsCard
          emoji="📅"
          label="Due Today"
          value={dueTodayTasks}
          colorClass=""
          loading={loading}
        />
      </div>

      {/* 5. Overdue (Alert Card) */}
      <div className="min-w-[200px] flex-shrink-0 md:min-w-0 snap-center w-[80%] sm:w-auto md:w-full">
        <StatsCard
          emoji="🚨"
          label="Overdue"
          value={overdueTasks}
          colorClass={overdueTasks > 0 ? "text-[var(--danger)] bg-[var(--danger-subtle)] border border-[var(--danger)]" : ""}
          loading={loading}
        />
      </div>

      {/* 6. Resources */}
      <div className="min-w-[200px] flex-shrink-0 md:min-w-0 snap-center w-[80%] sm:w-auto md:w-full">
        <StatsCard
          emoji="📂"
          label="Resources"
          value={totalResources}
          colorClass=""
          loading={loading}
        />
      </div>
    </div>
  )
})

StatsGrid.displayName = 'StatsGrid'
export default StatsGrid
