const express = require('express');
const router = express.Router();
const {
    createGroup,
    inviteMember,
    removeMember,
    deleteGroup,
    getGroupDetails,
    leaveGroup,
    getNotifications,
    acceptInvite,
    rejectInvite,
    getGroupMembers,
    getGroupExpenses,
    transferGroupAdmin
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');
const { groupAdminMiddleware, groupMemberMiddleware } = require('../middleware/adminMiddleware');

const {
    addGroupExpense,
    getSplitSummary,
    getSettlements,
    settleDebt
} = require('../controllers/groupExpenseController');

// Group Administration Routes
router.post('/create', protect, createGroup); // Any protected user can create a group
router.post('/invite', protect, groupAdminMiddleware, inviteMember); // Ensure group admin
router.post('/transfer-admin', protect, groupAdminMiddleware, transferGroupAdmin); // Ensure group admin
router.post('/remove', protect, groupAdminMiddleware, removeMember); // Ensure group admin
router.post('/leave/:id', protect, groupMemberMiddleware, leaveGroup); // Member can leave

// Notification Routes (Personal - only needs protect)
router.get('/notifications', protect, getNotifications);
router.post('/invite/accept/:notificationId', protect, acceptInvite);
router.post('/invite/reject/:notificationId', protect, rejectInvite);

// New Group Admin & Member routes
router.get('/:groupId/members', protect, groupMemberMiddleware, getGroupMembers);
router.get('/:groupId/expenses', protect, groupMemberMiddleware, getGroupExpenses);
router.post('/:groupId/add-member', protect, groupAdminMiddleware, inviteMember); 
router.delete('/:groupId/remove-member/:memberId', protect, groupAdminMiddleware, removeMember); 

router.route('/:id')
    .get(protect, groupMemberMiddleware, getGroupDetails) // Members can view group details
    .delete(protect, groupAdminMiddleware, deleteGroup);  // Admins can delete group

// Group Financial Routes
router.post('/expense', protect, groupMemberMiddleware, addGroupExpense); // Members can add group expense
router.post('/settle', protect, groupMemberMiddleware, settleDebt);      // Members can settle debts
router.get('/split-summary/:groupId', protect, groupMemberMiddleware, getSplitSummary);
router.get('/settlement/:groupId', protect, groupMemberMiddleware, getSettlements);

module.exports = router;
