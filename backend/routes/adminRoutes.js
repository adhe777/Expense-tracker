const express = require('express');
const router = express.Router();
const { getAllUsersStats } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.get('/users', protect, admin, getAllUsersStats);

module.exports = router;
