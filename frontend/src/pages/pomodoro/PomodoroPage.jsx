import { useState, useCallback } from 'react'
import { usePomodoroTimer } from '../../hooks/usePomodoroTimer'
import CircularTimer     from './CircularTimer'
import SessionControls   from './SessionControls'
import AnalyticsDashboard from './AnalyticsDashboard'

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  {
    id:    'timer',
    label: 'Timer',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id:    'analytics',
    label: 'Analytics',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6"  y1="20" x2="6"  y2="14" />
      </svg>
    ),
  },
]

// ─── Tab Button ────────────────────────────────────────────────────────────────
function TabBtn({ tab, active, onClick }) {
  return (
    <button
      id={`pomodoro-tab-${tab.id}`}
      role="tab"
      aria-selected={active}
      onClick={() => onClick(tab.id)}
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         '6px',
        padding:     '8px 20px',
        borderRadius: '100px',
        border:       'none',
        background:   active ? 'var(--primary)' : 'transparent',
        color:        active ? 'var(--text-inverse)' : 'var(--text-secondary)',
        fontSize:     '13px',
        fontWeight:   600,
        cursor:       'pointer',
        transition:   'all 0.15s ease',
        letterSpacing: '-0.01em',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = 'var(--surface-2)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }
      }}
    >
      {tab.icon}
      {tab.label}
    </button>
  )
}

// ─── PomodoroPage ─────────────────────────────────────────────────────────────
export default function PomodoroPage() {
  const [activeTab,   setActiveTab]   = useState('timer')
  const [refreshKey,  setRefreshKey]  = useState(0)

  // Refresh analytics every time a session completes
  const handleSessionComplete = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  const timer = usePomodoroTimer({ onSessionComplete: handleSessionComplete })

  return (
    <div
      className="page-enter"
      style={{
        display:       'flex',
        flexDirection: 'column',
        gap:           '28px',
        maxWidth:      '900px',
        margin:        '0 auto',
      }}
    >
      {/* ── Page header ── */}
      <div>
        <h1
          style={{
            fontSize:     '24px',
            fontWeight:   700,
            color:        'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin:       0,
          }}
        >
          Pomodoro Timer
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          Stay focused. Study smart. Track your progress.
        </p>
      </div>

      {/* ── Tab bar ── */}
      <div
        role="tablist"
        aria-label="Pomodoro sections"
        style={{
          display:     'flex',
          gap:         '4px',
          padding:     '4px',
          background:  'var(--surface-2)',
          borderRadius: '100px',
          width:       'fit-content',
          border:      '1px solid var(--border)',
        }}
      >
        {TABS.map(tab => (
          <TabBtn
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            onClick={setActiveTab}
          />
        ))}
      </div>

      {/* ── Timer Tab ── */}
      {activeTab === 'timer' && (
        <div
          role="tabpanel"
          aria-labelledby="pomodoro-tab-timer"
          style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            gap:            '40px',
            padding:        '48px 24px',
            background:     'var(--card-bg)',
            border:         '1px solid var(--border)',
            borderRadius:   '24px',
            boxShadow:      'var(--shadow-lg)',
            animation:      'slideUp 0.2s ease-out both',
            position:       'relative',
            overflow:       'hidden',
          }}
        >
          {/* Decorative background gradient */}
          <div
            aria-hidden="true"
            style={{
              position:     'absolute',
              top:          '-60px',
              left:         '50%',
              transform:    'translateX(-50%)',
              width:        '400px',
              height:       '300px',
              borderRadius: '50%',
              background:   `radial-gradient(ellipse, ${timer.config.color}12 0%, transparent 70%)`,
              pointerEvents: 'none',
              transition:   'background 0.4s ease',
            }}
          />

          {/* Circular timer */}
          <CircularTimer
            minutes={timer.minutes}
            seconds={timer.seconds}
            progress={timer.progress}
            isRunning={timer.isRunning}
            color={timer.config.color}
            sessionLabel={timer.config.label}
            justCompleted={timer.justCompleted}
          />

          {/* Controls */}
          <SessionControls
            sessionType={timer.sessionType}
            isRunning={timer.isRunning}
            onStart={timer.start}
            onPause={timer.pause}
            onReset={timer.reset}
            onChangeType={timer.changeSessionType}
            sessionCount={timer.sessionCount}
            color={timer.config.color}
          />

          {/* Tip */}
          <p
            style={{
              fontSize:  '12px',
              color:     'var(--text-tertiary)',
              textAlign: 'center',
              maxWidth:  '360px',
              lineHeight: 1.6,
              margin:    0,
            }}
          >
            Complete a focus session and it will automatically be saved to your analytics.
            Sessions shorter than 1 minute are not tracked.
          </p>
        </div>
      )}

      {/* ── Analytics Tab ── */}
      {activeTab === 'analytics' && (
        <div
          role="tabpanel"
          aria-labelledby="pomodoro-tab-analytics"
        >
          <AnalyticsDashboard refreshKey={refreshKey} />
        </div>
      )}
    </div>
  )
}
