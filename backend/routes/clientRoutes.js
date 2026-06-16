import express from 'express';
import { courses, instructors, users } from '../data/store.js';

const router = express.Router();

// Get public courses for client page
router.get('/courses', (req, res) => {
    res.json(courses);
});

// Get public instructors for client page
router.get('/instructors', (req, res) => {
    res.json(instructors);
});

// User Registration
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    // Check if user exists
    const userExists = users.find(u => u.email === email);
    if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user (Mocking ID and saving plain text password for demo only)
    const newUser = {
        id: Date.now(),
        name,
        email,
        password // In a real app, this MUST be hashed with bcrypt
    };

    users.push(newUser);

    // Mock token
    const token = `user-token-${newUser.id}`;
    
    res.status(201).json({ success: true, token, user: { name: newUser.name, email: newUser.email } });
});

// User Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const token = `user-token-${user.id}`;
        res.json({ success: true, token, user: { name: user.name, email: user.email } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
});

export default router;
