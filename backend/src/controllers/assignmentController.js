const Assignment   = require('../models/Assignment')
const Course       = require('../models/Course')
const ApiError     = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { sendSuccess, sendCreated } = require('../utils/responseHandler')

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all assignments for the authenticated user
// @route   GET /api/assignments
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAssignments = asyncHandler(async (req, res) => {
  const { courseId, status, priority } = req.query
  const filter = { user: req.user.id }

  if (courseId) filter.courseId = courseId
  if (status)   filter.status   = status
  if (priority) filter.priority = priority

  const assignments = await Assignment.find(filter).sort({ dueDate: 1, createdAt: -1 })
  return sendSuccess(res, assignments, 'Assignments retrieved successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single assignment
// @route   GET /api/assignments/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findOne({ _id: req.params.id, user: req.user.id })
  if (!assignment) throw new ApiError('Assignment not found', 404)
  return sendSuccess(res, assignment, 'Assignment retrieved successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, courseId, dueDate, status, priority, type, grade, maxGrade } = req.body

  if (!title || !title.trim()) {
    throw new ApiError('Assignment title is required', 400)
  }

  // Resolve course name for denormalisation
  let courseName = ''
  if (courseId) {
    const course = await Course.findOne({ _id: courseId, user: req.user.id })
    if (!course) throw new ApiError('Course not found', 404)
    courseName = course.name
  }

  const assignment = await Assignment.create({
    user:        req.user.id,
    title:       title.trim(),
    description: (description || '').trim(),
    courseId:    courseId || null,
    courseName,
    dueDate:     dueDate   || null,
    status:      status    || 'pending',
    priority:    priority  || 'medium',
    type:        type      || 'homework',
    grade:       grade     ?? null,
    maxGrade:    maxGrade  ?? 100,
  })

  return sendCreated(res, assignment, 'Assignment created successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update an assignment
// @route   PUT /api/assignments/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findOne({ _id: req.params.id, user: req.user.id })
  if (!assignment) throw new ApiError('Assignment not found', 404)

  // If courseId changes, re-resolve courseName
  if (req.body.courseId !== undefined && req.body.courseId !== String(assignment.courseId)) {
    if (req.body.courseId) {
      const course = await Course.findOne({ _id: req.body.courseId, user: req.user.id })
      if (!course) throw new ApiError('Course not found', 404)
      assignment.courseName = course.name
    } else {
      assignment.courseName = ''
    }
    assignment.courseId = req.body.courseId || null
  }

  const allowed = ['title', 'description', 'dueDate', 'status', 'priority', 'type', 'grade', 'maxGrade']
  allowed.forEach(field => {
    if (req.body[field] !== undefined) {
      assignment[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field]
    }
  })

  await assignment.save()
  return sendSuccess(res, assignment, 'Assignment updated successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!assignment) throw new ApiError('Assignment not found', 404)
  return sendSuccess(res, {}, 'Assignment deleted successfully')
})

module.exports = { getAssignments, getAssignment, createAssignment, updateAssignment, deleteAssignment }
