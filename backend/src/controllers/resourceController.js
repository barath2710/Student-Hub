const Resource = require('../models/Resource')
const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const { sendSuccess, sendCreated } = require('../utils/responseHandler')
const fs = require('fs')
const path = require('path')

// @desc    Upload resource file and save metadata
// @route   POST /api/resources
// @access  Private
const uploadResource = asyncHandler(async (req, res) => {
  const { title, description, subject } = req.body

  if (!req.file) {
    throw new ApiError('Please upload a file', 400)
  }

  if (!title || !subject) {
    // Cleanup uploaded file since validation failed
    fs.unlinkSync(req.file.path)
    throw new ApiError('Title and subject are required fields', 400)
  }

  const fileUrl = `/api/uploads/${req.file.filename}`
  const fileType = path.extname(req.file.originalname).substring(1).toLowerCase()
  const fileSize = req.file.size

  const resource = await Resource.create({
    title: title.trim(),
    description: description ? description.trim() : '',
    subject: subject.trim().toLowerCase(),
    fileUrl,
    fileType,
    fileSize,
    uploadedBy: req.user.id
  })

  sendCreated(res, resource, 'Resource uploaded successfully')
})

// @desc    Get all resources for user with pagination, search, and subject filter
// @route   GET /api/resources
// @access  Private
const getAllResources = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 12
  const skip = (page - 1) * limit

  const query = { uploadedBy: req.user.id }

  // Search by title case-insensitive regex
  if (req.query.search) {
    query.title = { $regex: req.query.search, $options: 'i' }
  }

  // Filter by subject case-insensitive matches
  if (req.query.subject) {
    query.subject = req.query.subject.toLowerCase()
  }

  const total = await Resource.countDocuments(query)
  const resources = await Resource.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  // Get list of all subjects (for category filter listing)
  const allSubjects = await Resource.distinct('subject', { uploadedBy: req.user.id })

  sendSuccess(res, {
    resources,
    allSubjects,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  }, 'Resources retrieved successfully')
})

// @desc    Get 5 recent resources
// @route   GET /api/resources/recent
// @access  Private
const getRecentResources = asyncHandler(async (req, res) => {
  const resources = await Resource.find({ uploadedBy: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5)

  sendSuccess(res, resources, 'Recent resources retrieved')
})

// @desc    Get resource stats (e.g. total resources count)
// @route   GET /api/resources/stats
// @access  Private
const getResourceStats = asyncHandler(async (req, res) => {
  const totalResources = await Resource.countDocuments({ uploadedBy: req.user.id })
  sendSuccess(res, { totalResources }, 'Resource statistics retrieved')
})

// @desc    Rename/Update a resource
// @route   PATCH /api/resources/:id
// @access  Private
const renameResource = asyncHandler(async (req, res) => {
  const { title, description, subject } = req.body

  let resource = await Resource.findOne({ _id: req.params.id, uploadedBy: req.user.id })

  if (!resource) {
    throw new ApiError('Resource not found', 404)
  }

  if (title) resource.title = title.trim()
  if (description !== undefined) resource.description = description.trim()
  if (subject) resource.subject = subject.trim().toLowerCase()

  await resource.save()

  sendSuccess(res, resource, 'Resource updated successfully')
})

// @desc    Delete a resource and remove file from disk
// @route   DELETE /api/resources/:id
// @access  Private
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findOne({ _id: req.params.id, uploadedBy: req.user.id })

  if (!resource) {
    throw new ApiError('Resource not found', 404)
  }

  // Remove actual file
  const filename = path.basename(resource.fileUrl)
  const filePath = path.join(__dirname, '../../uploads', filename)
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  await Resource.deleteOne({ _id: req.params.id })

  sendSuccess(res, null, 'Resource deleted successfully')
})

module.exports = {
  uploadResource,
  getAllResources,
  getRecentResources,
  getResourceStats,
  renameResource,
  deleteResource
}
