import React from 'react'

const ProductivityInsights = React.memo(({ taskStats, loading }) => {
  const {
    totalTasks = 0,
    completionRate = 0,
    priorityBreakdown = { low: 0, medium: 0, high: 0 }
  } = taskStats || {}

  const getFeedbackMessage = () => {
    if (totalTasks === 0) return 'Create some study tasks to track your productivity.'
    if (completionRate <= 30) return 'Focus on starting your pending items today.'
    if (completionRate <= 70) return 'You are making steady progress. Keep going!'
    return 'Outstanding academic productivity today!'
  }

  const getFeedbackEmoji = () => {
    if (totalTasks === 0) return '📝'
    if (completionRate <= 30) return '🎯'
    if (completionRate <= 70) return '⚡'
    return '🔥'
  }

  // Calculate percentages for priority bar
  const totalPriorities = priorityBreakdown.low + priorityBreakdown.medium + priorityBreakdown.high
  const lowPercent = totalPriorities > 0 ? (priorityBreakdown.low / totalPriorities) * 100 : 0
  const mediumPercent = totalPriorities > 0 ? (priorityBreakdown.medium / totalPriorities) * 100 : 0
  const highPercent = totalPriorities > 0 ? (priorityBreakdown.high / totalPriorities) * 100 : 0

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 shadow-[var(--shadow-card)]">
      <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
        Productivity Insights
      </h3>

      <div className="flex items-center gap-5">
        {/* Progress Ring */}
        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[var(--surface-3)]"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[var(--text-primary)] transition-all duration-500 ease-out"
              strokeWidth="3"
              strokeDasharray={`${loading ? 0 : completionRate}, 100`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-[var(--text-primary)] leading-none">
              {loading ? '...' : `${completionRate}%`}
            </span>
            <span className="text-[7px] text-[var(--text-tertiary)] uppercase tracking-wider font-bold mt-0.5">Rate</span>
          </div>
        </div>

        {/* Text Insight */}
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">{getFeedbackEmoji()}</span>
            <h4 className="font-bold text-[var(--text-primary)] text-xs leading-tight">Status Insight</h4>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1 leading-normal max-w-[180px] md:max-w-none">
            {loading ? 'Analyzing your profile stats...' : getFeedbackMessage()}
          </p>
        </div>
      </div>

      {/* Priority Stack Bar */}
      <div className="flex flex-col gap-1.5 mt-2 border-t border-[var(--border)] pt-3.5">
        <label className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">Priority distribution</label>
        
        {totalPriorities === 0 ? (
          <p className="text-[10px] text-[var(--text-tertiary)] italic">No tasks mapped to priorities.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {/* The multi-colored bar */}
            <div className="w-full h-2.5 bg-[var(--surface-2)] rounded-full overflow-hidden flex">
              <div
                className="bg-[var(--success)] h-full transition-all duration-300"
                style={{ width: `${lowPercent}%` }}
                title={`Low Priority: ${priorityBreakdown.low}`}
              />
              <div
                className="bg-[var(--warning)] h-full transition-all duration-300"
                style={{ width: `${mediumPercent}%` }}
                title={`Medium Priority: ${priorityBreakdown.medium}`}
              />
              <div
                className="bg-[var(--danger)] h-full transition-all duration-300"
                style={{ width: `${highPercent}%` }}
                title={`High Priority: ${priorityBreakdown.high}`}
              />
            </div>

            {/* Legend labels */}
            <div className="flex justify-between items-center text-[9px] text-[var(--text-secondary)] font-semibold px-0.5">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                Low ({priorityBreakdown.low})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                Medium ({priorityBreakdown.medium})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" />
                High ({priorityBreakdown.high})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

ProductivityInsights.displayName = 'ProductivityInsights'
export default ProductivityInsights
