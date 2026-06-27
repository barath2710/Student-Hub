import { useState, useMemo } from 'react'
import { useAuth }  from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { changePassword } from '../../services/authService'

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const Icon = {
  user: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  ),
  mail: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  lock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  sun: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  moon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  ),
  chart: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  ),
  pin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" x2="12" y1="17" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  ),
}

// ─── Section Card wrapper ────────────────────────────────────────────────────
function SectionCard({ title, icon, children }) {
  return (
    <section className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-[var(--border)] bg-[var(--surface-2)]">
        <span className="text-[var(--primary)]">{icon}</span>
        <h2 className="m-0 text-sm font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
      </div>
      {/* Body */}
      <div className="p-6">
        {children}
      </div>
    </section>
  )
}

// ─── Stat Chip ───────────────────────────────────────────────────────────────
function StatChip({ label, value, color = 'var(--primary)' }) {
  return (
    <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 text-center">
      <div 
        className="text-2xl font-bold leading-none mb-1.5"
        style={{ color }}
      >
        {value}
      </div>
      <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
        {label}
      </div>
    </div>
  )
}

// ─── Info Row ────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3.5 py-3.5 border-b border-[var(--border)] last:border-b-0">
      <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-[var(--text-tertiary)] mb-0.5 uppercase tracking-wider font-bold">
          {label}
        </div>
        <div className="text-sm text-[var(--text-primary)] font-semibold truncate">
          {value}
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Profile() {
  const { user }              = useAuth()
  const { theme, setTheme }   = useTheme()
  const [pwSection, setPwSection] = useState(false)

  // Password change form state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwStatus, setPwStatus] = useState(null) // { type: 'success'|'error', msg: string }
  const [pwLoading, setPwLoading] = useState(false)

  // Derive initials + display name
  const displayName = user?.name ?? 'Student'
  const initials    = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return 'N/A'
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }, [user])

  return (
    <div className="max-w-[720px] mx-auto py-8 pb-16 flex flex-col gap-6 w-full">
      {/* ── Page heading ───────────────────────────────────────────── */}
      <div>
        <h1 className="m-0 text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          Profile & Settings
        </h1>
        <p className="mt-1.5 m-0 text-sm text-[var(--text-secondary)]">
          Manage your account details and preferences.
        </p>
      </div>

      {/* ── 1. Personal Information ──────────────────────────────────── */}
      <SectionCard title="Personal Information" icon={Icon.user}>
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="w-18 h-18 rounded-full bg-[var(--surface-3)] border border-[var(--border)] flex items-center justify-center text-2xl font-bold text-[var(--text-primary)] shadow-sm">
            {initials}
          </div>
          <div>
            <div className="text-xl font-bold text-[var(--text-primary)] mb-1">
              {displayName}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[var(--success-subtle)] text-[var(--success-text)] border border-[var(--success)] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] inline-block" />
              Active Student
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="flex flex-col">
          <InfoRow icon={Icon.user}     label="Full Name"    value={displayName} />
          <InfoRow icon={Icon.mail}     label="Email"        value={user?.email ?? '—'} />
          <InfoRow icon={Icon.calendar} label="Member Since" value={memberSince} />
        </div>
      </SectionCard>

      {/* ── 2. Account Overview ─────────────────────────────────────── */}
      <SectionCard title="Account Overview" icon={Icon.chart}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatChip label="Total Notes"       value={user?.totalNotes      ?? '—'} color="var(--text-primary)" />
          <StatChip label="Total Tasks"       value={user?.totalTasks      ?? '—'} color="var(--primary)" />
          <StatChip label="Completion Rate"   value={user?.completionRate != null ? `${Math.round(user.completionRate)}%` : '—'} color="var(--success)" />
          <StatChip label="Pinned Notes"      value={user?.pinnedNotes     ?? '—'} color="var(--warning)" />
        </div>
        <p className="mt-4 m-0 text-xs text-[var(--text-tertiary)]">
          Stats update in real-time as you create and complete items.
        </p>
      </SectionCard>

      {/* ── 3. Preferences ──────────────────────────────────────────── */}
      <SectionCard title="Preferences" icon={Icon.sun}>
        <div>
          <p className="m-0 mb-4 text-sm text-[var(--text-secondary)]">
            Choose your display theme. Your preference is saved to this browser.
          </p>
          {/* Segmented theme control */}
          <div className="inline-flex bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-1 gap-1" role="radiogroup" aria-label="Theme preference">
            {['light', 'dark'].map((t) => (
              <button
                key={t}
                id={`theme-${t}`}
                role="radio"
                aria-checked={theme === t}
                onClick={() => setTheme(t)}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all border cursor-pointer ${
                  theme === t
                    ? 'bg-[var(--surface-1)] text-[var(--text-primary)] border-[var(--border-strong)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-transparent'
                }`}
              >
                {t === 'light' ? Icon.sun : Icon.moon}
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {theme === t && (
                  <span className="text-[var(--primary)] ml-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── 4. Security ─────────────────────────────────────────────── */}
      <SectionCard title="Security" icon={Icon.shield}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">Password</div>
              <div className="text-xs text-[var(--text-secondary)]">
                {pwSection ? 'Enter your current password and choose a new one.' : 'Password is encrypted and never shown.'}
              </div>
            </div>
            <button
              id="change-password-btn"
              onClick={() => {
                setPwSection(v => !v)
                setPwForm({ current: '', next: '', confirm: '' })
                setPwStatus(null)
              }}
              className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] text-xs font-semibold cursor-pointer hover:bg-[var(--surface-3)] transition-colors whitespace-nowrap"
            >
              {pwSection ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {pwSection && (
            <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-3">
              {/* Current Password */}
              <div className="flex flex-col gap-1">
                <label htmlFor="pw-current" className="text-xs font-semibold text-[var(--text-secondary)]">
                  Current Password
                </label>
                <input
                  id="pw-current"
                  type="password"
                  placeholder="••••••••"
                  value={pwForm.current}
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                  disabled={pwLoading}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                />
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1">
                <label htmlFor="pw-new" className="text-xs font-semibold text-[var(--text-secondary)]">
                  New Password
                </label>
                <input
                  id="pw-new"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={pwForm.next}
                  onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                  disabled={pwLoading}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                />
              </div>

              {/* Confirm New Password */}
              <div className="flex flex-col gap-1">
                <label htmlFor="pw-confirm" className="text-xs font-semibold text-[var(--text-secondary)]">
                  Confirm New Password
                </label>
                <input
                  id="pw-confirm"
                  type="password"
                  placeholder="••••••••"
                  value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  disabled={pwLoading}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                />
              </div>

              {/* Feedback banner */}
              {pwStatus && (
                <div
                  className={`text-xs font-semibold p-3 rounded-lg border ${
                    pwStatus.type === 'success'
                      ? 'bg-[var(--success-subtle)] text-[var(--success-text)] border-[var(--success)]'
                      : 'bg-[var(--danger-subtle)] text-[var(--danger-text)] border-[var(--danger)]'
                  }`}
                >
                  {pwStatus.type === 'success' ? '✓ ' : '⚠ '}{pwStatus.msg}
                </div>
              )}

              <button
                id="update-password-btn"
                disabled={pwLoading}
                onClick={async () => {
                  setPwStatus(null)
                  if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
                    setPwStatus({ type: 'error', msg: 'All fields are required.' })
                    return
                  }
                  if (pwForm.next.length < 8) {
                    setPwStatus({ type: 'error', msg: 'New password must be at least 8 characters.' })
                    return
                  }
                  if (pwForm.next !== pwForm.confirm) {
                    setPwStatus({ type: 'error', msg: 'New password and confirmation do not match.' })
                    return
                  }
                  setPwLoading(true)
                  try {
                    await changePassword(pwForm.current, pwForm.next)
                    setPwStatus({ type: 'success', msg: 'Password updated successfully!' })
                    setPwForm({ current: '', next: '', confirm: '' })
                  } catch (err) {
                    const msg = err?.response?.data?.message || err.message || 'Failed to update password.'
                    setPwStatus({ type: 'error', msg })
                  } finally {
                    setPwLoading(false)
                  }
                }}
                className="px-5 py-2.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--text-inverse)] text-sm font-bold cursor-pointer self-start transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {pwLoading && <span className="spinner" />}
                {pwLoading ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          )}

          {/* Session info */}
          <div className="flex items-center gap-3 p-3.5 bg-[var(--success-subtle)] border border-[var(--success)] rounded-xl">
            <span className="text-[var(--success)]">{Icon.check}</span>
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Session Active</div>
              <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                You are logged in as <strong>{user?.email ?? '—'}</strong>. Your session is secured with JWT authentication.
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
