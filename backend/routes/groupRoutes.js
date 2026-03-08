const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createGroup,
    inviteMember,
    deleteGroup,
    getGroupDetails,
    leaveGroup
} = require('../controllers/groupController');

const {
    addGroupExpense,
    getSplitSummary,
    getSettlements
} = require('../controllers/groupExpenseController');

// Group Administration Routes
router.post('/create', protect, createGroup);
router.post('/invite', protect, inviteMember);
router.get('/:id', protect, getGroupDetails);
router.delete('/:id', protect, deleteGroup);
router.post('/leave/:id', protect, leaveGroup);

// Group Financial Routes
router.post('/expense', protect, addGroupExpense);
router.get('/split-summary/:groupId', protect, getSplitSummary);
router.get('/settlement/:groupId', protect, getSettlements);

module.exports = router;
