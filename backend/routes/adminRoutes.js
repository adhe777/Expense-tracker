const express = require('express');
const router = express.Router();
const { getAdminStats, getAllUsers, getAllGroups, deleteUser, deleteGroup } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { systemAdminMiddleware } = require('../middleware/adminMiddleware');

router.get('/dashboard', protect, systemAdminMiddleware, getAdminStats);
router.get('/users', protect, systemAdminMiddleware, getAllUsers);
router.get('/groups', protect, systemAdminMiddleware, getAllGroups);
router.delete('/user/:id', protect, systemAdminMiddleware, deleteUser);
router.delete('/group/:id', protect, systemAdminMiddleware, deleteGroup);

module.exports = router;
