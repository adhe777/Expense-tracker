const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');

async function injectTest() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ email: /bob/i }); // Try to find Bob or any user
        if (!user) {
            console.error('No user found to assign transaction to');
            process.exit(1);
        }

        const groupId = '69e7bd73e243c3e0bea2eed2'; // Tech Conference 2026
        
        const testTx = await Transaction.create({
            user: user._id,
            title: 'Test Catering Expense',
            amount: 1500,
            type: 'expense',
            category: 'Food',
            date: new Date(),
            isGroupExpense: true,
            groupId: new mongoose.Types.ObjectId(groupId)
        });

        console.log('Test group transaction injected:', testTx._id);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

injectTest();
