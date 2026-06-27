import { useState, useCallback, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../common/ThemeToggle'
import FloatingJarvis from '../../pages/jarvis/FloatingJarvis'


// ─── SVG Icon Library ─────────────────────────────────────────────────────────
const Icon = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="7" height="7" x="3" y="3" rx="1.5" />
      <rect width="7" height="7" x="14" y="3" rx="1.5" />
      <rect width="7" height="7" x="14" y="14" rx="1.5" />
      <rect width="7" height="7" x="3" y="14" rx="1.5" />
    </svg>
  ),
  notes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  ),
  tasks: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  profile: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  ),
  menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  ),
  close: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  ),
  chevronLeft: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  resources: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  pomodoro: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  jarvis: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 4a3 3 0 0 0-3 3h6a3 3 0 0 0-3-3z" />
      <path d="M9 13h6" />
    </svg>
  ),
  flashcards: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="14" height="18" x="5" y="3" rx="2" />
      <path d="M9 7h6M9 11h4" />
    </svg>
  ),
  quiz: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  resume: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="14" height="20" x="5" y="2" rx="2" />
      <path d="M9 12h6M9 16h6M12 8h.01" />
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  ),
}

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { to: '/dashboard',  label: 'Dashboard',  icon: Icon.dashboard },
  { to: '/notes',      label: 'Notes',      icon: Icon.notes },
  { to: '/tasks',      label: 'Tasks',      icon: Icon.tasks },
  { to: '/resources',  label: 'Resources',  icon: Icon.resources },
  { to: '/scheduler',  label: 'Study Planner', icon: Icon.calendar },
  { to: '/pomodoro',   label: 'Pomodoro',   icon: Icon.pomodoro },
  { to: '/jarvis',     label: 'Jarvis AI',  icon: Icon.jarvis },
  { to: '/flashcards', label: 'Flashcards', icon: Icon.flashcards },
  { to: '/quiz',       label: 'Quiz Arena', icon: Icon.quiz },
  { to: '/resume',     label: 'Resume AI',  icon: Icon.resume },
  { to: '/profile',    label: 'Profile',    icon: Icon.profile },
]

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/notes':     'Notes',
  '/tasks':     'Tasks',
  '/resources': 'Resources',
  '/scheduler': 'AI Study Planner & Scheduler',
  '/pomodoro':  'Pomodoro',
  '/jarvis':    'Jarvis AI Assistant',
  '/flashcards': 'Flashcards',
  '/quiz':      'Quiz Arena',
  '/resume':    'Resume & Placement Hub',
  '/profile':   'Profile',
}


