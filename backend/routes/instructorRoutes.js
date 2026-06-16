import express from 'express';
import ClassSession from '../models/ClassSession.js';
import Enrollment from '../models/Enrollment.js';
import Payout from '../models/Payout.js';

const router = express.Router();

// Get instructor dashboard data
// We assume instructorId is passed in query for simplicity
router.get('/dashboard', async (req, res) => {
    try {
        const instructorId = req.query.instructorId;
        
        // Today's classes
        const schedule = await ClassSession.find({ instructor: instructorId })
            .populate('student', 'name')
            .populate({ path: 'enrollment', populate: { path: 'course', select: 'title' } });
            
        // Assigned Students (unique students from their enrollments)
        const studentsList = await Enrollment.find({ instructor: instructorId })
            .populate('student', 'name')
            .populate('course', 'level title');
            
        // Payout History
        const payouts = await Payout.find({ instructor: instructorId }).sort({ createdAt: -1 });

        res.json({
            schedule,
            students: studentsList,
            payouts
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Student Progress
router.put('/progress/:enrollmentId', async (req, res) => {
    try {
        const { currentAyahOrLesson, progressPercentage } = req.body;
        const updated = await Enrollment.findByIdAndUpdate(
            req.params.enrollmentId, 
            { currentAyahOrLesson, progressPercentage }, 
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Request Payout
router.post('/payouts', async (req, res) => {
    try {
        const newPayout = new Payout(req.body);
        await newPayout.save();
        res.status(201).json(newPayout);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
