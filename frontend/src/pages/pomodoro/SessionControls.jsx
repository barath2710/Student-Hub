import { SESSION_TYPES } from '../../hooks/usePomodoroTimer'

// ─── Session type chip ─────────────────────────────────────────────────────────
function SessionChip({ type, current, onClick, color }) {
  const isActive = type === current
  return (
    <button
      id={`pomodoro-chip-${type}`}
      onClick={() => onClick(type)}
      aria-pressed={isActive}
      style={{
        padding:       '6px 16px',
        borderRadius:  '100px',
        border:        `1.5px solid ${isActive ? color : 'var(--border)'}`,
        background:    isActive ? `${color}18` : 'transparent',
        color:         isActive ? color : 'var(--text-secondary)',
        fontSize:      '13px',
        fontWeight:    isActive ? 700 : 500,
        cursor:        'pointer',
        transition:    'all 0.18s ease',
        whiteSpace:    'nowrap',
        letterSpacing: '0.01em',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.borderColor = color
          e.currentTarget.style.color = color
          e.currentTarget.style.background = `${color}0d`
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text-secondary)'
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      {SESSION_TYPES[type].label}
    </button>
  )
}

// ─── Control button ────────────────────────────────────────────────────────────
function CtrlBtn({ id, onClick, children, variant = 'primary', color, disabled }) {
  const isPrimary   = variant === 'primary'
  const isSecondary = variant === 'secondary'
  const isDanger    = variant === 'danger'

  const bg = isPrimary
    ? color
    : isSecondary
    ? 'var(--surface-2)'
    : 'var(--danger-subtle)'

  const textColor = isPrimary
    ? '#fff'
    : isDanger
    ? 'var(--danger)'
    : 'var(--text-secondary)'

  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '6px',
        padding:        isPrimary ? '14px 36px' : '12px 20px',
        borderRadius:   '12px',
        border:         isPrimary ? 'none' : '1.5px solid var(--border)',
        background:     bg,
        color:          textColor,
        fontSize:       isPrimary ? '16px' : '14px',
        fontWeight:     600,
        cursor:         disabled ? 'not-allowed' : 'pointer',
        opacity:        disabled ? 0.5 : 1,
        transition:     'all 0.15s ease',
        letterSpacing:  '-0.01em',
        boxShadow:      isPrimary ? `0 4px 20px ${color}44` : 'none',
        minWidth:       isPrimary ? '140px' : 'auto',
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.transform  = 'translateY(-1px)'
          e.currentTarget.style.boxShadow  = isPrimary
            ? `0 8px 28px ${color}55`
            : 'var(--shadow-sm)'
          if (isPrimary) e.currentTarget.style.filter = 'brightness(1.1)'
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          e.currentTarget.style.transform  = 'translateY(0)'
          e.currentTarget.style.boxShadow  = isPrimary ? `0 4px 20px ${color}44` : 'none'
          if (isPrimary) e.currentTarget.style.filter = 'brightness(1)'
        }
      }}
    >
      {children}
    </button>
  )
}

// ─── Icons ─────────────────────────────────────────────────────────────────────
const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)
const PauseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
)
const ResetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
)

// ─── SessionControls ──────────────────────────────────────────────────────────
export default function SessionControls({
  sessionType,
  isRunning,
  onStart,
  onPause,
  onReset,
  onChangeType,
  sessionCount,
  color,
}) {
  return (
    <div
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            '24px',
      }}
    >
      {/* ── Session type chips ── */}
      <div
        role="group"
        aria-label="Session type"
        style={{
          display: 'flex',
          gap:     '8px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {Object.entries(SESSION_TYPES).map(([type, cfg]) => (
          <SessionChip
            key={type}
            type={type}
            current={sessionType}
            onClick={onChangeType}
            color={cfg.color}
          />
        ))}
      </div>

      {/* ── Primary controls ── */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '12px',
        }}
      >
        {/* Reset */}
        <CtrlBtn
          id="pomodoro-reset-btn"
          onClick={onReset}
          variant="secondary"
          color={color}
        >
          <ResetIcon />
          Reset
        </CtrlBtn>

        {/* Start / Pause */}
        {isRunning ? (
          <CtrlBtn
            id="pomodoro-pause-btn"
            onClick={onPause}
            variant="primary"
            color={color}
          >
            <PauseIcon />
            Pause
          </CtrlBtn>
        ) : (
          <CtrlBtn
            id="pomodoro-start-btn"
            onClick={onStart}
            variant="primary"
            color={color}
          >
            <PlayIcon />
            {sessionCount > 0 ? 'Resume' : 'Start'}
          </CtrlBtn>
        )}
      </div>

      {/* ── Session counter badge ── */}
      {sessionCount > 0 && (
        <div
          style={{
            display:     'flex',
            alignItems:  'center',
            gap:         '6px',
            fontSize:    '13px',
            color:       'var(--text-secondary)',
            fontWeight:  500,
          }}
        >
          <span style={{ fontSize: '16px' }}>🍅</span>
          {sessionCount} focus session{sessionCount !== 1 ? 's' : ''} completed today
        </div>
      )}
    </div>
  )
}