// ─── Nav Link Item ─────────────────────────────────────────────────────────────
function SideNavLink({ to, icon, label, collapsed }) {
  return (
    <NavLink
      to={to}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: collapsed ? '9px 12px' : '9px 12px',
        borderRadius: '8px',
        color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
        background: isActive ? 'var(--primary-subtle)' : 'transparent',
        fontWeight: isActive ? 600 : 500,
        fontSize: '14px',
        textDecoration: 'none',
        transition: 'background 0.12s ease, color 0.12s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        justifyContent: collapsed ? 'center' : 'flex-start',
        userSelect: 'none',
      })}
      onMouseEnter={e => {
        const isActive = e.currentTarget.getAttribute('aria-current') === 'page'
        if (!isActive) {
          e.currentTarget.style.background = 'var(--surface-2)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }
      }}
      onMouseLeave={e => {
        const isActive = e.currentTarget.getAttribute('aria-current') === 'page'
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--text-secondary)'
        }
      }}
    >
      <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{icon}</span>
      {!collapsed && (
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      )}
    </NavLink>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AppLayout() {
  const [collapsed, setCollapsed]     = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [isDesktop, setIsDesktop]     = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  )

  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()

  const SIDEBAR_W = isDesktop ? (collapsed ? 64 : 240) : 240

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Track desktop breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const pageTitle   = PAGE_TITLES[location.pathname] ?? 'StudentHub'
  const userInitial = user?.name?.[0]?.toUpperCase() ?? '?'

  // ─── Sidebar Content ─────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      {/* Logo + Brand */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '0 16px',
        height: '56px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        justifyContent: collapsed && isDesktop ? 'center' : 'flex-start',
        overflow: 'hidden',
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '7px',
          background: 'var(--primary)',
          color: 'var(--text-inverse)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '14px',
        }}>
          🎓
        </div>
        {!(collapsed && isDesktop) && (
          <span style={{
            fontWeight: 700,
            fontSize: '15px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}>
            StudentHub
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        style={{
          flex: 1,
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {NAV_LINKS.map(link => (
          <SideNavLink
            key={link.to}
            collapsed={collapsed && isDesktop}
            {...link}
          />
        ))}
      </nav>

      {/* User Footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '8px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        {/* User info row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '9px 12px',
          borderRadius: '8px',
          overflow: 'hidden',
          justifyContent: collapsed && isDesktop ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--surface-3)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {userInitial}
          </div>
          {!(collapsed && isDesktop) && (
            <div style={{ overflow: 'hidden', minWidth: 0, flex: 1 }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
                margin: 0,
              }}>
                {user?.name ?? 'Student'}
                {user?.currentStreak > 0 && (
                  <span style={{ marginLeft: '6px', fontSize: '11px', display: 'inline-flex', alignItems: 'center' }} title="Daily study streak">
                    🔥 {user.currentStreak}
                  </span>
                )}
              </p>
              <p style={{
                fontSize: '11px',
                color: 'var(--text-tertiary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
                margin: 0,
              }}>
                {user?.email ?? ''}
              </p>
            </div>
          )}
        </div>

        {/* Theme Toggle row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 12px',
          justifyContent: collapsed && isDesktop ? 'center' : 'space-between',
          gap: '10px',
        }}>
          {!(collapsed && isDesktop) && (
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Theme
            </span>
          )}
          <ThemeToggle />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          aria-label="Sign out"
          title={collapsed && isDesktop ? 'Sign out' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 12px',
            borderRadius: '8px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-tertiary)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.12s ease, color 0.12s ease',
            width: '100%',
            justifyContent: collapsed && isDesktop ? 'center' : 'flex-start',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--danger-subtle)'
            e.currentTarget.style.color = 'var(--danger)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-tertiary)'
          }}
        >
          <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{Icon.logout}</span>
          {!(collapsed && isDesktop) && <span>Sign out</span>}
        </button>
      </div>
    </>
  )

  return (
    <div className="app-shell">
      {/* ── Skip link (accessibility) ────────────────────────────────────────── */}
      <a
        href="#main-content"
        style={{
          position: 'fixed',
          top: '-100px',
          left: '16px',
          zIndex: 999,
          padding: '8px 16px',
          background: 'var(--primary)',
          color: '#fff',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '14px',
          transition: 'top 0.1s',
        }}
        onFocus={e => { e.currentTarget.style.top = '16px' }}
        onBlur={e => { e.currentTarget.style.top = '-100px' }}
      >
        Skip to content
      </a>

      {/* ── Desktop Sidebar ──────────────────────────────────────────────────── */}
      {isDesktop && (
        <aside
          aria-label="Application sidebar"
          className="sidebar"
          style={{ width: `${SIDEBAR_W}px` }}
        >
          <SidebarContent />

          {/* Collapse toggle button */}
          <button
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              position: 'absolute',
              right: '-12px',
              top: '72px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--surface-1)',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'all 0.15s ease',
              transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--surface-2)'
              e.currentTarget.style.color = 'var(--text-primary)'
              e.currentTarget.style.borderColor = 'var(--border-strong)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'var(--surface-1)'
              e.currentTarget.style.color = 'var(--text-tertiary)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            {Icon.chevronLeft}
          </button>
        </aside>
      )}

      {/* ── Mobile Drawer ────────────────────────────────────────────────────── */}
      {!isDesktop && mobileOpen && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(0,0,0,0.5)',
              animation: 'fadeIn 0.15s ease',
            }}
          />
          <aside
            aria-label="Mobile navigation"
            className="sidebar drawer-enter"
            style={{ width: '240px', zIndex: 51 }}
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--surface-2)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              {Icon.close}
            </button>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* ── Main Area ────────────────────────────────────────────────────────── */}
      <div
        className="main-content"
        style={{ marginLeft: isDesktop ? `${SIDEBAR_W}px` : 0 }}
      >
        {/* TopBar */}
        <header
          role="banner"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 30,
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: 'var(--surface-1)',
            borderBottom: '1px solid var(--border)',
            gap: '16px',
            flexShrink: 0,
          }}
        >
          {/* Left: hamburger (mobile) + page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {!isDesktop && (
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface-2)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {Icon.menu}
              </button>
            )}
            <h1 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {pageTitle}
            </h1>
          </div>

          {/* Right side is intentionally clean since theme toggle and user details are in the sidebar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          </div>
        </header>

        {/* Page content */}
        <main
          id="main-content"
          style={{
            flex: 1,
            padding: '28px 24px',
            maxWidth: '1360px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
      <FloatingJarvis />
    </div>
  )
}
