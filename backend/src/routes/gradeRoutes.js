const express = require('express')
const {
  getGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
  getGradeSummary,
} = require('../controllers/gradeController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()
router.use(protect)

// Summary (must come before /:id to avoid param conflict)
router.get('/summary', getGradeSummary)

router.route('/')
  .get(getGrades)
  .post(createGrade)

router.route('/:id')
  .get(getGrade)
  .put(updateGrade)
  .delete(deleteGrade)

module.exports = router
