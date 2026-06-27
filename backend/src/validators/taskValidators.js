const { body, query, param } = require('express-validator')

const createTaskRules = [
  body('title')
    .trim()
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('priority')
    .optional()
    .isString()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isString()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be pending or completed'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 date string')
    .custom((value, { req }) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        throw new Error('Due date must be a valid date')
      }
      const timezoneOffset = parseInt(req.query.timezoneOffset || req.body.timezoneOffset, 10) || 0
      const now = new Date()
      const userLocalNow = new Date(now.getTime() - (timezoneOffset * 60000))
      userLocalNow.setUTCHours(0, 0, 0, 0)
      const startOfUserTodayUTC = new Date(userLocalNow.getTime() + (timezoneOffset * 60000))
      
      if (date < new Date(startOfUserTodayUTC.getTime() - 60000)) {
        throw new Error('Due date cannot be in the past')
      }
      return true
    })
]

const updateTaskRules = [
  body('title')
    .optional()
    .trim()
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('priority')
    .optional()
    .isString()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('status')
    .optional()
    .isString()
    .isIn(['pending', 'completed'])
    .withMessage('Status must be pending or completed'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 date string')
    .custom((value, { req }) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        throw new Error('Due date must be a valid date')
      }
      const timezoneOffset = parseInt(req.query.timezoneOffset || req.body.timezoneOffset, 10) || 0
      const now = new Date()
      const userLocalNow = new Date(now.getTime() - (timezoneOffset * 60000))
      userLocalNow.setUTCHours(0, 0, 0, 0)
      const startOfUserTodayUTC = new Date(userLocalNow.getTime() + (timezoneOffset * 60000))
      
      if (date < new Date(startOfUserTodayUTC.getTime() - 60000)) {
        throw new Error('Due date cannot be in the past')
      }
      return true
    })
]

const queryRules = [
  query('search')
    .optional()
    .isString()
    .trim(),
  query('status')
    .optional()
    .isString()
    .isIn(['pending', 'completed'])
    .withMessage('Status filter must be pending or completed'),
  query('priority')
    .optional()
    .isString()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority filter must be low, medium, or high'),
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be an integer between 1 and 1000'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  query('timezoneOffset')
    .optional()
    .isInt()
    .withMessage('Timezone offset must be an integer')
]

const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Task ID format')
]

module.exports = {
  createTaskRules,
  updateTaskRules,
  queryRules,
  idParamRules
}
