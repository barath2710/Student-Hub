const express = require('express')
const {
  createStudyPlan,
  getStudyPlans,
  getStudyPlan,
  updateBlockStatus,
  deleteStudyPlan
} = require('../controllers/studyPlanController')
const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// Secure all routes
router.use(protect)

router.route('/')
  .post(createStudyPlan)
  .get(getStudyPlans)

router.route('/:id')
  .get(getStudyPlan)
  .delete(deleteStudyPlan)

router.patch('/:id/block/:blockId', updateBlockStatus)

module.exports = router
