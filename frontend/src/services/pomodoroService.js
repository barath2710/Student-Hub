// ─── Pomodoro API Service ─────────────────────────────────────────────────────
import api from './api'

/**
 * Log a completed Pomodoro session to the backend.
 * @param {{ sessionType: string, duration: number, plannedDuration: number, completedAt?: string }} payload
 */
export const logSession = (payload) => api.post('/pomodoro/sessions', payload)

/**
 * Fetch summary analytics: today / week / month / streak
 */
export const getAnalytics = () => api.get('/pomodoro/analytics')

/**
 * Fetch last 7-day daily breakdown for bar chart.
 */
export const getDailyBreakdown = () => api.get('/pomodoro/daily-breakdown')

/**
 * Fetch last 4-week weekly breakdown for line chart.
 */
export const getWeeklyBreakdown = () => api.get('/pomodoro/weekly-breakdown')

/**
 * Fetch paginated session history.
 * @param {number} page
 * @param {number} limit
 */
export const getHistory = (page = 1, limit = 20) =>
  api.get('/pomodoro/history', { params: { page, limit } })
