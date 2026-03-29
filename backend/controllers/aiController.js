const asyncHandler = require('express-async-handler');
const Transaction = require('../models/transactionModel');
const mongoose = require('mongoose');

// @desc    Get AI-based spending prediction (Moving Average)
// @route   GET /api/ai/predict
// @access  Private
const predictSpending = asyncHandler(async (req, res) => {
    let query = { user: req.user.id, type: 'expense' };

    if (req.query.groupId) {
        query = { groupId: req.query.groupId, type: 'expense' };
    }

    // Fetch last 6 months of transactions
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    query.date = { $gte: sixMonthsAgo };

    const transactions = await Transaction.find(query).sort({ date: 1 });

    if (transactions.length === 0) {
        return res.status(200).json({
            prediction: 0,
            confidence: 'Low',
            insight: 'Insufficient data for prediction. Start adding expenses to see insights!',
            trend: 'stable'
        });
    }

    // Group by month
    const monthlyExpenses = {};
    transactions.forEach(t => {
        const month = new Date(t.date).toISOString().slice(0, 7);
        monthlyExpenses[month] = (monthlyExpenses[month] || 0) + t.amount;
    });

    const amounts = Object.values(monthlyExpenses);
    const n = amounts.length;

    // Calculate moving average
    const average = amounts.reduce((a, b) => a + b, 0) / n;

    // Determine trend (Comparing last month to average)
    let trend = 'stable';
    let insight = 'Your spending is currently stable. Maintain your budget to reach your goals.';

    if (n >= 2) {
        const lastMonthAmount = amounts[n - 1];
        const prevMonthAmount = amounts[n - 2];
        const diff = lastMonthAmount - prevMonthAmount;

        if (diff > (prevMonthAmount * 0.1)) {
            trend = 'up';
            insight = 'Your spending spiked last month. We recommend reviewing your top categories for potential savings.';
        } else if (diff < -(prevMonthAmount * 0.1)) {
            trend = 'down';
            insight = 'Excellent! Your spending decreased compared to last month. Keep up the good work.';
        }
    }

    res.status(200).json({
        prediction: Math.round(average),
        confidence: n >= 3 ? 'High' : 'Moderate',
        insight,
        trend
    });
});

const getPredictExpense = asyncHandler(async (req, res) => {
    let query = { user: req.user.id, type: 'expense' };

    if (req.query.groupId) {
        query = { groupId: req.query.groupId, type: 'expense' };
    }

    const transactions = await Transaction.find(query).sort({ date: 1 });

    if (transactions.length === 0) {
        return res.status(200).json({ history: [], prediction: 0 });
    }

    // Group by month
    const monthlyData = {};
    transactions.forEach(t => {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + t.amount;
    });

    const history = Object.entries(monthlyData).map(([month, total]) => ({ month, total }));

    if (history.length < 2) {
        return res.status(200).json({
            history,
            prediction: history[history.length - 1].total,
            message: "Need at least 2 months of data for a trend prediction."
        });
    }

    const n = history.length;
    const average = history.reduce((acc, curr) => acc + curr.total, 0) / n;

    res.status(200).json({
        history,
        prediction: Math.round(average)
    });
});

// @desc    Get comprehensive AI insights based on categories
// @route   GET /api/ai/insights
// @access  Private
const getAIInsights = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Aggregate category spending for current month
    const categoryStats = await Transaction.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                type: 'expense',
                date: {
                    $gte: new Date(currentYear, currentMonth - 1, 1),
                    $lt: new Date(currentYear, currentMonth, 1)
                }
            }
        },
        {
            $group: {
                _id: '$category',
                total: { $sum: '$amount' }
            }
        },
        { $sort: { total: -1 } }
    ]);

    let tips = [];
    if (categoryStats.length > 0) {
        const topCategory = categoryStats[0]._id;
        if (topCategory === 'Food' || topCategory === 'Entertainment') {
            tips.push(`Your highest spending is on ${topCategory}. Consider setting a strict budget to save more.`);
        }
        if (categoryStats.length > 3) {
            tips.push('You have many small expenses across different categories. Try consolidating your spending.');
        }
    } else {
        tips.push('No expenses recorded this month yet. Keep it up!');
    }

    res.status(200).json({
        categoryStats,
        topCategory: categoryStats[0]?._id || 'None',
        tips,
        month: currentMonth,
        year: currentYear
    });
});

module.exports = { predictSpending, getPredictExpense, getAIInsights };
