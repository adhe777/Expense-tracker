const express = require('express');
const router = express.Router();
const { predictSpending, getPredictExpense, getAIInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.get('/predict', protect, predictSpending);
router.get('/predict-expense', protect, getPredictExpense);
router.get('/insights', protect, getAIInsights);

module.exports = router;
