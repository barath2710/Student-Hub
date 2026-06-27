require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), override: true })
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')
const connectDB = require('./config/db')

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB()

const app = express()

// ─── Security Headers (helmet first — always) ─────────────────────────────────
app.use(helmet())

// ─── CORS ────────────────────────────────────────────────────────────────────
// In development: always allow all common Vite dev-server ports (5173-5176)
// so the server keeps working even when Vite bumps to the next free port.
// In production: only origins listed in CLIENT_URL (comma-separated) are trusted.
const isDev = process.env.NODE_ENV !== 'production'

const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
]

// Final list: env origins always included; dev ports added only in development
const allowedOrigins = isDev
  ? [...new Set([...envOrigins, ...DEV_ORIGINS])]
  : envOrigins

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no Origin header: curl, Postman, SSR)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin) || (isDev && origin.startsWith('http://localhost:'))) return callback(null, true)
    callback(new Error(`CORS: origin '${origin}' not allowed`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Respond to all OPTIONS preflight requests (Express 5 wildcard syntax)
app.options('/{*path}', cors())

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Static Files (uploaded resources) ──────────────────────────────────────
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')))

// ─── Logger (dev only) ────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/authRoutes'))
app.use('/api/notes',       require('./routes/noteRoutes'))
app.use('/api/tasks',       require('./routes/taskRoutes'))
app.use('/api/resources',   require('./routes/resourceRoutes'))
app.use('/api/pomodoro',    require('./routes/pomodoroRoutes'))
app.use('/api/ai',          require('./routes/aiRoutes'))
app.use('/api/study-plans', require('./routes/studyPlanRoutes'))
app.use('/api/courses',     require('./routes/courseRoutes'))
app.use('/api/assignments', require('./routes/assignmentRoutes'))
app.use('/api/grades',      require('./routes/gradeRoutes'))

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Backend Error:', err)
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// ─── Start Server ─────────────────────────────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`🚀  Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  })
}

module.exports = app
