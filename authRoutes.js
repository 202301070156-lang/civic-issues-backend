const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User =require('../models/User')

// 🔐 Generate Token
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};


// ==========================
// ✅ REGISTER
// ==========================
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        console.log("ROLE RECEIVED:", role);

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ FIX: Default role handling
        const userRole = role && role === "admin" ? "admin" : "citizen";

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: userRole
        });

        res.status(201).json({
            message: "User registered successfully",
            token: generateToken(user._id, user.role),
            role: user.role
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// ==========================
// ✅ LOGIN
// ==========================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {

            res.json({
                message: "Login successful",
                token: generateToken(user._id, user.role),
                role: user.role   // ✅ IMPORTANT (already correct)
            });

        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;