const mongoose = require('mongoose')

// ─── Schema ───────────────────────────────────────────────────────────────────
const PomodoroSessionSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    sessionType: {
      type:     String,
      enum:     ['focus', 'shortBreak', 'longBreak'],
      required: true,
      default:  'focus',
    },
    duration: {
      // Actual duration in minutes (may be less than planned if reset early)
      type:     Number,
      required: true,
      min:      1,
      max:      120,
    },
    plannedDuration: {
      // Configured duration at session start (25 / 5 / 15)
      type:    Number,
      default: 25,
    },
    completedAt: {
      type:    Date,
      default: Date.now,
    },
    // Day-level date string (YYYY-MM-DD) for fast grouping without timezone issues
    date: {
      type:     String,
      required: true,
    },
  },
  { timestamps: true }
)

// ─── Compound index for analytics aggregations ────────────────────────────────
PomodoroSessionSchema.index({ user: 1, date: 1 })
PomodoroSessionSchema.index({ user: 1, sessionType: 1, date: 1 })
PomodoroSessionSchema.index({ user: 1, completedAt: -1 })

module.exports = mongoose.model('PomodoroSession', PomodoroSessionSchema)
