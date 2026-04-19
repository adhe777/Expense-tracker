const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
    removeAvatar
} = require('../controllers/profileController');

router.get('/', protect, getProfile);
router.put('/update', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/upload-avatar', protect, uploadAvatar);
router.delete('/avatar', protect, removeAvatar);

module.exports = router;
