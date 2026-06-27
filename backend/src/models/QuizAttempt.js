const mongoose = require('mongoose')

const QuizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true
    },
    options: {
      type: [String],
      required: true
    },
    correctIndex: {
      type: Number,
      required: true
    },
    explanation: {
      type: String,
      default: ''
    }
  },
  { _id: false }
)

const QuizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    questions: [QuizQuestionSchema],
    userAnswers: {
      type: [Number],
      default: []
    },
    score: {
      type: Number,
      default: 0
    },
    weakAreas: {
      type: [String],
      default: []
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

QuizAttemptSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema)
