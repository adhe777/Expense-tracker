const Transaction = require('../models/transactionModel');

// @desc    Get AI-based spending prediction
// @route   GET /api/ai/predict
// @access  Private
const predictSpending = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id, type: 'expense' }).sort({ date: 1 });

        if (transactions.length < 5) {
            return res.status(200).json({
                prediction: 0,
                confidence: 'Low',
                insight: 'Insufficient data for accurate prediction. Please add more transactions.'
            });
        }

        // Group expenses by month
        const monthlyExpenses = {};
        transactions.forEach(t => {
            const month = new Date(t.date).toISOString().slice(0, 7); // YYYY-MM
            monthlyExpenses[month] = (monthlyExpenses[month] || 0) + t.amount;
        });

        const amounts = Object.values(monthlyExpenses);

        // Simple Linear Regression (y = mx + b)
        // x = time indices (0, 1, 2...), y = amounts
        const n = amounts.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += amounts[i];
            sumXY += (i * amounts[i]);
            sumX2 += (i * i);
        }

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Predict next month (n)
        let prediction = slope * n + intercept;
        if (prediction < 0) prediction = 0;

        // Categorical insights
        let insight = '';
        if (slope > 0) {
            insight = 'Your spending is on an upward trend. Consider reviewing your "Food" and "Shopping" categories to save more next month.';
        } else {
            insight = 'Excellent! Your spending is decreasing. You are on track to meet your savings goals.';
        }

        res.status(200).json({
            prediction: Math.round(prediction),
            confidence: transactions.length > 20 ? 'High' : 'Moderate',
            insight,
            trend: slope > 0 ? 'up' : 'down'
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { predictSpending };
