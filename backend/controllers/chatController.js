const Transaction = require('../models/transactionModel');
const Group = require('../models/groupModel');
const Split = require('../models/splitModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Main Controller
const processChat = async (req, res) => {
    const { message } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    const userName = user ? user.name : "User";

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        // Fetch User's transactions for context
        // Try not to pull too much data; limit to last 50 transactions to save tokens
        const recentTransactions = await Transaction.find({ user: userId })
            .sort({ date: -1 })
            .limit(50);

        let financialContext = "";
        if (recentTransactions.length > 0) {
            financialContext = "Here is an abstract of the user's latest 50 transactions:\n" +
                recentTransactions.map(t => `- ${t.date.toISOString().split('T')[0]}: ${t.type.toUpperCase()} of ${t.amount} INR for ${t.category} (${t.title})`).join('\n');
        } else {
            financialContext = "The user has no recorded transactions yet.";
        }

        const prompt = `
You are a witty, professional AI Financial Advisor named "Finance Bot". 
The user's name is ${userName}. You are integrated into their Personal Finance Tracker dashboard.

Here is their financial context:
${financialContext}

User Query: "${message}"

Instructions for your response:
1. Answer their query based primarily on the transaction context provided above.
2. If they ask a generic finance question (like "what is a bond?"), answer it professionally.
3. If they ask about data you cannot determine from the context (like "what did I spend in 2015?"), politely inform them you can only analyze recent data.
4. Keep the response concise, readable, and formatting-free (no complex markdown tables, just conversational text or simple bullet points).
5. Always respond using the Indian Rupee (₹) symbol when discussing money. Return your response as plain text.`;

        const result = await model.generateContent(prompt);
        const reply = result.response.text();

        res.status(200).json({ reply });

    } catch (error) {
        console.error("Gemini Chat Error:", error);
        res.status(500).json({ message: "Error communicating with AI Brain. Please ensure Gemini API Key is configured." });
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
