import { useState, useEffect, useCallback } from 'react'
import { getAnalytics, getDailyBreakdown, getWeeklyBreakdown } from '../../services/pomodoroService'

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ id, icon, label, value, sub, accent, loading }) {
  return (
    <div
      id={id}
      style={{
        background:   'var(--card-bg)',
        border:       '1px solid var(--border)',
        borderRadius: '16px',
        padding:      '20px',
        display:      'flex',
        flexDirection: 'column',
        gap:          '12px',
        boxShadow:    'var(--shadow-card)',
        transition:   'transform 0.15s ease, box-shadow 0.15s ease',
        position:     'relative',
        overflow:     'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform  = 'translateY(-2px)'
        e.currentTarget.style.boxShadow  = 'var(--shadow-md)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform  = 'translateY(0)'
        e.currentTarget.style.boxShadow  = 'var(--shadow-card)'
      }}
    >
      {/* Accent glow blob */}
      <div
        style={{
          position:     'absolute',
          top:          '-20px',
          right:        '-20px',
          width:        '80px',
          height:       '80px',
          borderRadius: '50%',
          background:   `${accent}20`,
          filter:       'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      {/* Icon */}
      <div
        style={{
          width:          '40px',
          height:         '40px',
          borderRadius:   '10px',
          background:     `${accent}18`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       '18px',
        }}
      >
        {icon}
      </div>

      {/* Value */}
      {loading ? (
        <div className="skeleton" style={{ height: '32px', width: '80px', borderRadius: '6px' }} />
      ) : (
        <div
          style={{
            fontSize:    '28px',
            fontWeight:  700,
            color:       'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight:  1,
          }}
        >
          {value}
        </div>
      )}

      {/* Label */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
          {label}
        </p>
        {sub && (
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Daily Bar Chart ──────────────────────────────────────────────────────────
function DailyBarChart({ days, loading }) {
  const maxMinutes = Math.max(...days.map(d => d.totalMinutes), 1)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div
      style={{
        background:   'var(--card-bg)',
        border:       '1px solid var(--border)',
        borderRadius: '16px',
        padding:      '24px',
        boxShadow:    'var(--shadow-card)',
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Daily Study Time
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
          Last 7 days — focus sessions only
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '140px' }}>
          {[60, 90, 45, 110, 70, 120, 80].map((h, i) => (
            <div key={i} className="skeleton" style={{ flex: 1, height: `${h}px`, borderRadius: '6px 6px 0 0' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '140px' }}>
          {days.map((day, i) => {
            const pct     = (day.totalMinutes / maxMinutes) * 100
            const isToday = day.date === today
            const hrs     = (day.totalMinutes / 60).toFixed(1)
            return (
              <div
                key={day.date}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                title={`${day.label}: ${hrs}h (${day.sessions} sessions)`}
              >
                <div
                  style={{
                    width:         '100%',
                    height:        `${Math.max(pct, day.totalMinutes > 0 ? 4 : 0)}%`,
                    borderRadius:  '4px 4px 0 0',
                    background:    isToday ? '#7C3AED' : 'var(--surface-3)',
                    border:        isToday ? '1px solid #7C3AED' : '1px solid var(--border)',
                    transition:    'height 0.6s ease, background 0.3s ease',
                    position:      'relative',
                    overflow:      'visible',
                    minHeight:     day.totalMinutes > 0 ? '4px' : '0',
                    alignSelf:     'flex-end',
                    animation:     `barGrow 0.5s ease ${i * 0.06}s both`,
                  }}
                />
                <span
                  style={{
                    fontSize:   '10px',
                    color:      isToday ? '#7C3AED' : 'var(--text-tertiary)',
                    fontWeight: isToday ? 700 : 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {day.label}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Y-axis labels */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          marginTop:      '8px',
          paddingTop:     '8px',
          borderTop:      '1px solid var(--border)',
        }}
      >
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>0h</span>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
          {(maxMinutes / 60).toFixed(1)}h max
        </span>
      </div>
    </div>
  )
}

// ─── Weekly Line Chart (SVG area chart) ───────────────────────────────────────
function WeeklyChart({ weeks, loading }) {
  const maxMinutes = Math.max(...weeks.map(w => w.totalMinutes), 1)
  const W = 400
  const H = 120
  const PAD = 20

  const points = weeks.map((w, i) => ({
    x: PAD + (i / (weeks.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((w.totalMinutes / maxMinutes) * (H - PAD * 2)),
    ...w,
  }))

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')
  const area = [
    `M ${points[0].x},${H - PAD}`,
    ...points.map(p => `L ${p.x},${p.y}`),
    `L ${points[points.length - 1].x},${H - PAD}`,
    'Z',
  ].join(' ')

  return (
    <div
      style={{
        background:   'var(--card-bg)',
        border:       '1px solid var(--border)',
        borderRadius: '16px',
        padding:      '24px',
        boxShadow:    'var(--shadow-card)',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Weekly Productivity
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
          Total focus hours per week
        </p>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '120px', borderRadius: '8px' }} />
      ) : (
        <>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: '100%', height: 'auto', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#7C3AED" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            {[0.25, 0.5, 0.75, 1].map(pct => (
              <line
                key={pct}
                x1={PAD}
                y1={H - PAD - pct * (H - PAD * 2)}
                x2={W - PAD}
                y2={H - PAD - pct * (H - PAD * 2)}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            {/* Area fill */}
            <path d={area} fill="url(#weeklyGrad)" />

            {/* Line */}
            <polyline
              points={polyline}
              fill="none"
              stroke="#7C3AED"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Dots */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill="var(--card-bg)" stroke="#7C3AED" strokeWidth="2.5" />
                {p.totalMinutes > 0 && (
                  <circle cx={p.x} cy={p.y} r="2.5" fill="#7C3AED" />
                )}
              </g>
            ))}
          </svg>

          {/* X-axis labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            {weeks.map((w, i) => (
              <span
                key={i}
                style={{
                  fontSize:   '11px',
                  color:      i === weeks.length - 1 ? '#7C3AED' : 'var(--text-tertiary)',
                  fontWeight: i === weeks.length - 1 ? 700 : 400,
                  textAlign:  'center',
                  flex:       1,
                }}
              >
                {w.label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Analytics Dashboard ──────────────────────────────────────────────────────
export default function AnalyticsDashboard({ refreshKey }) {
  const [analytics, setAnalytics] = useState(null)
  const [dailyData,  setDailyData] = useState([])
  const [weeklyData, setWeeklyData] = useState([])
  const [loading,    setLoading]   = useState(true)
  const [error,      setError]     = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [analyticsRes, dailyRes, weeklyRes] = await Promise.all([
        getAnalytics(),
        getDailyBreakdown(),
        getWeeklyBreakdown(),
      ])
      setAnalytics(analyticsRes.data.data)
      setDailyData(dailyRes.data.data.days)
      setWeeklyData(weeklyRes.data.data.weeks)
    } catch (err) {
      setError(err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll, refreshKey])

  const fmt = (val, unit = 'h') => {
    if (val == null) return '—'
    if (unit === 'h') {
      const h = Math.floor(val)
      const m = Math.round((val - h) * 60)
      if (h === 0) return `${m}m`
      if (m === 0) return `${h}h`
      return `${h}h ${m}m`
    }
    return `${val}${unit}`
  }

  return (
    <div
      style={{
        display:       'flex',
        flexDirection: 'column',
        gap:           '24px',
        animation:     'slideUp 0.3s ease-out both',
      }}
    >
      {error && (
        <div
          style={{
            padding:      '12px 16px',
            borderRadius: '10px',
            background:   'var(--danger-subtle)',
            color:        'var(--danger)',
            fontSize:     '14px',
            border:       '1px solid var(--danger)',
            opacity:      0.7,
          }}
        >
          {error}
        </div>
      )}

      {/* ── Stat cards grid ── */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap:                 '16px',
        }}
      >
        <StatCard
          id="stat-today"
          icon="⏱️"
          label="Study Time Today"
          value={fmt(analytics?.today?.hours)}
          sub={`${analytics?.today?.sessions ?? 0} sessions`}
          accent="#7C3AED"
          loading={loading}
        />
        <StatCard
          id="stat-week"
          icon="📅"
          label="Weekly Hours"
          value={fmt(analytics?.week?.hours)}
          sub={`${analytics?.week?.sessions ?? 0} sessions`}
          accent="#0D9488"
          loading={loading}
        />
        <StatCard
          id="stat-month"
          icon="📊"
          label="Monthly Hours"
          value={fmt(analytics?.month?.hours)}
          sub={`${analytics?.month?.sessions ?? 0} sessions`}
          accent="#D97706"
          loading={loading}
        />
        <StatCard
          id="stat-streak"
          icon="🔥"
          label="Current Streak"
          value={`${analytics?.streaks?.current ?? 0}d`}
          sub={`Best: ${analytics?.streaks?.longest ?? 0} days`}
          accent="#EF4444"
          loading={loading}
        />
        <StatCard
          id="stat-alltime"
          icon="🏆"
          label="Total Study Hours"
          value={fmt(analytics?.allTime?.hours)}
          sub={`${analytics?.allTime?.sessions ?? 0} sessions total`}
          accent="#6366F1"
          loading={loading}
        />
      </div>

      {/* ── Charts grid ── */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap:                 '20px',
        }}
      >
        <DailyBarChart days={dailyData.length > 0 ? dailyData : Array(7).fill({ totalMinutes: 0, sessions: 0, label: '…', date: '' })} loading={loading} />
        <WeeklyChart   weeks={weeklyData.length > 0 ? weeklyData : Array(4).fill({ totalMinutes: 0, sessions: 0, label: '…' })} loading={loading} />
      </div>
    </div>
  )
}
