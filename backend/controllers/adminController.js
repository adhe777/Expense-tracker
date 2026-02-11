const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');

// @desc    Get all users with their financial summary
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsersStats = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');

        const userStats = await Promise.all(users.map(async (user) => {
            const transactions = await Transaction.find({ user: user._id });

            let totalIncome = 0;
            let totalExpense = 0;

            transactions.forEach(t => {
                if (t.type === 'income') totalIncome += t.amount;
                else totalExpense += t.amount;
            });

            return {
                _id: user._id,
                name: user.name,
                email: user.email,
                totalIncome,
                totalExpense,
                balance: totalIncome - totalExpense,
                transactionCount: transactions.length,
                isAdmin: user.isAdmin,
                createdAt: user.createdAt
            };
        }));

        res.status(200).json(userStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllUsersStats };
