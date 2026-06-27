const mongoose = require('mongoose')
const Task = require('../models/Task')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { sendSuccess, sendCreated } = require('../utils/responseHandler')

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all tasks for authenticated user (paginated, searchable, filterable)
// @route   GET /api/tasks
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAllTasks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 20
  const skip = (page - 1) * limit

  const filter = { user: req.user.id }

  // Status Filter
  if (req.query.status) {
    filter.status = req.query.status
  }

  // Priority Filter
  if (req.query.priority) {
    filter.priority = req.query.priority
  }

  // Search Filter (text index search)
  if (req.query.search) {
    filter.$text = { $search: req.query.search }
  }

  let tasksQuery = Task.find(filter)

  // Sorting: pending first (status: -1), earliest due date first (dueDate: 1), newest created first (createdAt: -1)
  // If search query is present, we include relevance textScore sorting as second priority
  if (req.query.search) {
    tasksQuery = tasksQuery
      .sort({
        status: -1,
        score: { $meta: 'textScore' },
        dueDate: 1,
        createdAt: -1
      })
  } else {
    tasksQuery = tasksQuery.sort({
      status: -1,
      dueDate: 1,
      createdAt: -1
    })
  }

  const [total, tasks] = await Promise.all([
    Task.countDocuments(filter),
    tasksQuery.skip(skip).limit(limit)
  ])

  const pagination = {
    total,
    page,
    pages: Math.ceil(total / limit),
    limit
  }

  sendSuccess(res, { tasks, pagination }, 'Tasks retrieved successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get task statistics for the user (using MongoDB Aggregation)
// @route   GET /api/tasks/stats
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getTaskStats = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    throw new ApiError('Invalid User ID format', 400)
  }
  const userId = new mongoose.Types.ObjectId(req.user.id)
  
  const timezoneOffset = parseInt(req.query.timezoneOffset, 10) || 0
  const now = new Date()
  const userLocalTime = new Date(now.getTime() - (timezoneOffset * 60 * 1000))
  
  userLocalTime.setUTCHours(0, 0, 0, 0)
  const startOfToday = new Date(userLocalTime.getTime() + (timezoneOffset * 60 * 1000))
  
  userLocalTime.setUTCHours(23, 59, 59, 999)
  const endOfToday = new Date(userLocalTime.getTime() + (timezoneOffset * 60 * 1000))

  const stats = await Task.aggregate([
    { $match: { user: userId } },
    {
      $facet: {
        total: [{ $count: 'count' }],
        statusCounts: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        priorityCounts: [
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ],
        overdueCount: [
          {
            $match: {
              status: 'pending',
              dueDate: { $exists: true, $ne: null, $lt: new Date() }
            }
          },
          { $count: 'count' }
        ],
        dueTodayCount: [
          {
            $match: {
              status: 'pending',
              dueDate: {
                $gte: startOfToday,
                $lte: endOfToday
              }
            }
          },
          { $count: 'count' }
        ]
      }
    }
  ])

  const result = stats[0]

  const totalTasks = result.total[0]?.count || 0
  const completedTasks = result.statusCounts.find(s => s._id === 'completed')?.count || 0
  const pendingTasks = result.statusCounts.find(s => s._id === 'pending')?.count || 0
  const overdueTasks = result.overdueCount[0]?.count || 0
  const dueTodayTasks = result.dueTodayCount[0]?.count || 0

  const priorityBreakdown = {
    low: result.priorityCounts.find(p => p._id === 'low')?.count || 0,
    medium: result.priorityCounts.find(p => p._id === 'medium')?.count || 0,
    high: result.priorityCounts.find(p => p._id === 'high')?.count || 0
  }

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  sendSuccess(
    res,
    {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      dueTodayTasks,
      completionRate,
      priorityBreakdown
    },
    'Task statistics retrieved successfully'
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get details of a single task
// @route   GET /api/tasks/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id })
  if (!task) {
    throw new ApiError('Task not found', 404)
  }
  sendSuccess(res, { task }, 'Task retrieved successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate } = req.body

  const task = await Task.create({
    title,
    description: description || '',
    priority: priority || 'medium',
    status: 'pending',
    dueDate: dueDate || undefined,
    user: req.user.id
  })

  sendCreated(res, { task }, 'Task created successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a task by ID
// @route   PUT /api/tasks/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id })
  if (!task) {
    throw new ApiError('Task not found', 404)
  }

  const { title, description, priority, dueDate, status } = req.body

  if (title !== undefined) task.title = title
  if (description !== undefined) task.description = description
  if (priority !== undefined) task.priority = priority
  
  // Set status and update completedAt timestamp accordingly
  if (status !== undefined) {
    task.status = status
    if (status === 'completed') {
      task.completedAt = task.completedAt || new Date()
    } else {
      task.completedAt = undefined
    }
  }

  if (dueDate !== undefined) {
    task.dueDate = dueDate || undefined
  }

  await task.save()

  sendSuccess(res, { task }, 'Task updated successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Toggle task completion status
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const toggleTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id })

  if (!task) {
    throw new ApiError('Task not found', 404)
  }

  task.status = task.status === 'completed' ? 'pending' : 'completed'
  
  if (task.status === 'completed') {
    task.completedAt = new Date()
  } else {
    task.completedAt = undefined
  }

  await task.save()

  sendSuccess(
    res,
    { task },
    `Task marked ${task.status === 'completed' ? 'completed' : 'pending'} successfully`
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a task by ID
// @route   DELETE /api/tasks/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!task) {
    throw new ApiError('Task not found', 404)
  }
  sendSuccess(res, null, 'Task deleted successfully')
})

module.exports = {
  getAllTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask
}
