const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get chat history between two users
router.get('/history/:userId/:recipientId', async (req, res) => {
    try {
        const { userId, recipientId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: userId, recipient: recipientId },
                { sender: recipientId, recipient: userId }
            ]
        })
            .populate('sender', 'username name profilePic')
            .sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get group chat history
router.get('/group-history/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await Message.find({ groupId })
            .populate('sender', 'username name profilePic')
            .sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching group history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
