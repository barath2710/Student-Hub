const StudyPlan = require('../models/StudyPlan')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { sendSuccess, sendCreated } = require('../utils/responseHandler')
const genAI = require('../config/gemini')

// Helper to generate a fallback plan locally
function generateFallbackBlocks(syllabus, startDate, endDate, intensity) {
  const topics = syllabus
    .split(/\r?\n|;|,/)
    .map(t => t.trim())
    .filter(t => t.length > 0 && !t.match(/^\s*$/))

  if (topics.length === 0) {
    topics.push('General Subject Review')
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  
  // Set times to midnight to calculate correct days
  start.setHours(0,0,0,0)
  end.setHours(0,0,0,0)

  const diffTime = Math.max(0, end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1

  const blocks = []
  
  // Default values based on intensity
  let duration = 45
  let pomodoroCount = 2
  if (intensity === 'relaxed') {
    duration = 30
    pomodoroCount = 1
  } else if (intensity === 'intense') {
    duration = 90
    pomodoroCount = 4
  }

  for (let i = 0; i < diffDays; i++) {
    const blockDate = new Date(start)
    blockDate.setDate(start.getDate() + i)
    const dateStr = blockDate.toISOString().split('T')[0]

    let topicForDay = ''
    if (diffDays >= topics.length) {
      if (i === diffDays - 1) {
        topicForDay = 'Final revision & mock test'
      } else {
        const topicIndex = i % topics.length
        topicForDay = topics[topicIndex]
      }
    } else {
      const topicsPerDay = Math.ceil(topics.length / diffDays)
      const startIdx = i * topicsPerDay
      const endIdx = Math.min(startIdx + topicsPerDay, topics.length)
      topicForDay = topics.slice(startIdx, endIdx).join(', ')
    }

    blocks.push({
      date: dateStr,
      topic: topicForDay,
      duration,
      status: 'pending',
      pomodoroCount
    })
  }

  return blocks
}

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new AI generated Study Plan
// @route   POST /api/study-plans
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createStudyPlan = asyncHandler(async (req, res) => {
  const { title, subject, targetDate, intensity, syllabus } = req.body

  if (!title || !subject || !targetDate || !syllabus) {
    throw new ApiError('Title, subject, targetDate, and syllabus are required', 400)
  }

  const startDate = new Date()
  const endDate = new Date(targetDate)

  if (endDate <= startDate) {
    throw new ApiError('Target date must be in the future', 400)
  }

  const startStr = startDate.toISOString().split('T')[0]
  const endStr = endDate.toISOString().split('T')[0]

  let blocks = []

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' }
    })

    const systemInstruction = `You are Jarvis, a study helper. You generate study plans as a JSON object.
The JSON must contain a single top-level key "blocks" which is an array of objects.
Each block object must contain:
- "date": string in YYYY-MM-DD format (consecutively starting from "${startStr}" to "${endStr}")
- "topic": string (the specific syllabus section/topic to cover that day)
- "duration": integer (study session duration in minutes)
- "pomodoroCount": integer (number of estimated Pomodoro intervals, e.g. 1 to 4)
Keep topics balanced and realistic. Respond ONLY with valid JSON.`

    const prompt = `Generate a ${intensity || 'balanced'} study plan for the subject "${subject}" (Title: "${title}").
The exam/target date is ${endStr}.
The syllabus is:
---
${syllabus}
---`

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    })

    const data = JSON.parse(result.response.text())
    if (data && Array.isArray(data.blocks)) {
      blocks = data.blocks.map(b => ({
        date: b.date,
        topic: b.topic,
        duration: Number(b.duration) || 45,
        status: 'pending',
        pomodoroCount: Number(b.pomodoroCount) || 2
      }))
    }
  } catch (err) {
    console.warn('⚠️ Gemini API failed for Study Scheduler, running local fallback parser. Error:', err.message)
    blocks = generateFallbackBlocks(syllabus, startDate, endDate, intensity || 'balanced')
  }

  // Create the plan
  const plan = await StudyPlan.create({
    user: req.user.id,
    title,
    subject,
    targetDate: endDate,
    intensity: intensity || 'balanced',
    syllabus,
    blocks
  })

  return sendCreated(res, plan, 'Study plan generated successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all study plans for the user
// @route   GET /api/study-plans
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getStudyPlans = asyncHandler(async (req, res) => {
  const plans = await StudyPlan.find({ user: req.user.id }).sort({ createdAt: -1 })
  return sendSuccess(res, plans, 'Study plans retrieved')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single study plan by ID
// @route   GET /api/study-plans/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getStudyPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOne({ _id: req.params.id, user: req.user.id })
  if (!plan) {
    throw new ApiError('Study plan not found', 404)
  }
  return sendSuccess(res, plan, 'Study plan retrieved')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Toggle or update the status of a specific block inside a study plan
// @route   PATCH /api/study-plans/:id/block/:blockId
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateBlockStatus = asyncHandler(async (req, res) => {
  const { id, blockId } = req.params
  const { status } = req.body

  if (!status || !['pending', 'completed'].includes(status)) {
    throw new ApiError('Valid status is required', 400)
  }

  const plan = await StudyPlan.findOne({ _id: id, user: req.user.id })
  if (!plan) {
    throw new ApiError('Study plan not found', 404)
  }

  const block = plan.blocks.id(blockId)
  if (!block) {
    throw new ApiError('Study block not found', 404)
  }

  block.status = status
  await plan.save()

  return sendSuccess(res, plan, 'Block status updated')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a study plan
// @route   DELETE /api/study-plans/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteStudyPlan = asyncHandler(async (req, res) => {
  const plan = await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!plan) {
    throw new ApiError('Study plan not found', 404)
  }
  return sendSuccess(res, {}, 'Study plan deleted successfully')
})

module.exports = {
  createStudyPlan,
  getStudyPlans,
  getStudyPlan,
  updateBlockStatus,
  deleteStudyPlan
}
