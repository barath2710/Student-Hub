const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')

const UserSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type:     String,
      unique:   true,
      sparse:   true,
      lowercase: true,
      trim:     true,
      match:    [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type:      String,
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false, // never returned in queries by default
    },
    googleId: {
      type:      String,
      unique:    true,
      sparse:    true,
    },
    githubId: {
      type:      String,
      unique:    true,
      sparse:    true,
    },
    phoneNumber: {
      type:      String,
      unique:    true,
      sparse:    true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    role: {
      type:    String,
      enum:    ['student', 'teacher', 'admin'],
      default: 'student',
    },
    currentStreak: {
      type:    Number,
      default: 0,
    },
    longestStreak: {
      type:    Number,
      default: 0,
    },
    lastActiveDate: {
      type:    String,
      default: null,
    },
  },
  { timestamps: true }
)

// ─── Pre-save: hash password ───────────────────────────────────────────────────
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt   = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// ─── Instance method: compare plain-text password to hash ─────────────────────
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

// ─── Instance method: sign & return a JWT ─────────────────────────────────────
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )
}

module.exports = mongoose.model('User', UserSchema)
