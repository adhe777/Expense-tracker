const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');

dotenv.config();

const ensureAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'admin@expense.com';
        let user = await User.findOne({ email });

        if (!user) {
            console.log('Admin user not found, creating one...');
            user = await User.create({
                name: 'System Admin',
                email: email,
                password: 'admin123', // Will be hashed by pre-save hook
                isAdmin: true
            });
            console.log('Admin user created successfully.');
        } else {
            user.isAdmin = true;
            await user.save();
            console.log('Admin user updated successfully.');
        }

        console.log(`Current Admin Status: ${user.isAdmin}`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

ensureAdmin();
