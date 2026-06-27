import React from 'react'

const DashboardHeader = React.memo(({ userName, streak }) => {
  const getGreeting = () => {
    const hours = new Date().getHours()
    if (hours < 12) return 'Good morning'
    if (hours < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="flex flex-col gap-1.5 md:flex-row md:justify-between md:items-end w-full">
      <div>
        <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest">
          📅 {getFormattedDate()}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight mt-1.5 text-[var(--text-primary)]">
          {getGreeting()},{' '}
          <span className="text-[var(--text-primary)]">
            {userName || 'Student'}
          </span>{' '}
          👋
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Here is an overview of your academic and study goals.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        {streak > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-extrabold shadow-sm select-none animate-[scaleIn_0.2s_ease-out]">
            <span>🔥</span>
            <span>{streak} Day Streak</span>
          </div>
        )}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-[var(--surface-1)] border border-[var(--border)] rounded-full text-xs font-semibold text-[var(--text-secondary)] shadow-sm select-none">
          <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-ping" />
          Synced
        </div>
      </div>
    </div>
  )
})

DashboardHeader.displayName = 'DashboardHeader'
export default DashboardHeader
