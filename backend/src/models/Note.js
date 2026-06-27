const mongoose = require('mongoose')

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [50000, 'Content cannot exceed 50,000 characters']
    },
    subject: {
      type: String,
      trim: true,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    color: {
      type: String,
      enum: ['default', 'red', 'orange', 'yellow', 'green', 'teal', 'purple'],
      default: 'default'
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true
    },
    wordCount: {
      type: Number,
      default: 0
    },
    lastEditedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Composite index for list sorting (pinned first, then by last edited / updated)
NoteSchema.index({ user: 1, isPinned: -1, lastEditedAt: -1 })

// Text index for search
NoteSchema.index({ title: 'text', content: 'text', tags: 'text' })

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
NoteSchema.pre('save', function () {
  if (this.isModified('content')) {
    const text = this.content || ''
    // Trim and split by whitespace to count words
    const words = text.trim() ? text.trim().split(/\s+/) : []
    this.wordCount = words.length
  }
  
  // Set lastEditedAt on every edit / save
  this.lastEditedAt = Date.now()
})

module.exports = mongoose.model('Note', NoteSchema)
