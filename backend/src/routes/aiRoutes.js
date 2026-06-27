const express = require('express')
const {
  newSession,
  getSessions,
  getSession,
  deleteSession,
  chat,
  summarize,
  generateFlashcards,
  generateQuiz,
  saveQuizAttempt,
  getQuizAttempts,
  getFlashcardSets,
  getFlashcardSet,
  deleteFlashcardSet,
  analyzeResume,
  getResumeAnalyses,
  deleteResumeAnalysis
} = require('../controllers/aiController')
const { protect } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

const router = express.Router()

// All AI assistant routes are protected
router.use(protect)

// Chat Session Routes
router.route('/sessions')
  .post(newSession)
  .get(getSessions)

router.route('/sessions/:id')
  .get(getSession)
  .delete(deleteSession)

// Jarvis Main Chat endpoint
router.post('/chat', chat)

// AI Specialized Tools
router.post('/summarize', summarize)

// Flashcard sets
router.route('/flashcards')
  .post(generateFlashcards)
  .get(getFlashcardSets)

router.route('/flashcards/:id')
  .get(getFlashcardSet)
  .delete(deleteFlashcardSet)

router.post('/quiz', generateQuiz)

// Quiz Attempt storage
router.route('/quizzes/attempts')
  .post(saveQuizAttempt)
  .get(getQuizAttempts)

// Resume Analysis
router.post('/resume/analyze', upload.single('file'), analyzeResume)
router.get('/resume/analyses', getResumeAnalyses)
router.delete('/resume/analyses/:id', deleteResumeAnalysis)

module.exports = router


