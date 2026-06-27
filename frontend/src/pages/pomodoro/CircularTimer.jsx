import { useMemo } from 'react'

// ─── CircularTimer ─────────────────────────────────────────────────────────────
// SVG-based circular countdown ring with progress animation.
// Props:
//   minutes, seconds   — display values
//   progress           — 0..1 fill amount
//   isRunning          — drives glow pulse animation
//   color              — accent colour for the ring
//   sessionLabel       — text label shown below the time
//   justCompleted      — triggers completion flash
// ──────────────────────────────────────────────────────────────────────────────
export default function CircularTimer({
  minutes,
  seconds,
  progress,
  isRunning,
  color,
  sessionLabel,
  justCompleted,
}) {
  const SIZE     = 280   // SVG viewport size
  const STROKE   = 12    // ring stroke width
  const RADIUS   = (SIZE - STROKE * 2) / 2
  const CX       = SIZE / 2
  const CY       = SIZE / 2
  const CIRC     = 2 * Math.PI * RADIUS

  // stroke-dashoffset: 0 = full ring, CIRC = empty ring
  const dashOffset = useMemo(() => CIRC * (1 - progress), [CIRC, progress])

  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  const glowColor = justCompleted ? '#22C55E' : color
  const ringColor = justCompleted ? '#22C55E' : color

  return (
    <div
      style={{
        position: 'relative',
        display:  'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        filter: isRunning
          ? `drop-shadow(0 0 24px ${glowColor}55)`
          : 'none',
        transition: 'filter 0.4s ease',
      }}
      aria-label={`Timer: ${mm}:${ss}`}
      role="timer"
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* ── Background track ── */}
        <circle
          cx={CX}
          cy={CY}
          r={RADIUS}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={STROKE}
        />

        {/* ── Progress ring ── */}
        <circle
          cx={CX}
          cy={CY}
          r={RADIUS}
          fill="none"
          stroke={ringColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={dashOffset}
          style={{
            transition:     'stroke-dashoffset 1s linear, stroke 0.4s ease',
            transformOrigin: `${CX}px ${CY}px`,
          }}
        />

        {/* ── Glowing dot at the tip ── */}
        {progress > 0 && progress < 1 && (
          <circle
            cx={CX + RADIUS * Math.cos(2 * Math.PI * progress - Math.PI / 2)}
            cy={CY + RADIUS * Math.sin(2 * Math.PI * progress - Math.PI / 2)}
            r={STROKE / 2 + 1}
            fill={ringColor}
            style={{ transition: 'cx 1s linear, cy 1s linear, fill 0.4s ease' }}
          />
        )}
      </svg>

      {/* ── Timer display (centre, rotated back) ── */}
      <div
        style={{
          position:  'absolute',
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        {/* Time digits */}
        <div
          style={{
            fontFamily:          'var(--font-sans)',
            fontSize:            '64px',
            fontWeight:          700,
            fontVariantNumeric:  'tabular-nums',
            letterSpacing:       '-0.04em',
            color:               'var(--text-primary)',
            lineHeight:          1,
            transition:          'color 0.3s ease',
          }}
        >
          {mm}
          <span
            style={{
              animation: isRunning ? 'timerBlink 1s step-start infinite' : 'none',
              display:   'inline-block',
            }}
          >
            :
          </span>
          {ss}
        </div>

        {/* Session type label */}
        <div
          style={{
            marginTop:  '8px',
            fontSize:   '13px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color:       color,
            opacity:     0.9,
          }}
        >
          {justCompleted ? '✓ Complete!' : sessionLabel}
        </div>
      </div>
    </div>
  )
}
