const Note = require('../models/Note')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { sendSuccess, sendCreated } = require('../utils/responseHandler')

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all notes for authenticated user (paginated, searchable, tag-filterable)
// @route   GET /api/notes
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAllNotes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 20
  const skip = (page - 1) * limit

  const filter = { user: req.user.id }

  // Archived query param handles boolean value.
  if (req.query.archived === 'true') {
    filter.isArchived = true
  } else {
    filter.isArchived = false
  }

  // Tag filtering (exact match, case insensitive)
  if (req.query.tag) {
    filter.tags = req.query.tag.trim().toLowerCase()
  }

  // Search filter using MongoDB text search
  if (req.query.search) {
    filter.$text = { $search: req.query.search }
  }

  let notesQuery = Note.find(filter)

  // If text search is active, sort by isPinned, then relevance score, then lastEditedAt.
  // Otherwise, sort by isPinned, then lastEditedAt.
  if (req.query.search) {
    notesQuery = notesQuery
      .sort({ isPinned: -1, score: { $meta: 'textScore' }, lastEditedAt: -1 })
  } else {
    notesQuery = notesQuery.sort({ isPinned: -1, lastEditedAt: -1 })
  }

  const [total, notes] = await Promise.all([
    Note.countDocuments(filter),
    notesQuery.skip(skip).limit(limit)
  ])

  const pagination = {
    total,
    page,
    pages: Math.ceil(total / limit),
    limit
  }

  sendSuccess(res, { notes, pagination }, 'Notes retrieved successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get note statistics for the user
// @route   GET /api/notes/stats
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getNoteStats = asyncHandler(async (req, res) => {
  const [totalNotes, pinnedNotes, archivedNotes, uniqueTags] = await Promise.all([
    Note.countDocuments({ user: req.user.id }),
    Note.countDocuments({ user: req.user.id, isPinned: true }),
    Note.countDocuments({ user: req.user.id, isArchived: true }),
    Note.distinct('tags', { user: req.user.id })
  ])

  sendSuccess(
    res,
    {
      totalNotes,
      pinnedNotes,
      archivedNotes,
      totalTags: uniqueTags.length
    },
    'Note statistics retrieved successfully'
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all distinct tags across user's notes
// @route   GET /api/notes/tags
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAllTags = asyncHandler(async (req, res) => {
  const tags = await Note.distinct('tags', { user: req.user.id })
  tags.sort()
  sendSuccess(res, { tags }, 'Tags retrieved successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single note by ID
// @route   GET /api/notes/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user.id })
  if (!note) {
    throw new ApiError('Note not found', 404)
  }
  sendSuccess(res, { note }, 'Note retrieved successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createNote = asyncHandler(async (req, res) => {
  const { title, content, subject, color } = req.body

  let tags = []
  if (req.body.tags && Array.isArray(req.body.tags)) {
    tags = req.body.tags.map(t => t.trim().toLowerCase()).filter(Boolean)
  }

  const note = await Note.create({
    title,
    content,
    subject: subject || '',
    tags,
    color: color || 'default',
    user: req.user.id
  })

  sendCreated(res, { note }, 'Note created successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a note by ID
// @route   PUT /api/notes/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user.id })
  if (!note) {
    throw new ApiError('Note not found', 404)
  }

  const { title, content, subject, tags, color } = req.body

  if (title !== undefined) note.title = title
  if (content !== undefined) note.content = content
  if (subject !== undefined) note.subject = subject

  if (tags && Array.isArray(tags)) {
    note.tags = tags.map(t => t.trim().toLowerCase()).filter(Boolean)
  }

  if (color !== undefined) note.color = color

  await note.save()

  sendSuccess(res, { note }, 'Note updated successfully')
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Toggle pin status of a note
// @route   PATCH /api/notes/:id/pin
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const togglePin = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user.id })
  if (!note) {
    throw new ApiError('Note not found', 404)
  }

  note.isPinned = !note.isPinned
  await note.save()

  sendSuccess(res, { note }, `Note ${note.isPinned ? 'pinned' : 'unpinned'} successfully`)
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Toggle archive status of a note
// @route   PATCH /api/notes/:id/archive
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const toggleArchive = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user.id })
  if (!note) {
    throw new ApiError('Note not found', 404)
  }

  note.isArchived = !note.isArchived
  // When archiving a note, unpin it automatically
  if (note.isArchived) {
    note.isPinned = false
  }
  await note.save()

  sendSuccess(res, { note }, `Note ${note.isArchived ? 'archived' : 'unarchived'} successfully`)
})

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a note by ID
// @route   DELETE /api/notes/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!note) {
    throw new ApiError('Note not found', 404)
  }
  sendSuccess(res, null, 'Note deleted successfully')
})

module.exports = {
  getAllNotes,
  getNoteStats,
  getAllTags,
  getNoteById,
  createNote,
  updateNote,
  togglePin,
  toggleArchive,
  deleteNote
}
