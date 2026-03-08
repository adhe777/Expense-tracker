const asyncHandler = require('express-async-handler');
const Group = require('../models/groupModel');
const User = require('../models/userModel');

// @desc    Create a new group
// @route   POST /api/group/create
// @access  Private
const createGroup = asyncHandler(async (req, res) => {
    const { groupName, groupDescription } = req.body;

    if (!groupName) {
        res.status(400);
        throw new Error('Group name is required');
    }

    const group = await Group.create({
        groupName,
        groupDescription,
        createdBy: req.user.id,
        members: [req.user.id] // Creator is added as the first member
    });

    // Add group to user's groups array
    await User.findByIdAndUpdate(req.user.id, {
        $push: { groups: group._id }
    });

    res.status(201).json(group);
});

// @desc    Invite member to group
// @route   POST /api/group/invite
// @access  Private
const inviteMember = asyncHandler(async (req, res) => {
    const { groupId, email } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    // Only admin (creator) can invite
    if (group.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Only the group admin can add members');
    }

    const invitee = await User.findOne({ email });
    if (!invitee) {
        res.status(404);
        throw new Error('User not found with this email');
    }

    if (group.members.includes(invitee._id)) {
        res.status(400);
        throw new Error('User is already a member of this group');
    }

    // Add to group members
    group.members.push(invitee._id);
    await group.save();

    // Add group to user's groups
    await User.findByIdAndUpdate(invitee._id, {
        $push: { groups: group._id }
    });

    res.status(200).json({ message: 'User invited successfully', group });
});

// @desc    Delete a group
// @route   DELETE /api/group/:id
// @access  Private
const deleteGroup = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id);

    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    // Only admin can delete
    if (group.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Only the group admin can delete the group');
    }

    // Remove group reference from all members
    await User.updateMany(
        { _id: { $in: group.members } },
        { $pull: { groups: group._id } }
    );

    await group.deleteOne();

    res.status(200).json({ id: req.params.id, message: 'Group deleted successfully' });
});

// @desc    Get group details
// @route   GET /api/group/:id
// @access  Private
const getGroupDetails = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id).populate('members', 'name email').populate('createdBy', 'name email');

    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    // Check if user is a member
    const isMember = group.members.some(member => member._id.toString() === req.user.id);
    if (!isMember) {
        res.status(403);
        throw new Error('Not authorized to view this group');
    }

    res.status(200).json(group);
});

// @desc    Leave a group
// @route   POST /api/group/leave/:id
// @access  Private
const leaveGroup = asyncHandler(async (req, res) => {
    const group = await Group.findById(req.params.id);

    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    if (group.createdBy.toString() === req.user.id) {
        res.status(400);
        throw new Error('Admin cannot leave the group. Delete it instead.');
    }

    // Remove user from group members
    group.members = group.members.filter(memberId => memberId.toString() !== req.user.id);
    await group.save();

    // Remove group from user's groups array
    await User.findByIdAndUpdate(req.user.id, {
        $pull: { groups: group._id }
    });

    res.status(200).json({ message: 'Left group successfully' });
});

module.exports = {
    createGroup,
    inviteMember,
    deleteGroup,
    getGroupDetails,
    leaveGroup
};
