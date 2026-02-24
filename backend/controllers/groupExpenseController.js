const Transaction = require('../models/transactionModel');
const Split = require('../models/splitModel');
const Group = require('../models/groupModel');

// @desc    Add a group expense and create splits
// @route   POST /api/group/expense
// @access  Private
const addGroupExpense = async (req, res) => {
    const { title, amount, category, date, description, groupId, splitType, splitData } = req.body;

    try {
        const group = await Group.findById(groupId);
        if (!group || !group.members.includes(req.user.id)) {
            return res.status(403).json({ message: 'Not authorized or group not found' });
        }

        // Create the transaction record
        const transaction = await Transaction.create({
            user: req.user.id,
            title,
            amount,
            category,
            type: 'expense',
            date,
            description,
            groupId,
            isGroupExpense: true
        });

        // Calculate owes based on split type
        let owes = [];
        const memberCount = group.members.length;

        if (splitType === 'equal') {
            const splitAmount = amount / memberCount;
            owes = group.members
                .filter(id => id.toString() !== req.user.id)
                .map(id => ({ userId: id, amount: splitAmount }));
        } else if (splitType === 'percentage') {
            // splitData format: [{ userId: '...', percentage: 25 }]
            owes = splitData
                .filter(s => s.userId !== req.user.id)
                .map(s => ({ userId: s.userId, amount: (amount * s.percentage) / 100 }));
        } else if (splitType === 'custom') {
            // splitData format: [{ userId: '...', amount: 500 }]
            owes = splitData
                .filter(s => s.userId !== req.user.id)
                .map(s => ({ userId: s.userId, amount: s.amount }));
        }

        const split = await Split.create({
            expenseId: transaction._id,
            groupId,
            payer: req.user.id,
            owes
        });

        res.status(201).json({ transaction, split });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get settlement summary for a group
// @route   GET /api/group/settlement/:groupId
// @access  Private
const getSettlement = async (req, res) => {
    try {
        const groupId = req.params.groupId;
        const splits = await Split.find({ groupId }).populate('payer', 'name').populate('owes.userId', 'name');

        // Calculate net balance for each user
        // balanceMap[userId] = amount (positive means they are owed, negative means they owe)
        const balanceMap = {};

        splits.forEach(split => {
            const payerId = split.payer._id.toString();

            split.owes.forEach(owe => {
                const owerId = owe.userId._id.toString();
                const amount = owe.amount;

                // Payer is owed this amount
                balanceMap[payerId] = (balanceMap[payerId] || 0) + amount;
                // Ower owes this amount
                balanceMap[owerId] = (balanceMap[owerId] || 0) - amount;
            });
        });

        // Simplify settlements (who owes whom)
        const settlements = [];
        const debtors = []; // negative balance
        const creditors = []; // positive balance

        for (const [userId, balance] of Object.entries(balanceMap)) {
            if (balance < 0) debtors.push({ userId, balance: Math.abs(balance) });
            else if (balance > 0) creditors.push({ userId, balance });
        }

        // Basic greedy algorithm for simplified settlement
        let d = 0, c = 0;
        while (d < debtors.length && c < creditors.length) {
            const amount = Math.min(debtors[d].balance, creditors[c].balance);

            settlements.push({
                from: debtors[d].userId,
                to: creditors[c].userId,
                amount: Math.round(amount * 100) / 100
            });

            debtors[d].balance -= amount;
            creditors[c].balance -= amount;

            if (debtors[d].balance === 0) d++;
            if (creditors[c].balance === 0) c++;
        }

        // Map IDs to names for readability
        const group = await Group.findById(groupId).populate('members', 'name');
        const nameMap = {};
        group.members.forEach(m => nameMap[m._id.toString()] = m.name);

        const readableSettlements = settlements.map(s => ({
            text: `${nameMap[s.from]} owes ${nameMap[s.to]} ₹${s.amount.toLocaleString()}`,
            from: nameMap[s.from],
            to: nameMap[s.to],
            amount: s.amount
        }));

        res.status(200).json(readableSettlements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addGroupExpense, getSettlement };
