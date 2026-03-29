const express = require('express');
const router = express.Router();
const {
    getTransactions,
    addTransaction,
    deleteTransaction,
    getStats
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const restrictSystemAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'system_admin') {
        return res.status(403).json({ message: 'System admins cannot access personal finances.' });
    }
    next();
};

router.use(protect);
router.use(restrictSystemAdmin);

router.get('/', getTransactions);
router.post('/', addTransaction);
router.delete('/:id', deleteTransaction);
router.get('/stats', getStats);

module.exports = router;
