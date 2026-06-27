const mongoose = require('mongoose')

const TopicQuestionsSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true
    },
    questions: {
      type: [String],
      required: true
    }
  },
  { _id: false }
)

const ResumeAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fileName: {
      type: String,
      required: true
    },
    atsScore: {
      type: Number,
      required: true
    },
    summary: {
      type: String,
      default: ''
    },
    strengths: {
      type: [String],
      default: []
    },
    suggestions: {
      content: { type: [String], default: [] },
      metrics: { type: [String], default: [] },
      formatting: { type: [String], default: [] }
    },
    interviewPreparation: [TopicQuestionsSchema]
  },
  { timestamps: true }
)

ResumeAnalysisSchema.index({ user: 1, createdAt: -1 })

module.exports = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema)
