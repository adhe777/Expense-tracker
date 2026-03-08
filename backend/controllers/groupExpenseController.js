const asyncHandler = require('express-async-handler');
const Transaction = require('../models/transactionModel');
const Split = require('../models/splitModel');
const Group = require('../models/groupModel');

// @desc    Add a group expense and calculate splits
// @route   POST /api/group/expense
// @access  Private
const addGroupExpense = asyncHandler(async (req, res) => {
    const { groupId, title, amount, category, description, splitType, customSplits } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    if (!group.members.includes(req.user.id)) {
        res.status(403);
        throw new Error('User not part of group');
    }

    // 1. Create the Transaction
    const transaction = await Transaction.create({
        user: req.user.id,
        groupId,
        isGroupExpense: true,
        title,
        amount: Number(amount),
        type: 'expense',
        category,
        description
    });

    // 2. Calculate Split amounts
    let owes = [];
    const members = group.members;
    const totalAmount = Number(amount);

    if (splitType === 'equal') {
        const splitAmount = (totalAmount / members.length).toFixed(2);
        members.forEach(memberId => {
            if (memberId.toString() !== req.user.id) {
                owes.push({ user: memberId, amount: Number(splitAmount) });
            }
        });
    } else if (splitType === 'percentage') {
        // customSplits = [{ user: "id", value: 40 }, { user: "id2", value: 60 }]
        let percentTotal = 0;
        customSplits.forEach(split => { percentTotal += Number(split.value); });

        if (percentTotal !== 100) {
            await transaction.deleteOne(); // Rollback
            res.status(400);
            throw new Error('Percentages must add up to 100');
        }

        customSplits.forEach(split => {
            if (split.user.toString() !== req.user.id) {
                const owesAmount = (totalAmount * (Number(split.value) / 100)).toFixed(2);
                if (Number(owesAmount) > 0) {
                    owes.push({ user: split.user, amount: Number(owesAmount) });
                }
            }
        });
    } else if (splitType === 'custom') {
        // customSplits = [{ user: "id", value: 500 }, { user: "id2", value: 300 }]
        let amTotal = 0;
        customSplits.forEach(split => { amTotal += Number(split.value); });

        if (amTotal !== totalAmount) {
            await transaction.deleteOne(); // Rollback
            res.status(400);
            throw new Error('Custom amounts must equal total transaction amount');
        }

        customSplits.forEach(split => {
            if (split.user.toString() !== req.user.id && Number(split.value) > 0) {
                owes.push({ user: split.user, amount: Number(split.value) });
            }
        });
    } else {
        await transaction.deleteOne();
        res.status(400);
        throw new Error('Invalid split type');
    }

    // 3. Save Split Record
    const split = await Split.create({
        expenseId: transaction._id,
        groupId,
        payer: req.user.id,
        owes
    });

    // Populate split before returning
    const populatedSplit = await Split.findById(split._id)
        .populate('payer', 'name')
        .populate('owes.user', 'name');

    res.status(201).json({ transaction, split: populatedSplit });
});

// @desc    Get all split summaries for a group
// @route   GET /api/group/split-summary/:groupId
// @access  Private
const getSplitSummary = asyncHandler(async (req, res) => {
    const groupId = req.params.groupId;

    // Optional Check Membership
    const group = await Group.findById(groupId);
    if (!group.members.includes(req.user.id)) {
        res.status(403);
        throw new Error('Not authorized');
    }

    const splits = await Split.find({ groupId })
        .populate('payer', 'name')
        .populate('owes.user', 'name')
        .populate('expenseId', 'title amount date')
        .sort({ createdAt: -1 });

    res.status(200).json(splits);
});

// @desc    Calculate Net Settlements
// @route   GET /api/group/settlement/:groupId
// @access  Private
const getSettlements = asyncHandler(async (req, res) => {
    const groupId = req.params.groupId;
    const splits = await Split.find({ groupId }).populate('payer', 'name').populate('owes.user', 'name');

    // Balance Sheet mapping user id to net balance (positive means they should receive, negative means they owe)
    const balances = {};
    const names = {};

    splits.forEach(split => {
        const payerId = split.payer._id.toString();
        names[payerId] = split.payer.name;

        if (!balances[payerId]) balances[payerId] = 0;

        split.owes.forEach(debt => {
            const debtorId = debt.user._id.toString();
            names[debtorId] = debt.user.name;

            if (!balances[debtorId]) balances[debtorId] = 0;

            // Payer gets money back (+)
            balances[payerId] += debt.amount;
            // Debtor owes money (-)
            balances[debtorId] -= debt.amount;
        });
    });

    const debtors = [];
    const creditors = [];

    // Separate into debtors (<0) and creditors (>0)
    for (const [userId, amount] of Object.entries(balances)) {
        if (amount < -0.01) debtors.push({ userId, name: names[userId], amount: Math.abs(amount) });
        if (amount > 0.01) creditors.push({ userId, name: names[userId], amount });
    }

    const settlements = [];

    // Greedy settlement algorithm
    let i = 0; // debtors index
    let j = 0; // creditors index

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const minAmount = Math.min(debtor.amount, creditor.amount);

        settlements.push({
            from: debtor.name,
            to: creditor.name,
            amount: minAmount.toFixed(2),
            message: `${debtor.name} owes ${creditor.name} ₹${minAmount.toFixed(2)}`
        });

        debtor.amount -= minAmount;
        creditor.amount -= minAmount;

        if (debtor.amount < 0.01) i++;
        if (creditor.amount < 0.01) j++;
    }

    res.status(200).json(settlements);
});

module.exports = {
    addGroupExpense,
    getSplitSummary,
    getSettlements
};
