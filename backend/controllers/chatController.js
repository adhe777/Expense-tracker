const asyncHandler = require('express-async-handler');
const Transaction = require('../models/transactionModel');
const Group = require('../models/groupModel');
const Budget = require('../models/budgetModel');
const Split = require('../models/splitModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// @desc    Process AI Chat with intent detection and context
// @route   POST /api/chat
// @access  Private
const processChat = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const userName = user.name;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024,
        }
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch rich context
    const [recentTransactions, currentBudgets, userGroups, monthlyStats] = await Promise.all([
        Transaction.find({ user: userId }).sort({ date: -1 }).limit(15),
        Budget.find({ user: userId, month: now.getMonth() + 1, year: now.getFullYear() }),
        Group.find({ members: userId }).select('groupName'),
        Transaction.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: startOfMonth } } },
            { $group: { _id: "$type", total: { $sum: "$amount" } } }
        ])
    ]);

    let financialContext = `User: ${userName}\n`;
    
    // Monthly Aggregates
    const monthlyIncome = monthlyStats.find(s => s._id === 'income')?.total || 0;
    const monthlyExpense = monthlyStats.find(s => s._id === 'expense')?.total || 0;
    financialContext += `Summary for ${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}:\n`;
    financialContext += `- Total Income: ₹${monthlyIncome}\n`;
    financialContext += `- Total Expenses: ₹${monthlyExpense}\n`;
    financialContext += `- Current Balance (this month): ₹${monthlyIncome - monthlyExpense}\n\n`;

    financialContext += "Recent Activity:\n" + (recentTransactions.length > 0
        ? recentTransactions.map(t => `- ${t.date.toISOString().split('T')[0]}: ${t.type.toUpperCase()} ₹${t.amount} (${t.category}: ${t.title})`).join('\n')
        : "No transactions recorded yet.") + "\n\n";

    financialContext += "Active Spending Limits:\n" + (currentBudgets.length > 0
        ? currentBudgets.map(b => `- ${b.category}: Limit ₹${b.amount}`).join('\n')
        : "No budgets set yet.") + "\n\n";

    financialContext += "Affiliated Groups: " + (userGroups.length > 0
        ? userGroups.map(g => g.groupName).join(', ')
        : "Individual Account (No Groups)");

    const prompt = `
You are "FinMate AI", a versatile and high-precision financial assistant.
Your goal is to help ${userName} manage their finances effectively by combining their personal data with broad financial knowledge.

OPERATIONAL PRINCIPLES:
1. DATA-AWARENESS: If the user asks about their specific spending, balance, or budgets, use the provided "FINANCIAL DATA CONTEXT" below. State exact figures in ₹.
2. GENERAL KNOWLEDGE: If the user asks general financial questions (e.g., "What is a compound interest?", "How to start investing?", "Explain ROE"), use your core intelligence to provide accurate, educational, and helpful responses like Gemini.
3. CONCISENESS & CLARITY: Be professional and objective. Use bullet points for structured data.
4. TONE: Insightful, objective, and supportive. Use emojis (📉, 📈, 🗓️, 💡) for better readability.
5. CURRENCY: Always use ₹ (Indian Rupee).

FINANCIAL DATA CONTEXT:
${financialContext}

CURRENT ENVIRONMENT:
- Date: ${now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
- Target Location: India

USER QUERY: "${message}"

Respond with a precise and helpful answer:`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.status(200).json({ reply });
});

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
