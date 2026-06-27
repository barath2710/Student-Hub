import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * PrivateRoute — guards all protected routes.
 * When used as a layout route element, renders <Outlet /> for authenticated users.
 * Shows a theme-aware full-screen spinner while the session is being restored.
 */
export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  const location          = useLocation()

  if (loading) {
    return (
      <div style={{
        display: 'grid',
        placeItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-app)',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid var(--border-strong)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Support both layout route (Outlet) and wrapper (children) usage
  return children ?? <Outlet />
}
