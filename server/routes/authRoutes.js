const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* SIGNUP */
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username, // ✅ IMPORTANT
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username, // ✅ IMPORTANT
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
