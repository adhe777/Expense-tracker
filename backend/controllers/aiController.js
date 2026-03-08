const Transaction = require('../models/transactionModel');

// @desc    Get AI-based spending prediction
// @route   GET /api/ai/predict
// @access  Private
const predictSpending = async (req, res) => {
    try {
        let query = { user: req.user.id, type: 'expense' };

        // Enhance for Group Level insights
        if (req.query.groupId) {
            query = { groupId: req.query.groupId, type: 'expense' };
        }

        const transactions = await Transaction.find(query).sort({ date: 1 });

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

const getPredictExpense = async (req, res) => {
    try {
        let query = { user: req.user.id, type: 'expense' };

        // Enhance for Group Level insights
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

        // Need at least 2 points for regression
        if (history.length < 2) {
            return res.status(200).json({
                history,
                prediction: history[history.length - 1].total,
                message: "Need at least 2 months of data for a trend prediction."
            });
        }

        // Manual Linear Regression (y = mx + b)
        // x = month index (0, 1, 2...), y = total expense
        const n = history.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

        history.forEach((data, i) => {
            sumX += i;
            sumY += data.total;
            sumXY += (i * data.total);
            sumX2 += (i * i);
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Predict next month (index n)
        let prediction = slope * n + intercept;
        if (prediction < 0) prediction = 0;

        res.status(200).json({
            history,
            prediction: Math.round(prediction)
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { predictSpending, getPredictExpense };
