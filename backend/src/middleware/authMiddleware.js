const jwt = require('jsonwebtoken')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

/**
 * Protect middleware – verifies the JWT in the Authorization header.
 * Attaches the decoded payload to req.user for downstream handlers.
 */
const protect = asyncHandler(async (req, _res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    throw new ApiError('Not authorised – no token', 401)
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    throw new ApiError('Not authorised – invalid token', 401)
  }
})

/**
 * Role-based access control middleware.
 * Usage: router.get('/admin', protect, authorize('admin'), handler)
 */
const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new ApiError(
      `Role '${req.user.role}' is not authorised to access this route`,
      403
    )
  }
  next()
}

module.exports = { protect, authorize }
