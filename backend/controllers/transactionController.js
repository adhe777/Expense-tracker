const Transaction = require('../models/transactionModel');

const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addTransaction = async (req, res) => {
    const { title, amount, type, category, date, description } = req.body;

    if (!title || !amount || !type || !category) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    try {
        const transaction = await Transaction.create({
            user: req.user.id,
            title,
            amount,
            type,
            category,
            date,
            description
        });
        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check for user
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await transaction.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStats = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getTransactions,
    addTransaction,
    deleteTransaction,
    getStats
};
