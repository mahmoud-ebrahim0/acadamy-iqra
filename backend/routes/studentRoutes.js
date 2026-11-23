import express from 'express';
import Enrollment from '../models/Enrollment.js';
import ClassReport from '../models/ClassReport.js';
import Attendance from '../models/Attendance.js';
import mongoose from 'mongoose';
import { validateIdParam } from '../utils/validation.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student portal API: only for student accounts.
router.use(protect, authorize('student'));
router.param('enrollmentId', validateIdParam);

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// The student is always taken from the token – never from the query string.
router.get('/dashboard', async (req, res) => {
    const enrollments = await Enrollment.find({ student: req.user._id })
        .select('-stripeSessionId -receiptUrl')
        .populate('course')
        .populate('instructor', 'name rank')
        .sort({ enrolledAt: -1 });

    // The instructor's class reports (newest first), so students and parents can follow along.
    const reports = await ClassReport.find({ student: req.user._id })
        .select('enrollment date recited homework notes memorization tajweed')
        .sort({ date: -1 })
        .limit(100)
        .lean();

    // Attendance totals per course, so students and parents can see how regularly they attend.
    const attendanceRows = await Attendance.aggregate([
        { $match: { student: req.user._id } },
        {
            $group: {
                _id: '$enrollment',
                present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
                absent: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } },
                lastDate: { $max: '$date' },
            },
        },
    ]);
    const attendance = Object.fromEntries(attendanceRows.map(({ _id, ...rest }) => [String(_id), rest]));

    res.json({ enrollments, reports, attendance });
});

// The student's own attendance for one course and month (?month=YYYY-MM). Read-only.
router.get('/attendance/:enrollmentId', async (req, res) => {
    const enrollment = await Enrollment.findOne({ _id: req.params.enrollmentId, student: req.user._id }).select('_id').lean();
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found.' });

    const month = typeof req.query.month === 'string' && MONTH_RE.test(req.query.month)
        ? req.query.month
        : new Date().toISOString().slice(0, 7);
    const [records, totals] = await Promise.all([
        Attendance.find({ enrollment: enrollment._id, date: mongoose.trusted({ $regex: `^${month}-` }) })
            .select('date status -_id').sort({ date: 1 }).lean(),
        Attendance.aggregate([
            { $match: { enrollment: enrollment._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
    ]);
    const total = Object.fromEntries(totals.map((t) => [t._id, t.count]));
    res.json({ month, records, allTime: { present: total.Present || 0, absent: total.Absent || 0 } });
});

export default router;
