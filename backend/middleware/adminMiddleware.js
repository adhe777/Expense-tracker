const Group = require('../models/groupModel');

const systemAdminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'system_admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a system admin' });
    }
};

const groupAdminMiddleware = async (req, res, next) => {
    const groupId = req.params.groupId || req.params.id || req.body.groupId;
    
    if (!groupId) {
        return res.status(400).json({ message: 'Group ID is required' });
    }

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.createdBy.toString() === req.user.id || req.user.role === 'system_admin') {
            req.group = group;
            next();
        } else {
            res.status(403).json({ message: 'Not authorized as group admin' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error in group admin middleware' });
    }
};

const groupMemberMiddleware = async (req, res, next) => {
    const groupId = req.params.groupId || req.params.id || req.body.groupId;

    if (!groupId) {
        return res.status(400).json({ message: 'Group ID is required' });
    }

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const isMember = group.members.some(memberId => memberId && memberId.toString() === req.user.id);
        
        if (isMember || req.user.role === 'system_admin') {
            req.group = group;
            next();
        } else {
            res.status(403).json({ message: 'Not authorized to access this group data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error in member access middleware' });
    }
};

module.exports = { systemAdminMiddleware, groupAdminMiddleware, groupMemberMiddleware };
