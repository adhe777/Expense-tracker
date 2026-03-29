const mongoose = require('mongoose');
const User = require('./models/userModel');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const promote = async () => {
    const email = process.argv[2];
    if (!email) {
        console.log('Please provide user email: node promoteAdmin.js exampleSettings@gmail.com');
        process.exit(1);
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        user.role = 'system_admin';
        await user.save();
        console.log(`User ${email} promoted to system_admin`);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

promote();
