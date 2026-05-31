import express from 'express';
import { courses, instructors } from '../data/store.js';

const router = express.Router();

// Get public courses for client page
router.get('/courses', (req, res) => {
    res.json(courses);
});

// Get public instructors for client page
router.get('/instructors', (req, res) => {
    res.json(instructors);
});

export default router;
