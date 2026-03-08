const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password').populate('groups', 'groupName');

    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile details
// @route   PUT /api/profile/update
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            groups: updatedUser.groups
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Change user password
// @route   PUT /api/profile/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (user && (await bcrypt.compare(currentPassword, user.password))) {
        // Hash the new password before saving it manually or let the pre-save hook do it
        // The pre-save hook in userModel will hash the password if it's modified
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Password updated successfully' });
    } else {
        res.status(401);
        throw new Error('Incorrect current password');
    }
});

// @desc    Upload user avatar
// @route   POST /api/profile/upload-avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
    const { avatarBase64 } = req.body;

    if (!avatarBase64) {
        res.status(400);
        throw new Error('Please provide base64 avatar image string');
    }

    const user = await User.findById(req.user.id);

    if (user) {
        user.avatar = avatarBase64;
        await user.save();
        res.status(200).json({ message: 'Avatar updated successfully', avatar: user.avatar });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    uploadAvatar
};
