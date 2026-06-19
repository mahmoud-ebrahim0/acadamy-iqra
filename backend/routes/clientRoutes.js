import express from 'express';
import Course from '../models/Course.js';
import Instructor from '../models/Instructor.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';

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

        let role = 'student';
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail === 'admin@admin.com') {
            role = 'admin';
        } else if (normalizedEmail.endsWith('@instructor.com')) {
            role = 'instructor';
        }

        const newUser = new User({ name, email, password, role });
        await newUser.save();

        if (role === 'instructor') {
            const newInstructor = new Instructor({
                _id: newUser._id,
                name: newUser.name,
                rank: 'New Instructor',
                schedule: 'TBD',
                salary: 'TBD'
            });
            await newInstructor.save();
        }

        const token = `user-token-${newUser._id}`;
        res.status(201).json({ success: true, token, user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } });
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
            res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Checkout Endpoint: Registers user and creates pending enrollment
router.post('/checkout', async (req, res) => {
    try {
        const { name, email, password, age, whatsapp, level, courseId, paymentMethod } = req.body;
        
        // 1. Find or create user
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ name, email, password, role: 'student' });
            await user.save();
        }

        // 2. We no longer assign an instructor automatically. The Admin will assign them manually from the dashboard.
        const newEnrollment = new Enrollment({
            student: user._id,
            course: courseId,
            instructor: null, // Set to null initially
            status: 'Pending',
            paymentStatus: paymentMethod === 'Credit Card' ? 'Paid' : 'Pending'
        });
        await newEnrollment.save();

        const token = `user-token-${user._id}`;
        res.status(201).json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
