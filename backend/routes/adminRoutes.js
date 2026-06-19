import express from 'express';
import Course from '../models/Course.js';
import Instructor from '../models/Instructor.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';

const router = express.Router();

// Get all courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new course
router.post('/courses', async (req, res) => {
    try {
        const newCourse = new Course(req.body);
        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a course
router.delete('/courses/:id', async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all instructors
router.get('/instructors', async (req, res) => {
    try {
        const instructors = await Instructor.find();
        res.json(instructors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a new instructor
router.post('/instructors', async (req, res) => {
    try {
        const newInstructor = new Instructor(req.body);
        const savedInstructor = await newInstructor.save();
        res.status(201).json(savedInstructor);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Admin Dashboard stats
router.get('/stats', async (req, res) => {
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
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true, token: 'fake-jwt-token-12345' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Admin Enrollments
router.get('/enrollments', async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate('student', 'name email')
            .populate('course', 'title');
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Enrollment (e.g. Payment Status)
router.put('/enrollments/:id', async (req, res) => {
    try {
        const { paymentStatus } = req.body;
        const updatedEnrollment = await Enrollment.findByIdAndUpdate(
            req.params.id,
            { paymentStatus },
            { new: true }
        ).populate('student', 'name email').populate('course', 'title');
        
        if (!updatedEnrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }
        res.json(updatedEnrollment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete Enrollment
router.delete('/enrollments/:id', async (req, res) => {
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
