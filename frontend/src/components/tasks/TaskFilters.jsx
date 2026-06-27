import React from 'react'

export default function TaskFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter
}) {
  return (
    <div className="flex flex-col gap-4 w-full bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 shadow-[var(--shadow-sm)]">
      {/* Search Input and Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3.5 flex items-center text-[var(--text-tertiary)] text-sm">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-primary)] focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3.5 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-xs bg-transparent border-none cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold pl-1">Status</label>
          <div className="flex bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-1">
            <button
              onClick={() => setStatusFilter('')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                statusFilter === ''
                  ? 'bg-[var(--surface-3)] text-[var(--text-primary)] border-[var(--border-strong)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-transparent'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                statusFilter === 'pending'
                  ? 'bg-[var(--surface-3)] text-[var(--text-primary)] border-[var(--border-strong)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-transparent'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                statusFilter === 'completed'
                  ? 'bg-[var(--surface-3)] text-[var(--text-primary)] border-[var(--border-strong)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-transparent'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold pl-1">Priority</label>
          <div className="flex bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-1">
            <button
              onClick={() => setPriorityFilter('')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                priorityFilter === ''
                  ? 'bg-[var(--surface-3)] text-[var(--text-primary)] border-[var(--border-strong)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-transparent'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setPriorityFilter('low')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                priorityFilter === 'low'
                  ? 'bg-[var(--success-subtle)] border-[var(--success)] text-[var(--success-text)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-transparent'
              }`}
            >
              Low
            </button>
            <button
              onClick={() => setPriorityFilter('medium')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                priorityFilter === 'medium'
                  ? 'bg-[var(--warning-subtle)] border-[var(--warning)] text-[var(--warning-text)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-transparent'
              }`}
            >
              Med
            </button>
            <button
              onClick={() => setPriorityFilter('high')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                priorityFilter === 'high'
                  ? 'bg-[var(--danger-subtle)] border-[var(--danger)] text-[var(--danger-text)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-transparent'
              }`}
            >
              High
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
