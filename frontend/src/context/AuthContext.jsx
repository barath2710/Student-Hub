import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { loginUser, registerUser, fetchMe } from '../services/authService'

const AuthContext = createContext(null)

// ─────────────────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true) // true while we restore the session

  // ── On first mount: restore session from localStorage token ────────────────
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const res = await fetchMe()
          setUser(res.data.data.user)
        } catch {
          // Token expired or invalid – clear it
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
    restore()

    const handleUnauthorized = () => setUser(null)
    window.addEventListener('auth-unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized)
  }, [])

  // ── login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res         = await loginUser({ email, password })
    const { token, user } = res.data.data
    localStorage.setItem('token', token)
    setUser(user)
    return user
  }, [])

  // ── register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const res         = await registerUser({ name, email, password })
    const { token, user } = res.data.data
    localStorage.setItem('token', token)
    setUser(user)
    return user
  }, [])

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setUser(null)
  }, [])

  const value = { user, loading, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Custom hook ──────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export default AuthContext
