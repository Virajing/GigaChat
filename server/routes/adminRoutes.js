const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Group = require('../models/Group');
const Message = require('../models/Message');

// Get all users with their contacts and groups
router.get('/users', async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('contacts', 'username name email profilePic');

        // Get groups for each user
        const usersWithGroups = await Promise.all(users.map(async (user) => {
            const groups = await Group.find({ members: user._id })
                .select('name members profilePic admin');
            return {
                ...user.toObject(),
                groups
            };
        }));

        res.json(usersWithGroups);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all messages for a specific user (1-on-1 chats)
router.get('/user/:userId/messages', async (req, res) => {
    try {
        const { userId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: userId, groupId: null },
                { recipient: userId, groupId: null }
            ]
        })
            .populate('sender', 'username name profilePic')
            .sort({ timestamp: -1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching user messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get messages between two specific users
router.get('/chat/:user1/:user2', async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: user1, recipient: user2 },
                { sender: user2, recipient: user1 }
            ]
        })
            .populate('sender', 'username name profilePic')
            .sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching chat:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all messages in a specific group
router.get('/group/:groupId/messages', async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await Message.find({ groupId })
            .populate('sender', 'username name profilePic')
            .sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching group messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search messages by keyword
router.get('/search/messages', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const messages = await Message.find({
            content: { $regex: query, $options: 'i' }
        })
            .populate('sender', 'username name profilePic')
            .sort({ timestamp: -1 })
            .limit(50);

        res.json(messages);
    } catch (error) {
        console.error('Error searching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
