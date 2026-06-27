const mongoose = require('mongoose')

const ResourceSchema = new mongoose.Schema(
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
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      lowercase: true
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    fileType: {
      type: String,
      required: [true, 'File type is required']
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  { timestamps: true }
)

// Index for search queries
ResourceSchema.index({ title: 'text', description: 'text' })

module.exports = mongoose.model('Resource', ResourceSchema)
