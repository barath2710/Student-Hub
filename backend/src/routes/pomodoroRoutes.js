const express = require('express')
const {
  createSession,
  getAnalytics,
  getDailyBreakdown,
  getWeeklyBreakdown,
  getHistory,
} = require('../controllers/pomodoroController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// All Pomodoro routes require authentication
router.use(protect)

// ── Session logging ─────────────────────────────────────────────────────────
router.post('/sessions', createSession)

// ── Analytics ───────────────────────────────────────────────────────────────
router.get('/analytics',        getAnalytics)
router.get('/daily-breakdown',  getDailyBreakdown)
router.get('/weekly-breakdown', getWeeklyBreakdown)

// ── History ─────────────────────────────────────────────────────────────────
router.get('/history', getHistory)

module.exports = router
