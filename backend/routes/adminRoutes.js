import express from 'express';
import Course from '../models/Course.js';
import Instructor from '../models/Instructor.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

const router = express.Router();

// Get all courses
router.get('/courses', protect, adminOnly, async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new course
router.post('/courses', protect, adminOnly, upload.single('image'), async (req, res) => {
    try {
        const courseData = { ...req.body };
        if (req.file && req.file.path) {
            courseData.image = req.file.path; // Set Cloudinary URL
        }
        const newCourse = new Course(courseData);
        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a course
router.delete('/courses/:id', protect, adminOnly, async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all instructors
router.get('/instructors', protect, adminOnly, async (req, res) => {
    try {
        const instructors = await Instructor.find();
        res.json(instructors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new instructor
router.post('/instructors', protect, adminOnly, async (req, res) => {
    try {
        const newInstructor = new Instructor(req.body);
        const savedInstructor = await newInstructor.save();
        res.status(201).json(savedInstructor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an instructor
router.put('/instructors/:id', protect, adminOnly, async (req, res) => {
    try {
        const updatedInstructor = await Instructor.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedInstructor) return res.status(404).json({ message: 'Instructor not found' });
        res.json(updatedInstructor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete an instructor
router.delete('/instructors/:id', protect, adminOnly, async (req, res) => {
    try {
        const deletedInstructor = await Instructor.findByIdAndDelete(req.params.id);
        if (!deletedInstructor) return res.status(404).json({ message: 'Instructor not found' });
        res.json({ message: 'Instructor deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin Dashboard stats
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments();
        const totalInstructors = await Instructor.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        
        res.json({
            totalCourses,
            totalInstructors,
            totalStudents: totalStudents > 0 ? totalStudents : 1450 // fallback for demo
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    // First, try finding an admin in the database by email
    const user = await User.findOne({ email: username });
    
    if (user && user.role === 'admin' && (await user.matchPassword(password))) {
        res.json({ 
            success: true, 
            token: generateToken(user._id),
            user: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } else if (username === 'admin' && password === 'admin123') {
        // Fallback for demo, generate a token with a dummy id
        const demoAdminId = '000000000000000000000000'; // 24 chars for dummy ObjectId
        res.json({ 
            success: true, 
            token: generateToken(demoAdminId),
            user: { _id: demoAdminId, name: 'Demo Admin', email: 'admin@admin.com', role: 'admin' }
        });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials or not an admin' });
    }
});

// Admin Enrollments
router.get('/enrollments', protect, adminOnly, async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate('student', 'name email')
            .populate('course', 'title')
            .populate('instructor', 'name');
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Enrollment (e.g. Payment Status)
router.put('/enrollments/:id', protect, adminOnly, async (req, res) => {
    try {
        const { paymentStatus, instructor, scheduleTime, zoomLink } = req.body;
        
        // Build update object based on what was sent
        const updateData = {};
        if (paymentStatus) updateData.paymentStatus = paymentStatus;
        if (instructor !== undefined) updateData.instructor = instructor; // allow null
        if (scheduleTime !== undefined) updateData.scheduleTime = scheduleTime;
        if (zoomLink !== undefined) updateData.zoomLink = zoomLink;

        const updatedEnrollment = await Enrollment.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('student', 'name email').populate('course', 'title').populate('instructor', 'name');
        
        if (!updatedEnrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }
        res.json(updatedEnrollment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete Enrollment
router.delete('/enrollments/:id', protect, adminOnly, async (req, res) => {
    try {
        const deletedEnrollment = await Enrollment.findByIdAndDelete(req.params.id);
        if (!deletedEnrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }
        res.json({ message: 'Enrollment deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
