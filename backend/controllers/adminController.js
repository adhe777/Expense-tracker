const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Group = require('../models/groupModel');
const Transaction = require('../models/transactionModel');
const Split = require('../models/splitModel');
const Notification = require('../models/notificationModel');

// @desc    Get platform stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({ role: { $ne: 'system_admin' } });
    const totalGroups = await Group.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalAmountSpentArr = await Transaction.aggregate([
        { $match: { type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalAmountSpent = totalAmountSpentArr.length > 0 ? totalAmountSpentArr[0].total : 0;

    const categoryStats = await Transaction.aggregate([
        { $match: { type: 'expense' } },
        { $group: { _id: '$category', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
        { $sort: { totalAmount: -1 } },
        { $project: { name: '$_id', count: 1, totalAmount: 1, _id: 0 } }
    ]);

    const userGrowth = await User.aggregate([
        { $match: { role: { $ne: 'system_admin' } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 12 },
        { $project: { date: '$_id', count: 1, _id: 0 } }
    ]);

    res.status(200).json({
        totalUsers,
        totalGroups,
        totalTransactions,
        totalAmountSpent,
        categoryStats,
        userGrowth
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    // Exclude system admins from the user list
    const users = await User.find({ role: { $ne: 'system_admin' } }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
});

// @desc    Get all groups with analytics
// @route   GET /api/admin/groups
// @access  Private/Admin
const getAllGroups = asyncHandler(async (req, res) => {
    const groups = await Group.find({})
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

    const groupsWithStats = await Promise.all(groups.map(async (group) => {
        const totalExpensesData = await Transaction.aggregate([
            { $match: { groupId: group._id, type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpenses = totalExpensesData.length > 0 ? totalExpensesData[0].total : 0;
        
        return {
            ...group._doc,
            memberCount: group.members.length,
            totalExpenses
        };
    }));

    res.status(200).json(groupsWithStats);
});

// @desc    Delete user
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    // Prevent deleting self
    if (req.params.id === req.user.id) {
        res.status(400);
        throw new Error('You cannot delete your own account');
    }
    const user = await User.findById(req.params.id);
    if (user) {
        if (user.role === 'system_admin') {
            res.status(400);
            throw new Error('Cannot delete a system admin account');
        }
        await Transaction.deleteMany({ user: user._id });
        await Group.updateMany(
            { members: user._id },
            { $pull: { members: user._id } }
        );
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete group (System Admin)
// @route   DELETE /api/admin/group/:id
// @access  Private/Admin
const deleteGroup = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id);
    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }
    // Cascade: remove group from every member's groups array
    await User.updateMany(
        { groups: group._id },
        { $pull: { groups: group._id } }
    );
    // Cascade: delete all related records
    await Transaction.deleteMany({ groupId: group._id });
    await Split.deleteMany({ groupId: group._id });
    await Notification.deleteMany({ relatedGroup: group._id });
    await Group.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id, message: 'Group removed' });
});

module.exports = {
    getAdminStats,
    getAllUsers,
    getAllGroups,
    deleteUser,
    deleteGroup
};
