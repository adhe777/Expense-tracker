const express = require('express');
const router = express.Router();
const { processChat } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, processChat);

module.exports = router;
