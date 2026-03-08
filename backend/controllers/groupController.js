const asyncHandler = require('express-async-handler');
const Group = require('../models/groupModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');

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

    // Check if an invite is already pending
    const existingInvite = await Notification.findOne({
        recipient: invitee._id,
        relatedGroup: group._id,
        type: 'group_invite',
        status: 'pending'
    });

    if (existingInvite) {
        res.status(400);
        throw new Error('An invite is already pending for this user');
    }

    // Create a Notification instead of adding them directly
    await Notification.create({
        recipient: invitee._id,
        sender: req.user.id,
        type: 'group_invite',
        relatedGroup: group._id
    });

    res.status(200).json({ message: 'User invited successfully. They must accept the invite to join.' });
});

// @desc    Remove member from group (Admin only)
// @route   POST /api/group/remove
// @access  Private
const removeMember = asyncHandler(async (req, res) => {
    const { groupId, memberId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    if (group.createdBy.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Only the group admin can remove members');
    }

    if (group.createdBy.toString() === memberId) {
        res.status(400);
        throw new Error('Admin cannot be removed.');
    }

    // Remove user from group members
    group.members = group.members.filter(m => m.toString() !== memberId);
    await group.save();

    // Remove group from user's groups array
    await User.findByIdAndUpdate(memberId, {
        $pull: { groups: group._id }
    });

    res.status(200).json({ message: 'Member removed successfully' });
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

// @desc    Get user notifications
// @route   GET /api/group/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user.id, status: 'pending' })
        .populate('sender', 'name')
        .populate('relatedGroup', 'groupName')
        .sort({ createdAt: -1 });
    res.status(200).json(notifications);
});

// @desc    Accept group invite
// @route   POST /api/group/invite/accept/:notificationId
// @access  Private
const acceptInvite = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification || notification.recipient.toString() !== req.user.id) {
        res.status(404);
        throw new Error('Notification not found');
    }

    const group = await Group.findById(notification.relatedGroup);
    if (!group) {
        res.status(404);
        throw new Error('Group not found');
    }

    if (!group.members.includes(req.user.id)) {
        group.members.push(req.user.id);
        await group.save();

        await User.findByIdAndUpdate(req.user.id, {
            $push: { groups: group._id }
        });
    }

    notification.status = 'accepted';
    await notification.save();

    res.status(200).json({ message: 'Invite accepted', group });
});

// @desc    Reject group invite
// @route   POST /api/group/invite/reject/:notificationId
// @access  Private
const rejectInvite = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.notificationId);

    if (!notification || notification.recipient.toString() !== req.user.id) {
        res.status(404);
        throw new Error('Notification not found');
    }

    notification.status = 'rejected';
    await notification.save();

    res.status(200).json({ message: 'Invite rejected' });
});

module.exports = {
    createGroup,
    inviteMember,
    removeMember,
    deleteGroup,
    getGroupDetails,
    leaveGroup,
    getNotifications,
    acceptInvite,
    rejectInvite
};
