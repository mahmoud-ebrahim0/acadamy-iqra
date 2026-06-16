import express from 'express';
import Course from '../models/Course.js';
import Instructor from '../models/Instructor.js';
import User from '../models/User.js';

const router = express.Router();

// Get public courses for client page
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get public instructors for client page
router.get('/instructors', async (req, res) => {
    try {
        const instructors = await Instructor.find();
        res.json(instructors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// User Registration
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();

        const token = `user-token-${newUser._id}`;
        res.status(201).json({ success: true, token, user: { name: newUser.name, email: newUser.email } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email, password });
        if (user) {
            const token = `user-token-${user._id}`;
            res.json({ success: true, token, user: { name: user.name, email: user.email } });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
