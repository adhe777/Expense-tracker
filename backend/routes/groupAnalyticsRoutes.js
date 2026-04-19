const express = require('express');
const router = express.Router();
const { getGroupAnalytics, getGroupAIInsights } = require('../controllers/groupAnalyticsController');
const { protect } = require('../middleware/authMiddleware');
const { groupMemberMiddleware } = require('../middleware/adminMiddleware');

router.get('/:groupId/analytics', protect, getGroupAnalytics);
router.get('/:groupId/ai-insights', protect, getGroupAIInsights);

module.exports = router;
