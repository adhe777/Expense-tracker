const express = require('express');
const router = express.Router();
const { createGroup, inviteMember, getGroup, deleteGroup } = require('../controllers/groupController');
const { addGroupExpense, getSettlement } = require('../controllers/groupExpenseController');
const { getGroupInsights } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create', protect, createGroup);
router.post('/invite', protect, inviteMember);
router.get('/:id', protect, getGroup);
router.delete('/:id', protect, deleteGroup);

router.post('/expense', protect, addGroupExpense);
router.get('/settlement/:groupId', protect, getSettlement);
router.get('/insights/:groupId', protect, getGroupInsights);

module.exports = router;
