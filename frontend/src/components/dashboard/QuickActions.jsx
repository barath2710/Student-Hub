import React from 'react'
import { useNavigate } from 'react-router-dom'

const ActionButton = React.memo(({ emoji, title, desc, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-[var(--surface-1)] border border-[var(--border)] hover:bg-[var(--surface-2)] hover:border-[var(--border-strong)] rounded-2xl p-4 flex flex-col items-start text-left cursor-pointer transition-all duration-300 group hover:translate-y-[-2px] w-full"
    >
      <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">{emoji}</span>
      <h4 className="font-bold text-[var(--text-primary)] text-sm tracking-tight">{title}</h4>
      <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug">{desc}</p>
    </button>
  )
})
ActionButton.displayName = 'ActionButton'

const QuickActions = React.memo(({ onCreateTask, onCreateNote }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 flex flex-col gap-4 shadow-[var(--shadow-card)]">
      <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">
        Quick Access
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <ActionButton
          emoji="📖"
          title="Notes Hub"
          desc="Capture and search your course logs"
          onClick={() => navigate('/notes')}
        />
        <ActionButton
          emoji="📋"
          title="Task Hub"
          desc="Manage task statuses & deadlines"
          onClick={() => navigate('/tasks')}
        />
        <ActionButton
          emoji="➕📓"
          title="New Note"
          desc="Instantly record a lecture log"
          onClick={onCreateNote}
        />
        <ActionButton
          emoji="➕🏆"
          title="New Task"
          desc="Create a homework study item"
          onClick={onCreateTask}
        />
      </div>
    </div>
  )
})

QuickActions.displayName = 'QuickActions'
export default QuickActions
