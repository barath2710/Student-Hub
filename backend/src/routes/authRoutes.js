const express = require('express')
const { register, login, getCurrentUser, changePassword, updateProfile } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

const { registerValidator, loginValidator } = require('../validators/authValidators')

const router = express.Router()

// Public
router.post('/register', registerValidator, register)
router.post('/login',    loginValidator, login)

// Private – token required
router.get('/me',          protect, getCurrentUser)
router.put('/me',          protect, updateProfile)
router.put('/me/password', protect, changePassword)

module.exports = router
