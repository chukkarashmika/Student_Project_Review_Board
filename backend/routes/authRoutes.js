const express = require("express");
const crypto = require("crypto");
const router = express.Router();

const User = require("../models/User");

function createPasswordHash(password, salt) {
    return crypto
        .pbkdf2Sync(password, salt, 100000, 64, "sha512")
        .toString("hex");
}

function sanitizeUser(user) {
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        qualification: user.qualification
    };
}

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, role, qualification } = req.body;

        if (!name || !email || !password || !role || !qualification) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (!["student", "faculty"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role selected"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists. Please login."
            });
        }

        const passwordSalt = crypto.randomBytes(16).toString("hex");

        const user = await User.create({
            name,
            email,
            role,
            qualification,
            passwordSalt,
            passwordHash: createPasswordHash(password, passwordSalt)
        });

        res.status(201).json(sanitizeUser(user));
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Email, password, and role are required"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            role
        });

        if (
            !user ||
            user.passwordHash !== createPasswordHash(password, user.passwordSalt)
        ) {
            return res.status(401).json({
                message: "Invalid login details"
            });
        }

        res.json(sanitizeUser(user));
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const users = await User.find()
            .select("-passwordHash")
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;
