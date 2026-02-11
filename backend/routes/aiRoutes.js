const express = require('express');
const router = express.Router();
const { predictSpending } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.get('/predict', protect, predictSpending);

module.exports = router;
