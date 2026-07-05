const User            = require('../models/User')
const asyncHandler    = require('../utils/asyncHandler')
const ApiError        = require('../utils/ApiError')
const { sendSuccess, sendCreated } = require('../utils/responseHandler')

// ─── Helpers: daily dates ───────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10)
const yesterdayStr = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

// ─── Helper: evaluate and update active study streaks ──────────────────────────
const updateStreak = async (user) => {
  const today = todayStr()
  const yesterday = yesterdayStr()

  if (user.lastActiveDate === today) {
    return user
  }

  if (user.lastActiveDate === yesterday) {
    user.currentStreak = (user.currentStreak || 0) + 1
    if (user.currentStreak > (user.longestStreak || 0)) {
      user.longestStreak = user.currentStreak
    }
  } else {
    user.currentStreak = 1
    if (!user.longestStreak || user.longestStreak < 1) {
      user.longestStreak = 1
    }
  }

  user.lastActiveDate = today
  await user.save()
  return user
}

// ─── Helper: strip sensitive fields and return a clean user object ─────────────
const sanitizeUser = (user) => ({
  id:    user._id,
  name:  user.name,
  email: user.email,
  role:  user.role,
  createdAt: user.createdAt,
  currentStreak: user.currentStreak || 0,
  longestStreak: user.longestStreak || 0,
  lastActiveDate: user.lastActiveDate
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    throw new ApiError('Name, email and password are required', 400)
  }

  const existing = await User.findOne({ email })
  if (existing) {
    throw new ApiError('An account with that email already exists', 409)
  }

  const today = todayStr()
  const user  = await User.create({
    name,
    email,
    password,
    currentStreak: 1,
    longestStreak: 1,
    lastActiveDate: today
  })
  const token = user.getSignedJwtToken()

  sendCreated(res, { token, user: sanitizeUser(user) }, 'Account created successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new ApiError('Email and password are required', 400)
  }

  // Explicitly select password since it is excluded by default
  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    throw new ApiError('Invalid email or password', 401)
  }

  const isMatch = await user.matchPassword(password)
  if (!isMatch) {
    throw new ApiError('Invalid email or password', 401)
  }

  await updateStreak(user)
  const token = user.getSignedJwtToken()

  sendSuccess(res, { token, user: sanitizeUser(user) }, 'Login successful')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private (requires JWT via protect middleware)
// ─────────────────────────────────────────────────────────────────────────────
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
  if (!user) {
    throw new ApiError('User not found', 404)
  }
  await updateStreak(user)
  sendSuccess(res, { user: sanitizeUser(user) }, 'User fetched successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Change the authenticated user's password
// @route   PUT /api/auth/me/password
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    throw new ApiError('currentPassword and newPassword are required', 400)
  }
  if (newPassword.length < 8) {
    throw new ApiError('New password must be at least 8 characters', 400)
  }
  if (currentPassword === newPassword) {
    throw new ApiError('New password must be different from your current password', 400)
  }

  // Fetch with password field (excluded by default)
  const user = await User.findById(req.user.id).select('+password')
  if (!user) throw new ApiError('User not found', 404)

  const isMatch = await user.matchPassword(currentPassword)
  if (!isMatch) throw new ApiError('Current password is incorrect', 401)

  user.password = newPassword
  await user.save() // pre-save hook hashes the new password

  sendSuccess(res, null, 'Password updated successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update the authenticated user's profile (name)
// @route   PUT /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const { name } = req.body

  if (!name || !name.trim()) {
    throw new ApiError('Name is required', 400)
  }
  if (name.trim().length < 2) {
    throw new ApiError('Name must be at least 2 characters', 400)
  }

  const user = await User.findById(req.user.id)
  if (!user) throw new ApiError('User not found', 404)

  user.name = name.trim()
  await user.save()

  sendSuccess(res, { user: sanitizeUser(user) }, 'Profile updated successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Request password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  if (!email) {
    throw new ApiError('Email is required', 400)
  }

  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError('No user found with that email address', 404)
  }

  const crypto = require('crypto')
  const resetToken = crypto.randomBytes(20).toString('hex')

  user.resetPasswordToken = resetToken
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000 // 15 mins
  await user.save()

  // In production, send a real email. For development/sandbox, we return the token in response
  sendSuccess(res, { resetToken }, 'Password reset link generated. In production, an email would be sent.')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  if (!password || password.length < 6) {
    throw new ApiError('Password must be at least 6 characters', 400)
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() }
  })

  if (!user) {
    throw new ApiError('Invalid or expired reset token', 400)
  }

  user.password = password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined
  await user.save()

  sendSuccess(res, null, 'Password has been reset successfully. You can now login.')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    OAuth Social Login (Google / GitHub)
// @route   POST /api/auth/social-login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const socialLogin = asyncHandler(async (req, res) => {
  const { provider, id, email, name } = req.body

  if (!provider || !id || !name) {
    throw new ApiError('Provider, id, and name are required', 400)
  }

  let user = null

  if (provider === 'google') {
    user = await User.findOne({ googleId: id })
  } else if (provider === 'github') {
    user = await User.findOne({ githubId: id })
  } else {
    throw new ApiError('Invalid social provider', 400)
  }

  // If no user found by social ID, search by email
  if (!user && email) {
    user = await User.findOne({ email })
    if (user) {
      // Bind social ID to existing account
      if (provider === 'google') user.googleId = id
      if (provider === 'github') user.githubId = id
      await user.save()
    }
  }

  // If still no user, create a new one
  if (!user) {
    const today = todayStr()
    const userFields = {
      name,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today
    }
    if (email) userFields.email = email
    if (provider === 'google') userFields.googleId = id
    if (provider === 'github') userFields.githubId = id

    user = await User.create(userFields)
  }

  await updateStreak(user)
  const token = user.getSignedJwtToken()

  sendSuccess(res, { token, user: sanitizeUser(user) }, `Logged in successfully via ${provider}`)
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Request mobile OTP login
// @route   POST /api/auth/mobile-login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const mobileLogin = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body
  if (!phoneNumber) {
    throw new ApiError('Phone number is required', 400)
  }

  // For simulation / sandbox, we send a standard OTP: 123456
  sendSuccess(res, { otp: '123456' }, 'OTP code sent successfully (sandbox OTP is 123456)')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Verify mobile OTP and login
// @route   POST /api/auth/mobile-verify
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const mobileVerify = asyncHandler(async (req, res) => {
  const { phoneNumber, code } = req.body

  if (!phoneNumber || !code) {
    throw new ApiError('Phone number and code are required', 400)
  }

  if (code !== '123456') {
    throw new ApiError('Invalid verification code', 400)
  }

  let user = await User.findOne({ phoneNumber })

  if (!user) {
    const today = todayStr()
    // Generate a default name from the last 4 digits of the phone number
    const suffix = phoneNumber.slice(-4)
    user = await User.create({
      name: `Student_${suffix}`,
      phoneNumber,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today
    })
  }

  await updateStreak(user)
  const token = user.getSignedJwtToken()

  sendSuccess(res, { token, user: sanitizeUser(user) }, 'Mobile login successful')
})

module.exports = {
  register,
  login,
  getCurrentUser,
  changePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
  socialLogin,
  mobileLogin,
  mobileVerify
}
