const asyncHandler = require('express-async-handler');
const Transaction = require('../models/transactionModel');
const Group = require('../models/groupModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// @desc    Get group analytics
// @route   GET /api/group/:groupId/analytics
// @access  Private/Member
const getGroupAnalytics = asyncHandler(async (req, res) => {
    const groupId = new mongoose.Types.ObjectId(req.params.groupId);

    // 1. Total Expense
    const totalExpenseData = await Transaction.aggregate([
        { $match: { groupId: groupId, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpense = totalExpenseData.length > 0 ? totalExpenseData[0].total : 0;

    // 2. Category-wise Breakdown
    const categoryTotals = await Transaction.aggregate([
        { $match: { groupId: groupId, type: 'expense' } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } }
    ]);

    // 3. Top Spending Member
    const memberContributions = await Transaction.aggregate([
        { $match: { groupId: groupId, type: 'expense' } },
        { $group: { _id: '$user', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } }
    ]);

    // Populate user names for member contributions
    const memberContributionsWithNames = await Promise.all(memberContributions.map(async (item) => {
        const user = await User.findById(item._id).select('name');
        return { ...item, name: user ? user.name : 'Unknown' };
    }));

    // 4. Monthly Trend
    const monthlyTrend = await Transaction.aggregate([
        { $match: { groupId: groupId, type: 'expense' } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                total: { $sum: "$amount" }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    // 5. Average per member
    const group = await Group.findById(groupId);
    const memberCount = group.members.length;
    const averagePerMember = memberCount > 0 ? totalExpense / memberCount : 0;

    res.status(200).json({
        totalExpense,
        categoryTotals,
        memberContributions: memberContributionsWithNames,
        monthlyTrend,
        averagePerMember,
        topSpender: memberContributionsWithNames.length > 0 ? memberContributionsWithNames[0].name : 'N/A',
        topCategory: categoryTotals.length > 0 ? categoryTotals[0]._id : 'N/A'
    });
});

// @desc    Generate Group AI Insights (Gemini)
// @route   GET /api/group/:groupId/ai-insights
// @access  Private/Member
const getGroupAIInsights = asyncHandler(async (req, res) => {
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId).populate('members', 'name');

    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');

    // Aggregate category spending
    const categoryData = await Transaction.aggregate([
        { $match: { groupId: new mongoose.Types.ObjectId(groupId), type: 'expense' } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } }
    ]);

    const totalSpentArr = await Transaction.aggregate([
        { $match: { groupId: new mongoose.Types.ObjectId(groupId), type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    let totalSpent = totalSpentArr.length > 0 ? totalSpentArr[0].total : 0;

    if (totalSpent === 0) {
        return res.json({ insights: ["Not enough data to generate insights yet. Start logging expenses!"] });
    }

    let promptData = `Group Name: ${group.groupName}\n`;
    promptData += `Total Members: ${group.members.length}\n`;
    promptData += `Total Shared Group Spending: $${totalSpent}\n\n`;
    promptData += `Shared Spending by Category:\n`;
    categoryData.forEach(cat => {
        promptData += `- ${cat._id}: $${cat.total}\n`;
    });

    const prompt = `You are a strict financial advisor analyzing a friend group's shared expenses.
Here is the data:
${promptData}

Please provide 3 dynamic, actionable financial insights for this group in short bullet points. Do not include markdown formatting like asterisks or bold text. Keep it extremely concise and professional. Focus on areas where they can save money or behavior patterns. Avoid generic advice without referring to the provided data.`;

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const insightsArray = text.split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^-\s*/, '').trim());

        res.status(200).json({ insights: insightsArray });
    } catch (error) {
        console.error('Gemini AI Error:', error);
        res.status(500).json({ message: 'Failed to generate AI insights.' });
    }
});

module.exports = { getGroupAnalytics, getGroupAIInsights };
