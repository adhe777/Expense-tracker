const mongoose = require('mongoose');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const createAdmin = async () => {
    try {
        const email = 'admin@admin.com';
        const password = 'admin123';
        
        let user = await User.findOne({ email });
        if (user) {
            user.password = password;
            user.role = 'system_admin';
            await user.save();
            console.log('Admin user updated');
        } else {
            user = await User.create({
                name: 'System Admin',
                email,
                password,
                role: 'system_admin'
            });
            console.log('Admin user created');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createAdmin();
