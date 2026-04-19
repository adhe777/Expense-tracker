const asyncHandler = require('express-async-handler');
const Transaction = require('../models/transactionModel');
const Budget = require('../models/budgetModel');

const getTransactions = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(transactions);
});

const addTransaction = asyncHandler(async (req, res) => {
    const { title, amount, type, category, date, description, isGroupExpense, groupId } = req.body;

    if (!title || !amount || !type || !category) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    if (req.user && req.user.role === 'system_admin') {
        res.status(403);
        throw new Error('System admins are restricted from adding personal or group expenses. Please use a regular account for transactions.');
    }

    const transaction = await Transaction.create({
        user: req.user.id,
        title,
        amount,
        type,
        category,
        date,
        description,
        isGroupExpense: isGroupExpense || false,
        groupId: isGroupExpense ? groupId : null
    });

    let warning = null;
    if (type === 'expense' && !isGroupExpense) {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const budget = await Budget.findOne({
            user: req.user.id,
            category,
            month: currentMonth,
            year: currentYear
        });

        if (budget) {
            const results = await Transaction.aggregate([
                {
                    $match: {
                        user: req.user.id,
                        category,
                        type: 'expense',
                        date: {
                            $gte: new Date(currentYear, currentMonth - 1, 1),
                            $lt: new Date(currentYear, currentMonth, 1)
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$amount' }
                    }
                }
            ]);

            const totalSpent = results.length > 0 ? results[0].total : 0;
            const limit = budget.amount;

            if (totalSpent > limit) {
                warning = `You have exceeded your ${category} budget by ₹${totalSpent - limit}.`;
            } else if (totalSpent >= limit * 0.8) {
                warning = `You have used ${Math.round((totalSpent / limit) * 100)}% of your ${category} budget.`;
            }
        }
    }

    res.status(201).json({ ...transaction._doc, warning });
});

const deleteTransaction = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
        res.status(404);
        throw new Error('Transaction not found');
    }

    // Check for user
    if (transaction.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await transaction.deleteOne();
    res.status(200).json({ id: req.params.id });
});

const getStats = asyncHandler(async (req, res) => {
    const transactions = await Transaction.find({ user: req.user.id });
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalIncome = 0;
    let totalExpense = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    transactions.forEach(t => {
        const tDate = new Date(t.date);
        if (t.type === 'income') {
            totalIncome += t.amount;
            if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
                monthlyIncome += t.amount;
            }
        } else {
            totalExpense += t.amount;
            if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
                monthlyExpense += t.amount;
            }
        }
    });

    const netSavings = totalIncome - totalExpense;
    const monthlySavings = monthlyIncome - monthlyExpense;
    const savingsRate = monthlyIncome > 0 ? ((monthlySavings / monthlyIncome) * 100).toFixed(1) : 0;

    res.status(200).json({
        totalIncome,
        totalExpense,
        balance: netSavings,
        monthlyIncome,
        monthlyExpense,
        monthlySavings,
        savingsRate,
        transactionCount: transactions.length
    });
});

module.exports = {
    getTransactions,
    addTransaction,
    deleteTransaction,
    getStats
};
