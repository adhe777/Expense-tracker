const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
    groupName: {
        type: String,
        required: [true, 'Please add a group name'],
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    groupDescription: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Group', groupSchema);
