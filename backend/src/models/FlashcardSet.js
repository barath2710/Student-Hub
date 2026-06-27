const mongoose = require('mongoose')

const CardSchema = new mongoose.Schema(
  {
    front: {
      type: String,
      required: true,
      trim: true
    },
    back: {
      type: String,
      required: true,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    }
  },
  { _id: true }
)

const FlashcardSetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      lowercase: true
    },
    sourceType: {
      type: String,
      enum: ['manual', 'ai', 'resource'],
      default: 'manual'
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      default: null
    },
    cards: [CardSchema]
  },
  { timestamps: true }
)

FlashcardSetSchema.index({ user: 1, updatedAt: -1 })

module.exports = mongoose.model('FlashcardSet', FlashcardSetSchema)
