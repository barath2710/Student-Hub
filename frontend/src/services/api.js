// ─── Axios singleton ──────────────────────────────────────────────────────────
// Pre-configured with base URL and auth header injection.
// Import this instead of raw axios anywhere in the app.

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',   // relative – routed through Vite proxy → backend:5000
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach JWT if present ──────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: surface error messages ────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.dispatchEvent(new Event('auth-unauthorized'))
    }
    const message =
      error.response?.data?.message || error.message || 'Something went wrong'
    const customError = new Error(message)
    customError.status = error.response?.status
    return Promise.reject(customError)
  }
)

export default api
