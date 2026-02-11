const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/user"); // adjust path if needed
const sendEmail = require("../../utils/sendEmail");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET;

// ------------------- REGISTER -------------------
router.post("/register", async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await User.create({
      username,
      name,
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: false
    });

    const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;
    const message = `Click the following link to verify your email: ${verificationUrl}`;

    try {
      await sendEmail(newUser.email, "Verify Email", message);
      console.log(`Verification email sent to ${newUser.email}. Link: ${verificationUrl}`); // Log for dev
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Consider whether to rollback user creation or just inform user
    }

    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
      user: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        profilePic: newUser.profilePic,
        bio: newUser.bio,
        isAdmin: newUser.isAdmin,
        isVerified: newUser.isVerified
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    // Log validation errors specifically
    if (err.name === 'ValidationError') {
      console.error("Validation Error Details:", err.errors);
    }
    res.status(500).json({ message: "Server error, please try again", error: err.message });
  }
});

// ------------------- VERIFY EMAIL -------------------
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Invalid or missing token" });
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------- LOGIN -------------------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error, please try again" });
  }
});

// ------------------- GET ALL USERS -------------------
router.get("/users/:id", async (req, res, next) => {
  try {
    console.log(`Fetching users excluding ${req.params.id}`);
    const users = await User.find({ _id: { $ne: req.params.id } }).select("-password");
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (ex) {
    next(ex);
  }
});

// ------------------- UPDATE PROFILE -------------------
router.put("/update/:id", async (req, res) => {
  try {
    const { name, bio, profilePic } = req.body;
    const userId = req.params.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, bio, profilePic },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------- GET USER PROFILE -------------------
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------- SEARCH USERS -------------------
router.get("/search", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.json([]);

    const users = await User.find({
      username: { $regex: username, $options: "i" },
    }).select("username name profilePic email");

    res.json(users);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------- ADD CONTACT -------------------
router.post("/add-contact", async (req, res) => {
  try {
    const { userId, contactId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.contacts.includes(contactId)) {
      return res.status(400).json({ message: "User already in contacts" });
    }

    user.contacts.push(contactId);
    await user.save();

    const contact = await User.findById(contactId).select("username name profilePic email");

    res.json({ message: "Contact added", contact });
  } catch (error) {
    console.error("Add contact error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------- GET CONTACTS -------------------
router.get("/contacts/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("contacts", "username name profilePic email");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.contacts);
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
