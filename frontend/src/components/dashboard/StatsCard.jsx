import React from 'react'

const StatsCard = React.memo(({ emoji, label, value, colorClass, loading }) => {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:translate-y-[-3px] hover:shadow-[var(--shadow-md)] select-none snap-center">
      {/* Icon frame */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-[var(--surface-2)] border border-[var(--border)] ${colorClass || ''}`}>
        {emoji}
      </div>

      {/* Stats value */}
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-bold text-[var(--text-primary)] leading-none tracking-tight">
          {loading ? (
            <span className="inline-block w-12 h-6 bg-[var(--surface-2)] rounded animate-pulse" />
          ) : (
            value
          )}
        </p>
        <p className="text-xs text-[var(--text-secondary)] font-medium truncate mt-1.5 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  )
})

StatsCard.displayName = 'StatsCard'
export default StatsCard
