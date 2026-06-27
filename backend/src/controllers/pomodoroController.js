const PomodoroSession    = require('../models/PomodoroSession')
const ApiError           = require('../utils/ApiError')
const asyncHandler       = require('../utils/asyncHandler')
const { sendSuccess, sendCreated } = require('../utils/responseHandler')

// ─── Helper: today's date string in local YYYY-MM-DD ─────────────────────────
function todayStr() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function dateStr(date) {
  return new Date(date).toISOString().slice(0, 10)
}

// ─── Helper: get N days ago as YYYY-MM-DD ─────────────────────────────────────
function daysAgo(n) {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Log a completed (or manually saved) Pomodoro session
// @route   POST /api/pomodoro/sessions
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createSession = asyncHandler(async (req, res) => {
  const { sessionType, duration, plannedDuration, completedAt } = req.body

  if (!sessionType || !duration) {
    throw new ApiError('sessionType and duration are required', 400)
  }

  const resolvedDate = completedAt ? dateStr(completedAt) : todayStr()

  const session = await PomodoroSession.create({
    user:            req.user.id,
    sessionType:     sessionType || 'focus',
    duration:        Number(duration),
    plannedDuration: Number(plannedDuration) || 25,
    completedAt:     completedAt ? new Date(completedAt) : new Date(),
    date:            resolvedDate,
  })

  return sendCreated(res, session, 'Session logged successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get analytics summary (daily/weekly/monthly totals, streaks)
// @route   GET /api/pomodoro/analytics
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const today  = todayStr()

  // ── 1. Today's stats ────────────────────────────────────────────────────────
  const todaySessions = await PomodoroSession.find({
    user: userId,
    date: today,
    sessionType: 'focus',
  }).sort({ completedAt: -1 })

  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0)

  // ── 2. This week (last 7 days including today) ───────────────────────────────
  const weekStart = daysAgo(6)
  const weekAgg = await PomodoroSession.aggregate([
    { $match: { user: require('mongoose').Types.ObjectId.createFromHexString(userId), sessionType: 'focus', date: { $gte: weekStart, $lte: today } } },
    { $group: { _id: null, totalMinutes: { $sum: '$duration' }, sessions: { $sum: 1 } } },
  ])
  const weekMinutes  = weekAgg[0]?.totalMinutes  ?? 0
  const weekSessions = weekAgg[0]?.sessions      ?? 0

  // ── 3. This month ────────────────────────────────────────────────────────────
  const monthStart = new Date()
  monthStart.setUTCDate(1)
  const monthStartStr = monthStart.toISOString().slice(0, 10)

  const monthAgg = await PomodoroSession.aggregate([
    { $match: { user: require('mongoose').Types.ObjectId.createFromHexString(userId), sessionType: 'focus', date: { $gte: monthStartStr, $lte: today } } },
    { $group: { _id: null, totalMinutes: { $sum: '$duration' }, sessions: { $sum: 1 } } },
  ])
  const monthMinutes  = monthAgg[0]?.totalMinutes  ?? 0
  const monthSessions = monthAgg[0]?.sessions      ?? 0

  // ── 4. All-time total ─────────────────────────────────────────────────────────
  const allTimeAgg = await PomodoroSession.aggregate([
    { $match: { user: require('mongoose').Types.ObjectId.createFromHexString(userId), sessionType: 'focus' } },
    { $group: { _id: null, totalMinutes: { $sum: '$duration' }, sessions: { $sum: 1 } } },
  ])
  const allTimeMinutes  = allTimeAgg[0]?.totalMinutes  ?? 0
  const allTimeSessions = allTimeAgg[0]?.sessions      ?? 0

  // ── 5. Streak calculation ─────────────────────────────────────────────────────
  // Fetch all unique focus dates (sorted desc) for this user
  const focusDates = await PomodoroSession.distinct('date', {
    user: userId,
    sessionType: 'focus',
  })
  const sortedDates = focusDates.sort((a, b) => (a > b ? -1 : 1))

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak    = 0
  let prevDate      = null

  // Check if today or yesterday has a session (streak still alive)
  const mostRecent = sortedDates[0]
  const streakAlive = mostRecent === today || mostRecent === daysAgo(1)

  for (let i = 0; i < sortedDates.length; i++) {
    const d = sortedDates[i]
    if (i === 0) {
      tempStreak = streakAlive ? 1 : 0
      prevDate   = d
    } else {
      // Check if consecutive day
      const prev = new Date(prevDate)
      prev.setUTCDate(prev.getUTCDate() - 1)
      const expectedPrev = prev.toISOString().slice(0, 10)
      if (d === expectedPrev) {
        tempStreak++
      } else {
        tempStreak = 1
      }
      prevDate = d
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak
  }

  currentStreak = streakAlive ? tempStreak : 0

  return sendSuccess(res, {
    today: {
      minutes:  todayMinutes,
      hours:    +(todayMinutes / 60).toFixed(2),
      sessions: todaySessions.length,
    },
    week: {
      minutes:  weekMinutes,
      hours:    +(weekMinutes / 60).toFixed(2),
      sessions: weekSessions,
    },
    month: {
      minutes:  monthMinutes,
      hours:    +(monthMinutes / 60).toFixed(2),
      sessions: monthSessions,
    },
    allTime: {
      minutes:  allTimeMinutes,
      hours:    +(allTimeMinutes / 60).toFixed(2),
      sessions: allTimeSessions,
    },
    streaks: {
      current: currentStreak,
      longest: longestStreak,
    },
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get last 7 days daily breakdown (for bar chart)
// @route   GET /api/pomodoro/daily-breakdown
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getDailyBreakdown = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const today  = todayStr()
  const start  = daysAgo(6)

  const agg = await PomodoroSession.aggregate([
    {
      $match: {
        user: require('mongoose').Types.ObjectId.createFromHexString(userId),
        sessionType: 'focus',
        date: { $gte: start, $lte: today },
      },
    },
    {
      $group: {
        _id:          '$date',
        totalMinutes: { $sum: '$duration' },
        sessions:     { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  // Build a full 7-day array (fill gaps with 0)
  const dataMap = {}
  agg.forEach(d => { dataMap[d._id] = d })

  const days = []
  for (let i = 6; i >= 0; i--) {
    const key = daysAgo(i)
    const dayLabel = new Date(key + 'T00:00:00Z').toLocaleDateString('en-US', {
      weekday: 'short',
      timeZone: 'UTC',
    })
    days.push({
      date:         key,
      label:        dayLabel,
      totalMinutes: dataMap[key]?.totalMinutes ?? 0,
      sessions:     dataMap[key]?.sessions     ?? 0,
    })
  }

  return sendSuccess(res, { days })
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get last 4 weeks weekly breakdown (for weekly chart)
// @route   GET /api/pomodoro/weekly-breakdown
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getWeeklyBreakdown = asyncHandler(async (req, res) => {
  const userId = req.user.id
  const today  = todayStr()
  const start  = daysAgo(27) // ~4 weeks

  const agg = await PomodoroSession.aggregate([
    {
      $match: {
        user: require('mongoose').Types.ObjectId.createFromHexString(userId),
        sessionType: 'focus',
        date: { $gte: start, $lte: today },
      },
    },
    {
      $group: {
        _id:          '$date',
        totalMinutes: { $sum: '$duration' },
        sessions:     { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ])

  // Group by week (week 1 = 22-28 days ago, week 4 = this week)
  const weeks = [
    { label: '4 Wks Ago', totalMinutes: 0, sessions: 0, days: [] },
    { label: '3 Wks Ago', totalMinutes: 0, sessions: 0, days: [] },
    { label: '2 Wks Ago', totalMinutes: 0, sessions: 0, days: [] },
    { label: 'This Week', totalMinutes: 0, sessions: 0, days: [] },
  ]

  agg.forEach(d => {
    const diffDays = Math.floor((new Date(today) - new Date(d._id)) / 86400000)
    const weekIdx  = 3 - Math.floor(diffDays / 7)
    if (weekIdx >= 0 && weekIdx <= 3) {
      weeks[weekIdx].totalMinutes += d.totalMinutes
      weeks[weekIdx].sessions     += d.sessions
      weeks[weekIdx].days.push(d._id)
    }
  })

  return sendSuccess(res, { weeks })
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get paginated session history
// @route   GET /api/pomodoro/history
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getHistory = asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page,  10) || 1
  const limit = parseInt(req.query.limit, 10) || 20
  const skip  = (page - 1) * limit

  const filter = { user: req.user.id }
  if (req.query.type) filter.sessionType = req.query.type

  const [total, sessions] = await Promise.all([
    PomodoroSession.countDocuments(filter),
    PomodoroSession.find(filter).sort({ completedAt: -1 }).skip(skip).limit(limit),
  ])

  return sendSuccess(res, {
    sessions,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  })
})

module.exports = { createSession, getAnalytics, getDailyBreakdown, getWeeklyBreakdown, getHistory }
