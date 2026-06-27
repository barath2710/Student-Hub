const { body, query, param } = require('express-validator')

const createNoteRules = [
  body('title')
    .trim()
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('content')
    .trim()
    .isString()
    .withMessage('Content must be a string')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 50000 })
    .withMessage('Content cannot exceed 50,000 characters'),
  body('subject')
    .optional()
    .trim()
    .isString()
    .withMessage('Subject must be a string')
    .isLength({ max: 100 })
    .withMessage('Subject cannot exceed 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((value) => {
      if (value.length > 10) {
        throw new Error('Tags array cannot exceed 10 items')
      }
      return true
    }),
  body('tags.*')
    .optional()
    .trim()
    .isString()
    .withMessage('Each tag must be a string')
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  body('color')
    .optional()
    .isString()
    .withMessage('Color must be a string')
    .isIn(['default', 'red', 'orange', 'yellow', 'green', 'teal', 'purple'])
    .withMessage('Color must be one of: default, red, orange, yellow, green, teal, purple')
]

const updateNoteRules = [
  body('title')
    .optional()
    .trim()
    .isString()
    .withMessage('Title must be a string')
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('content')
    .optional()
    .trim()
    .isString()
    .withMessage('Content must be a string')
    .notEmpty()
    .withMessage('Content cannot be empty')
    .isLength({ max: 50000 })
    .withMessage('Content cannot exceed 50,000 characters'),
  body('subject')
    .optional()
    .trim()
    .isString()
    .withMessage('Subject must be a string')
    .isLength({ max: 100 })
    .withMessage('Subject cannot exceed 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((value) => {
      if (value.length > 10) {
        throw new Error('Tags array cannot exceed 10 items')
      }
      return true
    }),
  body('tags.*')
    .optional()
    .trim()
    .isString()
    .withMessage('Each tag must be a string')
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  body('color')
    .optional()
    .isString()
    .withMessage('Color must be a string')
    .isIn(['default', 'red', 'orange', 'yellow', 'green', 'teal', 'purple'])
    .withMessage('Color must be one of: default, red, orange, yellow, green, teal, purple')
]

const queryRules = [
  query('search')
    .optional()
    .isString()
    .trim(),
  query('tag')
    .optional()
    .isString()
    .trim(),
  query('archived')
    .optional()
    .isBoolean()
    .withMessage('Archived filter must be a boolean (true/false)'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100')
]

const idParamRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Note ID format')
]

module.exports = {
  createNoteRules,
  updateNoteRules,
  queryRules,
  idParamRules
}
