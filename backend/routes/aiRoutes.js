const express = require('express');
const router = express.Router();
const { predictSpending, getPredictExpense } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.get('/predict', protect, predictSpending);
router.get('/predict-expense', protect, getPredictExpense);

module.exports = router;
