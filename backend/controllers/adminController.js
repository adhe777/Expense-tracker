const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Group = require('../models/groupModel');
const Transaction = require('../models/transactionModel');

// @desc    Get platform stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalGroups = await Group.countDocuments();
    const totalExpensesData = await Transaction.aggregate([
        { $match: { type: 'expense', isGroupExpense: true } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = totalExpensesData.length > 0 ? totalExpensesData[0].total : 0;

    const categoryStats = await Transaction.aggregate([
        { $match: { type: 'expense', isGroupExpense: true } },
        { $group: { _id: '$category', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
        { $sort: { totalAmount: -1 } }
    ]);

    const spendingTrend = await Transaction.aggregate([
        { $match: { type: 'expense', isGroupExpense: true } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                total: { $sum: "$amount" }
            }
        },
        { $sort: { "_id": 1 } },
        { $limit: 12 }
    ]);

    res.status(200).json({
        totalUsers,
        totalGroups,
        totalExpenses,
        categoryStats,
        spendingTrend
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
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
    const user = await User.findById(req.params.id);
    if (user) {
        if (user.role === 'system_admin') {
            res.status(400);
            throw new Error('Cannot delete system admin');
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

// @desc    Delete group
// @route   DELETE /api/admin/group/:id
// @access  Private/Admin
const deleteGroup = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id);
    if (group) {
        await Transaction.deleteMany({ groupId: group._id });
        await User.updateMany(
            { groups: group._id },
            { $pull: { groups: group._id } }
        );
        await Group.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Group removed' });
    } else {
        res.status(404);
        throw new Error('Group not found');
    }
});

module.exports = {
    getAdminStats,
    getAllUsers,
    getAllGroups,
    deleteUser,
    deleteGroup
};
