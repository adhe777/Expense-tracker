const express = require('express');
const router = express.Router();
const { getGroupAnalytics, getGroupAIInsights } = require('../controllers/groupAnalyticsController');
const { protect } = require('../middleware/authMiddleware');
const { groupMemberMiddleware } = require('../middleware/adminMiddleware');

router.get('/:groupId/analytics', protect, groupMemberMiddleware, getGroupAnalytics);
router.get('/:groupId/ai-insights', protect, groupMemberMiddleware, getGroupAIInsights);

module.exports = router;
