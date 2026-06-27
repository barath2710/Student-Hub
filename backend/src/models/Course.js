const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      maxlength: [100, 'Course name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      trim: true,
      maxlength: [20, 'Course code cannot exceed 20 characters'],
      default: '',
    },
    instructor: {
      type: String,
      trim: true,
      maxlength: [100, 'Instructor name cannot exceed 100 characters'],
      default: '',
    },
    credits: {
      type: Number,
      default: 3,
      min: 0,
      max: 10,
    },
    color: {
      type: String,
      default: '#7C3AED',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    semester: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Course', courseSchema)
