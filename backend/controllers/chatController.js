const Transaction = require('../models/transactionModel');
const Group = require('../models/groupModel');
const Split = require('../models/splitModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// Helper: Preprocess message
const preprocessMessage = (message) => {
    return message.toLowerCase().replace(/[^\w\s]/g, '').trim().split(/\s+/);
};

// Helper: Detect Intent
const detectIntent = (tokens) => {
    const synonymMap = {
        EXPENSE: ['spend', 'spending', 'spent', 'expense', 'cost', 'pay', 'paid'],
        INCOME: ['income', 'salary', 'earnings', 'earn', 'received', 'deposite'],
        SAVINGS: ['savings', 'save', 'saved', 'balance', 'left'],
        COMPARE: ['difference', 'compare', 'versus', 'vs', 'than', 'last'],
        HIGHEST_CATEGORY: ['highest', 'most', 'top', 'maximum', 'expensive'],
        OVERSPENDING_CHECK: ['overspend', 'too much', 'exceeded', 'limit', 'budget']
    };

    for (const [intent, keywords] of Object.entries(synonymMap)) {
        if (tokens.some(token => keywords.includes(token))) {
            return intent;
        }
    }
    return 'UNKNOWN';
};

// Helper: Detect Month
const detectMonth = (tokens, message) => {
    const months = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
    ];

    // Check for specific month names
    for (let i = 0; i < months.length; i++) {
        if (tokens.includes(months[i])) return i;
    }

    if (message.includes('last month')) {
        return new Date().getMonth() - 1;
    }

    // Default: this month
    return new Date().getMonth();
};

// Helper: Detect Category
const detectCategory = (tokens) => {
    const categories = ['food', 'travel', 'bills', 'entertainment', 'utilities', 'shopping', 'rent', 'health'];
    return tokens.find(token => categories.includes(token)) || null;
};

// Main Controller
const processChat = async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;

    const tokens = preprocessMessage(message);
    const msgLower = message.toLowerCase();

    const intent = detectIntent(tokens);
    const monthIndex = detectMonth(tokens, msgLower);
    const category = detectCategory(tokens);

    // Date range for the detected month
    const year = new Date().getFullYear();
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);
    const monthName = startDate.toLocaleString('default', { month: 'long' });

    try {
        let reply = '';

        switch (intent) {
            case 'EXPENSE': {
                const query = { user: new mongoose.Types.ObjectId(userId), type: 'expense', date: { $gte: startDate, $lte: endDate } };
                if (category) query.category = new RegExp(category, 'i');

                const stats = await Transaction.aggregate([
                    { $match: query },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);

                const total = stats[0]?.total || 0;
                reply = category
                    ? `You spent ₹${total.toLocaleString()} on ${category} in ${monthName}.`
                    : `You spent ₹${total.toLocaleString()} in ${monthName}.`;
                break;
            }

            case 'INCOME': {
                const stats = await Transaction.aggregate([
                    { $match: { user: new mongoose.Types.ObjectId(userId), type: 'income', date: { $gte: startDate, $lte: endDate } } },
                    { $group: { _id: null, total: { $sum: '$amount' } } }
                ]);
                const total = stats[0]?.total || 0;
                reply = `Your total income in ${monthName} is ₹${total.toLocaleString()}.`;
                break;
            }

            case 'SAVINGS': {
                const stats = await Transaction.aggregate([
                    { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: startDate, $lte: endDate } } },
                    { $group: { _id: '$type', total: { $sum: '$amount' } } }
                ]);

                const income = stats.find(s => s._id === 'income')?.total || 0;
                const expense = stats.find(s => s._id === 'expense')?.total || 0;
                reply = `Your savings in ${monthName} is ₹${(income - expense).toLocaleString()}.`;
                break;
            }

            case 'HIGHEST_CATEGORY': {
                const stats = await Transaction.aggregate([
                    { $match: { user: new mongoose.Types.ObjectId(userId), type: 'expense', date: { $gte: startDate, $lte: endDate } } },
                    { $group: { _id: '$category', total: { $sum: '$amount' } } },
                    { $sort: { total: -1 } },
                    { $limit: 1 }
                ]);

                if (stats.length > 0) {
                    reply = `Your highest spending category in ${monthName} is ${stats[0]._id} (₹${stats[0].total.toLocaleString()}).`;
                } else {
                    reply = `I couldn't find any expenses for ${monthName}.`;
                }
                break;
            }

            case 'COMPARE':
            case 'OVERSPENDING_CHECK': {
                // Get current month and previous month stats
                const lastMonthStart = new Date(year, monthIndex - 1, 1);
                const lastMonthEnd = new Date(year, monthIndex, 0, 23, 59, 59);

                const comparison = await Transaction.aggregate([
                    {
                        $match: {
                            user: new mongoose.Types.ObjectId(userId),
                            type: 'expense',
                            date: { $gte: lastMonthStart, $lte: endDate }
                        }
                    },
                    {
                        $group: {
                            _id: { $month: '$date' },
                            total: { $sum: '$amount' }
                        }
                    }
                ]);

                const currentTotal = comparison.find(c => c._id === (monthIndex + 1))?.total || 0;
                const prevTotal = comparison.find(c => c._id === monthIndex)?.total || 0;

                if (prevTotal === 0) {
                    reply = `I don't have enough data from the previous month to make a comparison. This month you spent ₹${currentTotal.toLocaleString()}.`;
                } else {
                    const diff = currentTotal - prevTotal;
                    const percent = Math.abs((diff / prevTotal) * 100).toFixed(1);

                    if (intent === 'OVERSPENDING_CHECK' && diff > 0) {
                        reply = `You spent ${percent}% more than last month. Consider reducing discretionary expenses.`;
                    } else {
                        reply = diff > 0
                            ? `Compared to last month, your spending increased by ₹${diff.toLocaleString()} (${percent}%).`
                            : `Great! Your spending decreased by ₹${Math.abs(diff).toLocaleString()} (${percent}%) compared to last month.`;
                    }
                }
                break;
            }

            default:
                reply = "I'm sorry, I can help with expenses, income, savings, comparisons, or spending analysis. Could you please rephrase?";
        }

        res.status(200).json({ reply });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGroupInsights = async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findById(groupId);
        if (!group || !group.members.includes(req.user.id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const groupExpenses = await Transaction.aggregate([
            { $match: { groupId: new mongoose.Types.ObjectId(groupId), type: 'expense', date: { $gte: startOfMonth } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } }
        ]);

        const topContributor = await Split.aggregate([
            { $match: { groupId: new mongoose.Types.ObjectId(groupId) } },
            { $group: { _id: '$payer', total: { $sum: 1 } } }, // This is simple count, can be amount too
            { $sort: { total: -1 } },
            { $limit: 1 }
        ]);

        let contributorName = 'No one';
        if (topContributor.length > 0) {
            const user = await User.findById(topContributor[0]._id);
            contributorName = user ? user.name : 'Unknown';
        }

        const totalSpent = groupExpenses.reduce((acc, curr) => acc + curr.total, 0);

        res.status(200).json({
            totalSpent,
            categories: groupExpenses,
            topContributor: contributorName,
            insight: `Your group has spent ₹${totalSpent.toLocaleString()} this month. The top contributor is ${contributorName}.`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { processChat, getGroupInsights };
