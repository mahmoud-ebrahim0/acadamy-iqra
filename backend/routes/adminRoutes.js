import express from 'express';
import { courses, instructors } from '../data/store.js';

const router = express.Router();

// Get all courses
router.get('/courses', (req, res) => {
    res.json(courses);
});

// Add a new course
router.post('/courses', (req, res) => {
    const newCourse = {
        id: Date.now(),
        ...req.body
    };
    courses.push(newCourse);
    res.status(201).json(newCourse);
});

// Delete a course
router.delete('/courses/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = courses.findIndex(c => c.id === id);
    if (index !== -1) {
        courses.splice(index, 1);
        res.json({ message: 'Course deleted successfully' });
    } else {
        res.status(404).json({ message: 'Course not found' });
    }
});

// Get all instructors
router.get('/instructors', (req, res) => {
    res.json(instructors);
});

// Admin Dashboard stats
router.get('/stats', (req, res) => {
    res.json({
        totalCourses: courses.length,
        totalInstructors: instructors.length,
        totalStudents: 1450, // Static demo number
    });
});

export default router;
