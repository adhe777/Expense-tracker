const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Transaction = require('../models/transactionModel');
const Group = require('../models/groupModel');

async function checkData() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const groups = await Group.find({});
        console.log(`\nFound ${groups.length} groups:`);
        for (const g of groups) {
            const txCount = await Transaction.countDocuments({ groupId: g._id });
            const txs = await Transaction.find({ groupId: g._id }).limit(1);
            console.log(`- Group: ${g.groupName} (${g._id}) | Transactions: ${txCount}`);
            if (txs.length > 0) {
                console.log(`  Example TX: ${txs[0].title} | Amount: ${txs[0].amount} | User: ${txs[0].user}`);
            }
        }

        const allGroupTxs = await Transaction.countDocuments({ isGroupExpense: true });
        console.log(`\nTotal Group Expenses in DB (isGroupExpense=true): ${allGroupTxs}`);

        const txsMissingGroupId = await Transaction.countDocuments({ isGroupExpense: true, groupId: { $exists: false } });
        console.log(`Total Group Expenses MISSING groupId field: ${txsMissingGroupId}`);

        process.exit(0);
    } catch (err) {
        console.error('Diagnostic failed:', err);
        process.exit(1);
    }
}

checkData();
