const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createGroup,
    inviteMember,
    deleteGroup,
    getGroupDetails,
    leaveGroup,
    getNotifications,
    acceptInvite,
    rejectInvite,
    removeMember
} = require('../controllers/groupController');

const {
    addGroupExpense,
    getSplitSummary,
    getSettlements,
    settleDebt
} = require('../controllers/groupExpenseController');

// Group Administration Routes
router.post('/create', protect, createGroup);
router.post('/invite', protect, inviteMember);
router.post('/remove', protect, removeMember);
router.get('/:id', protect, getGroupDetails);
router.delete('/:id', protect, deleteGroup);
router.post('/leave/:id', protect, leaveGroup);

// Notification Routes
router.get('/user/notifications', protect, getNotifications);
router.post('/invite/accept/:notificationId', protect, acceptInvite);
router.post('/invite/reject/:notificationId', protect, rejectInvite);

// Group Financial Routes
router.post('/expense', protect, addGroupExpense);
router.post('/settle', protect, settleDebt);
router.get('/split-summary/:groupId', protect, getSplitSummary);
router.get('/settlement/:groupId', protect, getSettlements);

module.exports = router;
