const mongoose = require('mongoose');
const User = require('./models/userModel');
require('dotenv').config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'name email');
        console.log('Existing Users in MongoDB Atlas:');
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        process.exit(1);
    }
};

checkUsers();
