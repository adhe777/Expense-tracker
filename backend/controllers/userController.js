const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({ name, email, password });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            groups: user.groups,
            role: user.role,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email }).populate('groups', 'groupName');

    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            groups: user.groups,
            role: user.role,
            token: generateToken(user._id)
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate('groups', 'groupName');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.status(200).json(user);
});

// @desc    Search users by name or email (excluding system admins)
// @route   GET /api/users/search
// @access  Private
const searchUsers = asyncHandler(async (req, res) => {
    const { query } = req.query;
    if (!query) {
        res.status(400);
        throw new Error('Search query is required');
    }

    const users = await User.find({
        $and: [
            {
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            },
            { role: { $ne: 'system_admin' } }
        ]
    }).select('name email avatar').limit(10);

    res.status(200).json(users);
});

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = { registerUser, loginUser, getMe, searchUsers };

