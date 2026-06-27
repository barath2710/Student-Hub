const mongoose = require('mongoose')

const assignmentSchema = new mongoose.Schema(
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
    // Denormalised course name for display without populate
    courseName: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'submitted', 'graded', 'late'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    grade: {
      type: Number,
      default: null,
    },
    maxGrade: {
      type: Number,
      default: 100,
    },
    type: {
      type: String,
      enum: ['homework', 'quiz', 'midterm', 'final', 'project', 'lab', 'other'],
      default: 'homework',
    },
  },
  { timestamps: true }
)

assignmentSchema.index({ user: 1, dueDate: 1 })

module.exports = mongoose.model('Assignment', assignmentSchema)
