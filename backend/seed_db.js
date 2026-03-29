require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/userModel');
const Group = require('./models/groupModel');
const Transaction = require('./models/transactionModel');
const Split = require('./models/splitModel');
const Budget = require('./models/budgetModel');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        // 1. Wipe out existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Group.deleteMany({});
        await Transaction.deleteMany({});
        await Split.deleteMany({});
        await Budget.deleteMany({});

        // 2. Add System Admin
        const systemAdmin = await User.create({
            name: 'System Admin',
            email: 'admin@finmate.com',
            password: 'admin123',
            role: 'system_admin',
            avatar: 'https://ui-avatars.com/api/?name=System+Admin&background=1890ff&color=fff'
        });
        console.log('Created System Admin');

        // 3. Add Regular Users
        const john = await User.create({
            name: 'John Doe',
            email: 'john@finmate.com',
            password: 'password123',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=ff4d4f&color=fff'
        });

        const jane = await User.create({
            name: 'Jane Smith',
            email: 'jane@finmate.com',
            password: 'password123',
            avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=52c41a&color=fff'
        });

        const alice = await User.create({
            name: 'Alice Johnson',
            email: 'alice@finmate.com',
            password: 'password123',
            avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=722ed1&color=fff'
        });

        const bob = await User.create({
            name: 'Bob Brown',
            email: 'bob@finmate.com',
            password: 'password123',
            avatar: 'https://ui-avatars.com/api/?name=Bob+Brown&background=faad14&color=fff'
        });
        console.log('Created John, Jane, Alice, Bob');

        // 4. Create Personal Expenses
        await Transaction.create([
            {
                type: 'income',
                amount: 5000,
                category: 'Salary',
                date: new Date('2026-03-01'),
                title: 'March Salary',
                user: john._id
            },
            {
                type: 'expense',
                amount: 1500,
                category: 'Housing',
                date: new Date('2026-03-02'),
                title: 'Rent',
                user: john._id
            },
            {
                type: 'expense',
                amount: 200,
                category: 'Food',
                date: new Date('2026-03-05'),
                title: 'Groceries',
                user: john._id
            },
            {
                type: 'expense',
                amount: 50,
                category: 'Transportation',
                date: new Date('2026-03-10'),
                title: 'Gas',
                user: john._id
            }
        ]);
        console.log('Created Personal Transactions for John');

        // 5. Create a Group
        const techConferenceGroup = await Group.create({
            groupName: 'Tech Conference 2026',
            groupDescription: 'Expenses for the upcoming developer conference in SF.',
            createdBy: john._id,
            members: [john._id, jane._id, alice._id, bob._id]
        });
        console.log('Created Group: Tech Conference 2026');

        // 6. Add Group Expenses & Splits

        // Expense 1: Flights paid by John, split equally among all 4
        const flightExpense = await Transaction.create({
            type: 'expense',
            amount: 1200,
            category: 'Transportation',
            date: new Date('2026-03-15'),
            title: 'Roundtrip Flights for 4',
            user: john._id,
            group: techConferenceGroup._id,
            isGroupExpense: true
        });

        await Split.create({
            expenseId: flightExpense._id,
            groupId: techConferenceGroup._id,
            payer: john._id,
            owes: [
                { user: john._id, amount: 300 },
                { user: jane._id, amount: 300 },
                { user: alice._id, amount: 300 },
                { user: bob._id, amount: 300 }
            ]
        });

        // Expense 2: Hotel paid by Jane, split exactly (Jane: 500, Alice: 500)
        const hotelExpense = await Transaction.create({
            type: 'expense',
            amount: 1000,
            category: 'Housing',
            date: new Date('2026-03-16'),
            title: 'Hotel BNB 3 Nights',
            user: jane._id,
            group: techConferenceGroup._id,
            isGroupExpense: true
        });

        await Split.create({
            expenseId: hotelExpense._id,
            groupId: techConferenceGroup._id,
            payer: jane._id,
            owes: [
                { user: jane._id, amount: 500 },
                { user: alice._id, amount: 500 }
            ]
        });

        // Expense 3: Dinner paid by Bob, split percentage 
        const dinnerExpense = await Transaction.create({
            type: 'expense',
            amount: 250,
            category: 'Food',
            date: new Date('2026-03-17'),
            title: 'Team Dinner at Steakhouse',
            user: bob._id,
            group: techConferenceGroup._id,
            isGroupExpense: true
        });

        await Split.create({
            expenseId: dinnerExpense._id,
            groupId: techConferenceGroup._id,
            payer: bob._id,
            owes: [
                { user: john._id, amount: 100 },
                { user: jane._id, amount: 50 },
                { user: alice._id, amount: 50 },
                { user: bob._id, amount: 50 }
            ]
        });

        console.log('Created Group Expenses and Splits');

        console.log('Seeding Complete!');
        process.exit();

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
