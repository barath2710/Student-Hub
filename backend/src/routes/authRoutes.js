const express = require('express')
const {
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
} = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const { registerValidator, loginValidator } = require('../validators/authValidators')

const router = express.Router()

// Public
router.post('/register', registerValidator, register)
router.post('/login',    loginValidator, login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.post('/social-login', socialLogin)
router.post('/mobile-login', mobileLogin)
router.post('/mobile-verify', mobileVerify)

// Private – token required
router.get('/me',          protect, getCurrentUser)
router.put('/me',          protect, updateProfile)
router.put('/me/password', protect, changePassword)

module.exports = router
