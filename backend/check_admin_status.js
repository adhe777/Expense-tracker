const mongoose = require('mongoose');
const User = require('./models/userModel');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const checkAdmin = async () => {
    await connectDB();
    const user = await User.findOne({ email: 'admin@admin.com' });
    if (user) {
        console.log('User found:', {
            email: user.email,
            role: user.role,
            hasPassword: !!user.password
        });
    } else {
        console.log('Admin user not found');
    }
    process.exit(0);
};

checkAdmin();
