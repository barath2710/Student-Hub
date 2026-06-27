const express = require('express')
const {
  getAllTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask
} = require('../controllers/taskController')
const { protect } = require('../middleware/authMiddleware')
const validate = require('../middleware/validate')
const {
  createTaskRules,
  updateTaskRules,
  queryRules,
  idParamRules
} = require('../validators/taskValidators')

const router = express.Router()

// Apply protect middleware to all task routes
router.use(protect)

// GET /api/tasks/stats - Task statistics (placed before :id route)
router.get('/stats', queryRules, validate, getTaskStats)

// GET /api/tasks and POST /api/tasks
router.route('/')
  .get(queryRules, validate, getAllTasks)
  .post(createTaskRules, validate, createTask)

// GET, PUT, and DELETE /api/tasks/:id
router.route('/:id')
  .get(idParamRules, validate, getTaskById)
  .put(idParamRules, updateTaskRules, validate, updateTask)
  .delete(idParamRules, validate, deleteTask)

// PATCH /api/tasks/:id/toggle - Quick-complete support
router.patch('/:id/toggle', idParamRules, validate, toggleTaskStatus)

module.exports = router
