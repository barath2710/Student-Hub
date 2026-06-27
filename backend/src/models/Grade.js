const mongoose = require('mongoose')

const gradeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    // Denormalised for display without populate
    courseName: {
      type: String,
      default: '',
    },
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Grade title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: 0,
    },
    maxScore: {
      type: Number,
      required: [true, 'Max score is required'],
      min: 0,
      default: 100,
    },
    type: {
      type: String,
      enum: ['homework', 'quiz', 'midterm', 'final', 'project', 'lab', 'other'],
      default: 'homework',
    },
    semester: {
      type: String,
      trim: true,
      default: '',
    },
    gradedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
)

// Virtual: letter grade
gradeSchema.virtual('letterGrade').get(function () {
  const pct = this.maxScore > 0 ? (this.score / this.maxScore) * 100 : 0
  if (pct >= 90) return 'A'
  if (pct >= 80) return 'B'
  if (pct >= 70) return 'C'
  if (pct >= 60) return 'D'
  return 'F'
})

// Virtual: percentage
gradeSchema.virtual('percentage').get(function () {
  return this.maxScore > 0 ? parseFloat(((this.score / this.maxScore) * 100).toFixed(2)) : 0
})

gradeSchema.set('toJSON', { virtuals: true })
gradeSchema.set('toObject', { virtuals: true })

gradeSchema.index({ user: 1, courseId: 1 })

module.exports = mongoose.model('Grade', gradeSchema)
