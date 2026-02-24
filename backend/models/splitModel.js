const mongoose = require('mongoose');

const splitSchema = mongoose.Schema({
    expenseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Transaction'
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Group'
    },
    payer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    owes: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        amount: {
            type: Number,
            required: true
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Split', splitSchema);
