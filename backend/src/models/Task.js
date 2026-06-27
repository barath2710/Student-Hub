const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true
    },
    dueDate: {
      type: Date,
      index: true
    },
    completedAt: {
      type: Date
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// ─── Virtuals ────────────────────────────────────────────────────────────────
// Dynamically compute if a task is overdue
TaskSchema.virtual('isOverdue').get(function () {
  return this.status === 'pending' && this.dueDate && new Date(this.dueDate) < new Date()
})

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Compound index for default sorting (status: -1 placing pending first, then dueDate, then createdAt)
TaskSchema.index({ user: 1, status: -1, dueDate: 1, createdAt: -1 })

// Text index for search on title & description
TaskSchema.index({ title: 'text', description: 'text' })

module.exports = mongoose.model('Task', TaskSchema)
