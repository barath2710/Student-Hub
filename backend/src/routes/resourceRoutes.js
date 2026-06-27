const express = require('express')
const {
  uploadResource,
  getAllResources,
  getRecentResources,
  getResourceStats,
  renameResource,
  deleteResource,
} = require('../controllers/resourceController')
const { protect } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')

const router = express.Router()

// All resource routes are protected
router.use(protect)

// GET /api/resources/stats  — must be before /:id to avoid param collision
router.get('/stats', getResourceStats)

// GET /api/resources/recent
router.get('/recent', getRecentResources)

// GET /api/resources  — paginated list with search + subject filter
// POST /api/resources — upload a new file
router.route('/')
  .get(getAllResources)
  .post(upload.single('file'), uploadResource)

// PATCH /api/resources/:id  — rename/update metadata
// DELETE /api/resources/:id — delete file + record
router.route('/:id')
  .patch(renameResource)
  .delete(deleteResource)

module.exports = router
