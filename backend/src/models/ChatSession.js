const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
)

const ChatSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      default: 'New Chat',
      trim: true
    },
    messages: [MessageSchema],
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      default: null
    }
  },
  { timestamps: true }
)

ChatSessionSchema.index({ user: 1, updatedAt: -1 })

module.exports = mongoose.model('ChatSession', ChatSessionSchema)
