const { validationResult } = require('express-validator')
const { sendError } = require('../utils/responseHandler')

/**
 * Validation middleware.
 * Place after express-validator rule arrays on route definitions:
 *
 *   router.post('/login', loginRules, validate, authController.login)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array())
  }
  next()
}

module.exports = validate
