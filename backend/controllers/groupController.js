const Group = require('../models/groupModel');
const User = require('../models/userModel');

// @desc    Create a new group
// @route   POST /api/group/create
// @access  Private
const createGroup = async (req, res) => {
    const { groupName, groupDescription } = req.body;

    if (!groupName) {
        return res.status(400).json({ message: 'Please add a group name' });
    }

    try {
        const group = await Group.create({
            groupName,
            groupDescription,
            createdBy: req.user.id,
            members: [req.user.id]
        });

        // Add group to user's group list
        await User.findByIdAndUpdate(req.user.id, {
            $push: { groups: group._id }
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Invite a member to a group
// @route   POST /api/group/invite
// @access  Private (Admin only logic applied inside)
const inviteMember = async (req, res) => {
    const { groupId, email } = req.body;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Only group admin can invite
        if (group.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only group admin can invite members' });
        }

        const userToInvite = await User.findOne({ email });

        if (!userToInvite) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (group.members.includes(userToInvite._id)) {
            return res.status(400).json({ message: 'User is already a member' });
        }

        group.members.push(userToInvite._id);
        await group.save();

        // Add group to invited user's list
        await User.findByIdAndUpdate(userToInvite._id, {
            $push: { groups: group._id }
        });

        res.status(200).json({ message: 'Member invited successfully', group });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get group details
// @route   GET /api/group/:id
// @access  Private
const getGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'name email')
            .populate('createdBy', 'name email');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is a member
        if (!group.members.some(m => m._id.toString() === req.user.id)) {
            return res.status(403).json({ message: 'Not authorized to view this group' });
        }

        res.status(200).json(group);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a group
// @route   DELETE /api/group/:id
// @access  Private (Admin only)
const deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only group admin can delete the group' });
        }

        // Remove group reference from all members
        await User.updateMany(
            { _id: { $in: group.members } },
            { $pull: { groups: group._id } }
        );

        await group.deleteOne();
        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createGroup, inviteMember, getGroup, deleteGroup };
