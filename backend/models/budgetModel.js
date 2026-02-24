const mongoose = require('mongoose');

const budgetSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Please add a budget amount']
    },
    month: {
        type: Number,
        required: true,
        default: new Date().getMonth() + 1
    },
    year: {
        type: Number,
        required: true,
        default: new Date().getFullYear()
    }
}, {
    timestamps: true
});

// Ensure user only has one budget per category per month
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
