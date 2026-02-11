const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount']
    },
    type: {
        type: String,
        required: [true, 'Please specify type (income or expense)'],
        enum: ['income', 'expense']
    },
    category: {
        type: String,
        required: [true, 'Please specify a category']
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
