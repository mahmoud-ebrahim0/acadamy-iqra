import express from 'express';
import Enrollment from '../models/Enrollment.js';
import ClassSession from '../models/ClassSession.js';

const router = express.Router();

// Get student dashboard data
// We assume the user ID is passed in the query for simplicity in this demo (e.g. ?userId=...)
router.get('/dashboard', async (req, res) => {
    try {
        const userId = req.query.userId;
        
        // Find all enrollments for this student and populate the related course and instructor info
        const enrollments = await Enrollment.find({ student: userId })
            .populate('course')
            .populate('instructor');
            
        res.json({
            enrollments
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Demo Route to force an enrollment (so we have data)
router.post('/enroll-demo', async (req, res) => {
    try {
        const newEnroll = new Enrollment(req.body);
        await newEnroll.save();
        
        // Also create a dummy class session for this enrollment
        const newClass = new ClassSession({
            enrollment: newEnroll._id,
            instructor: newEnroll.instructor,
            student: newEnroll.student,
            date: 'Today',
            time: '5:00 PM',
            status: 'upcoming'
        });
        await newClass.save();
        
        res.status(201).json({ newEnroll, newClass });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
