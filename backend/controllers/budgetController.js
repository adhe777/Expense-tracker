const Budget = require('../models/budgetModel');

const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user.id });
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const setBudget = async (req, res) => {
    const { category, amount, month, year } = req.body;

    if (!category || !amount) {
        return res.status(400).json({ message: 'Please add category and amount' });
    }

    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    try {
        // Upsert budget
        const budget = await Budget.findOneAndUpdate(
            { user: req.user.id, category, month: currentMonth, year: currentYear },
            { amount },
            { new: true, upsate: true, upsert: true }
        );
        res.status(200).json(budget);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: 'Budget not found' });
        if (budget.user.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        await budget.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBudgets,
    setBudget,
    deleteBudget
};
