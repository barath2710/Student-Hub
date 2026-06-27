const express = require('express')
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require('../controllers/assignmentController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()
router.use(protect)

router.route('/')
  .get(getAssignments)
  .post(createAssignment)

router.route('/:id')
  .get(getAssignment)
  .put(updateAssignment)
  .delete(deleteAssignment)

module.exports = router
