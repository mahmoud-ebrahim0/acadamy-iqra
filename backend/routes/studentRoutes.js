import express from 'express';
import Enrollment from '../models/Enrollment.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// The student is always taken from the token – never from the query string.
router.get('/dashboard', async (req, res) => {
    const enrollments = await Enrollment.find({ student: req.user._id })
        .select('-stripeSessionId -receiptUrl')
        .populate('course')
        .populate('instructor', 'name rank')
        .sort({ enrolledAt: -1 });

    res.json({ enrollments });
});

export default router;
