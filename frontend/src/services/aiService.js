// ─── Jarvis AI API Service ─────────────────────────────────────────────────────
import api from './api'

/**
 * Create a new empty chat session.
 * @param {string} [title]
 * @param {string} [resourceId]
 */
export const createSession = (title, resourceId) =>
  api.post('/ai/sessions', { title, resourceId })

/**
 * Get all chat sessions for the logged-in user.
 */
export const getSessions = () =>
  api.get('/ai/sessions')

/**
 * Get a specific chat session with messages.
 * @param {string} id
 */
export const getSession = (id) =>
  api.get(`/ai/sessions/${id}`)

/**
 * Delete a specific chat session.
 * @param {string} id
 */
export const deleteSession = (id) =>
  api.delete(`/ai/sessions/${id}`)

/**
 * Send a message to Jarvis.
 * @param {string} [sessionId]
 * @param {string} content
 * @param {string} [resourceId]
 */
export const chat = (sessionId, content, resourceId) =>
  api.post('/ai/chat', { sessionId, content, resourceId })

/**
 * Request a summary of text or a resource file.
 * @param {string} [text]
 * @param {string} [resourceId]
 */
export const summarize = (text, resourceId) =>
  api.post('/ai/summarize', { text, resourceId })

/**
 * Generate a flashcard deck using AI.
 * @param {string} topic
 * @param {number} count
 * @param {string} [resourceId]
 * @param {string} subject
 */
export const generateFlashcards = (topic, count, resourceId, subject) =>
  api.post('/ai/flashcards', { topic, count, resourceId, subject })

/**
 * Generate a quiz using AI.
 * @param {string} topic
 * @param {number} count
 * @param {string} [resourceId]
 * @param {string} subject
 */
export const generateQuiz = (topic, count, resourceId, subject) =>
  api.post('/ai/quiz', { topic, count, resourceId, subject })

/**
 * Save a completed quiz attempt.
 * @param {{ title: string, subject: string, questions: Array, userAnswers: Array, score: number, weakAreas: Array }} payload
 */
export const saveQuizAttempt = (payload) =>
  api.post('/ai/quizzes/attempts', payload)

/**
 * Fetch past quiz attempts.
 */
export const getQuizAttempts = () =>
  api.get('/ai/quizzes/attempts')

/**
 * Fetch all flashcard sets for the user.
 */
export const getFlashcardSets = () =>
  api.get('/ai/flashcards')

/**
 * Fetch a specific flashcard set by ID.
 * @param {string} id
 */
export const getFlashcardSet = (id) =>
  api.get(`/ai/flashcards/${id}`)

/**
 * Delete a specific flashcard set.
 * @param {string} id
 */
export const deleteFlashcardSet = (id) =>
  api.delete(`/ai/flashcards/${id}`)

/**
 * Upload and analyze a resume file.
 * @param {FormData} formData
 */
export const analyzeResume = (formData) =>
  api.post('/ai/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

/**
 * Fetch all past resume analyses for the user.
 */
export const getResumeAnalyses = () =>
  api.get('/ai/resume/analyses')

/**
 * Delete a specific resume analysis.
 * @param {string} id
 */
export const deleteResumeAnalysis = (id) =>
  api.delete(`/ai/resume/analyses/${id}`)


