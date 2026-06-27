const Grade      = require('../models/Grade')
const Course     = require('../models/Course')
const ApiError   = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { sendSuccess, sendCreated } = require('../utils/responseHandler')

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all grades for the authenticated user
// @route   GET /api/grades
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getGrades = asyncHandler(async (req, res) => {
  const { courseId, semester, type } = req.query
  const filter = { user: req.user.id }

  if (courseId) filter.courseId = courseId
  if (semester) filter.semester = semester
  if (type)     filter.type     = type

  const grades = await Grade.find(filter).sort({ gradedAt: -1 })
  return sendSuccess(res, grades, 'Grades retrieved successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single grade
// @route   GET /api/grades/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.findOne({ _id: req.params.id, user: req.user.id })
  if (!grade) throw new ApiError('Grade not found', 404)
  return sendSuccess(res, grade, 'Grade retrieved successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new grade entry
// @route   POST /api/grades
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createGrade = asyncHandler(async (req, res) => {
  const { title, score, maxScore, courseId, assignmentId, type, semester, notes, gradedAt } = req.body

  if (!title || !title.trim()) throw new ApiError('Grade title is required', 400)
  if (score === undefined || score === null) throw new ApiError('Score is required', 400)

  let courseName = ''
  if (courseId) {
    const course = await Course.findOne({ _id: courseId, user: req.user.id })
    if (!course) throw new ApiError('Course not found', 404)
    courseName = course.name
  }

  const grade = await Grade.create({
    user:         req.user.id,
    title:        title.trim(),
    score:        Number(score),
    maxScore:     Number(maxScore ?? 100),
    courseId:     courseId     || null,
    courseName,
    assignmentId: assignmentId || null,
    type:         type         || 'homework',
    semester:     (semester    || '').trim(),
    notes:        (notes       || '').trim(),
    gradedAt:     gradedAt     || new Date(),
  })

  return sendCreated(res, grade, 'Grade created successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a grade entry
// @route   PUT /api/grades/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.findOne({ _id: req.params.id, user: req.user.id })
  if (!grade) throw new ApiError('Grade not found', 404)

  // Re-resolve courseName if courseId changes
  if (req.body.courseId !== undefined && req.body.courseId !== String(grade.courseId)) {
    if (req.body.courseId) {
      const course = await Course.findOne({ _id: req.body.courseId, user: req.user.id })
      if (!course) throw new ApiError('Course not found', 404)
      grade.courseName = course.name
    } else {
      grade.courseName = ''
    }
    grade.courseId = req.body.courseId || null
  }

  const allowed = ['title', 'score', 'maxScore', 'assignmentId', 'type', 'semester', 'notes', 'gradedAt']
  allowed.forEach(field => {
    if (req.body[field] !== undefined) {
      grade[field] = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field]
    }
  })

  await grade.save()
  return sendSuccess(res, grade, 'Grade updated successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a grade entry
// @route   DELETE /api/grades/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteGrade = asyncHandler(async (req, res) => {
  const grade = await Grade.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!grade) throw new ApiError('Grade not found', 404)
  return sendSuccess(res, {}, 'Grade deleted successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get GPA summary aggregated by course / overall
// @route   GET /api/grades/summary
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getGradeSummary = asyncHandler(async (req, res) => {
  const { semester } = req.query
  const matchStage = { user: req.user.id }
  // Convert user string to ObjectId for aggregation
  const mongoose = require('mongoose')
  matchStage.user = new mongoose.Types.ObjectId(req.user.id)
  if (semester) matchStage.semester = semester

  const pipeline = [
    { $match: matchStage },
    {
      $addFields: {
        pct: { $cond: [{ $gt: ['$maxScore', 0] }, { $multiply: [{ $divide: ['$score', '$maxScore'] }, 100] }, 0] }
      }
    },
    {
      $group: {
        _id: '$courseId',
        courseName: { $first: '$courseName' },
        averagePct: { $avg: '$pct' },
        count:      { $sum: 1 },
        totalScore: { $sum: '$score' },
        totalMax:   { $sum: '$maxScore' },
      }
    },
    { $sort: { courseName: 1 } }
  ]

  const byCourse = await Grade.aggregate(pipeline)

  // Overall average
  const all = await Grade.aggregate([
    { $match: matchStage },
    { $addFields: { pct: { $cond: [{ $gt: ['$maxScore', 0] }, { $multiply: [{ $divide: ['$score', '$maxScore'] }, 100] }, 0] } } },
    { $group: { _id: null, overall: { $avg: '$pct' }, count: { $sum: 1 } } }
  ])
  const overall = all[0]?.overall ?? null

  return sendSuccess(res, { byCourse, overall }, 'Grade summary retrieved successfully')
})

module.exports = { getGrades, getGrade, createGrade, updateGrade, deleteGrade, getGradeSummary }
