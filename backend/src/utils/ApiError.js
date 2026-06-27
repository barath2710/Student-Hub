/**
 * Custom API Error class.
 * Extends the native Error to carry an HTTP statusCode.
 *
 * Usage:
 *   throw new ApiError('Not found', 404)
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = ApiError
