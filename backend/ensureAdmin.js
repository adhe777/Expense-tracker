const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Remove old admin if exists with different email
        await User.deleteMany({ role: 'admin' });

        // Note: Password will be hashed by the pre-save hook in userModel.js
        const adminUser = await User.create({
            name: 'System Admin',
            email: 'admin@gmail.com',
            password: 'admin123',
            role: 'admin'
        });

        if (adminUser) {
            console.log('Admin created successfully!');
            console.log('Email: admin@gmail.com');
            console.log('Password: admin123');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
