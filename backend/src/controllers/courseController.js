const Course     = require('../models/Course')
const ApiError   = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { sendSuccess, sendCreated } = require('../utils/responseHandler')

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all courses for the authenticated user
// @route   GET /api/courses
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getCourses = asyncHandler(async (req, res) => {
  const { status, semester } = req.query
  const filter = { user: req.user.id }

  if (status)   filter.status   = status
  if (semester) filter.semester = semester

  const courses = await Course.find(filter).sort({ createdAt: -1 })
  return sendSuccess(res, courses, 'Courses retrieved successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single course
// @route   GET /api/courses/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, user: req.user.id })
  if (!course) throw new ApiError('Course not found', 404)
  return sendSuccess(res, course, 'Course retrieved successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new course
// @route   POST /api/courses
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createCourse = asyncHandler(async (req, res) => {
  const { name, code, instructor, credits, color, progress, semester, status } = req.body

  if (!name || !name.trim()) {
    throw new ApiError('Course name is required', 400)
  }

  const course = await Course.create({
    user: req.user.id,
    name: name.trim(),
    code:       (code       || '').trim(),
    instructor: (instructor || '').trim(),
    credits:    credits     ?? 3,
    color:      color       || '#7C3AED',
    progress:   progress    ?? 0,
    semester:   (semester   || '').trim(),
    status:     status      || 'active',
  })

  return sendCreated(res, course, 'Course created successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, user: req.user.id })
  if (!course) throw new ApiError('Course not found', 404)

  const allowed = ['name', 'code', 'instructor', 'credits', 'color', 'progress', 'semester', 'status']
  allowed.forEach(field => {
    if (req.body[field] !== undefined) {
      course[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field]
    }
  })

  await course.save()
  return sendSuccess(res, course, 'Course updated successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!course) throw new ApiError('Course not found', 404)
  return sendSuccess(res, {}, 'Course deleted successfully')
})

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse }
