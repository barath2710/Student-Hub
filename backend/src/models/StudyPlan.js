const mongoose = require('mongoose')

const StudyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters']
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required']
    },
    intensity: {
      type: String,
      enum: ['relaxed', 'balanced', 'intense'],
      default: 'balanced'
    },
    syllabus: {
      type: String,
      required: [true, 'Syllabus details are required'],
      trim: true,
      maxlength: [5000, 'Syllabus cannot exceed 5000 characters']
    },
    blocks: [
      {
        date: {
          type: String, // YYYY-MM-DD format for timezone-independent local matching
          required: true
        },
        topic: {
          type: String,
          required: true,
          trim: true
        },
        duration: {
          type: Number, // in minutes
          default: 45
        },
        status: {
          type: String,
          enum: ['pending', 'completed'],
          default: 'pending'
        },
        pomodoroCount: {
          type: Number,
          default: 2
        }
      }
    ]
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('StudyPlan', StudyPlanSchema)
