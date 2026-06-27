const express = require('express')
const {
  getAllNotes,
  getNoteStats,
  getAllTags,
  getNoteById,
  createNote,
  updateNote,
  togglePin,
  toggleArchive,
  deleteNote
} = require('../controllers/noteController')
const { protect } = require('../middleware/authMiddleware')
const validate = require('../middleware/validate')
const {
  createNoteRules,
  updateNoteRules,
  queryRules,
  idParamRules
} = require('../validators/noteValidators')

const router = express.Router()

// Apply protect middleware to all note routes
router.use(protect)

// GET /api/notes/stats - Note statistics (placed before :id route)
router.get('/stats', getNoteStats)

// GET /api/notes/tags - Distinct tags for user (placed before :id route)
router.get('/tags', getAllTags)

// GET /api/notes and POST /api/notes
router.route('/')
  .get(queryRules, validate, getAllNotes)
  .post(createNoteRules, validate, createNote)

// GET, PUT, and DELETE /api/notes/:id
router.route('/:id')
  .get(idParamRules, validate, getNoteById)
  .put(idParamRules, updateNoteRules, validate, updateNote)
  .delete(idParamRules, validate, deleteNote)

// PATCH /api/notes/:id/pin and PATCH /api/notes/:id/archive
router.patch('/:id/pin', idParamRules, validate, togglePin)
router.patch('/:id/archive', idParamRules, validate, toggleArchive)

module.exports = router
