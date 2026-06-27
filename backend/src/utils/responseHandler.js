/**
 * Standard API response helpers.
 * Keeps controller response shapes consistent across the whole API.
 */

const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data })
}

const sendCreated = (res, data = {}, message = 'Created') => {
  sendSuccess(res, data, message, 201)
}

const sendError = (res, message = 'Error', statusCode = 500, errors = null) => {
  const body = { success: false, message }
  if (errors) body.errors = errors
  res.status(statusCode).json(body)
}

module.exports = { sendSuccess, sendCreated, sendError }
