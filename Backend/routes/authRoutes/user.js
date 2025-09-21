const express = require("express");
const router = express.Router();
const User = require("../../models/user");

router.post("/register", async (req, res) => {
    const { username, password, email } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
    }
    const newUser = await User.create({ username, password, email });
    res.status(201).json({ message: "User registered successfully", user: newUser });
});
module.exports = router;
