const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/user');

// Create a new group
router.post('/create', async (req, res) => {
    try {
        const { name, members, admin, profilePic } = req.body;

        // Ensure admin is in members
        const allMembers = [...new Set([...members, admin])];

        const newGroup = new Group({
            name,
            members: allMembers,
            admin,
            profilePic
        });

        await newGroup.save();

        // Populate members to return full user objects
        const populatedGroup = await Group.findById(newGroup._id).populate('members', 'username name profilePic email');

        res.status(201).json(populatedGroup);
    } catch (error) {
        console.error("Create group error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get groups for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const groups = await Group.find({ members: req.params.userId })
            .populate('members', 'username name profilePic email')
            .sort({ updatedAt: -1 });
        res.json(groups);
    } catch (error) {
        console.error("Get groups error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Add member to group
router.put('/:id/add-member', async (req, res) => {
    try {
        const { memberId } = req.body;
        const group = await Group.findById(req.params.id);

        if (!group) return res.status(404).json({ message: "Group not found" });

        if (group.members.includes(memberId)) {
            return res.status(400).json({ message: "User already in group" });
        }

        group.members.push(memberId);
        await group.save();

        const updatedGroup = await Group.findById(req.params.id).populate('members', 'username name profilePic email');
        res.json(updatedGroup);
    } catch (error) {
        console.error("Add member error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Update group (name, profilePic)
router.put('/:id/update', async (req, res) => {
    try {
        const { name, profilePic } = req.body;
        const group = await Group.findById(req.params.id);

        if (!group) return res.status(404).json({ message: "Group not found" });

        if (name) group.name = name;
        if (profilePic !== undefined) group.profilePic = profilePic;

        await group.save();

        const updatedGroup = await Group.findById(req.params.id).populate('members', 'username name profilePic email');
        res.json(updatedGroup);
    } catch (error) {
        console.error("Update group error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
