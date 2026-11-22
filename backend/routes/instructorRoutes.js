import express from 'express';
import mongoose from 'mongoose';
import ClassSession from '../models/ClassSession.js';
import Attendance, { ATTENDANCE_STATUSES } from '../models/Attendance.js';
import Enrollment from '../models/Enrollment.js';
import Payout from '../models/Payout.js';
import { protect, instructorOnly, authorize } from '../middleware/authMiddleware.js';
import { cleanText, isValidObjectId, validateIdParam } from '../utils/validation.js';

export const PAYOUT_METHODS = ['Vodafone Cash', 'InstaPay', 'PayPal', 'Bank Transfer'];

const router = express.Router();
router.param('enrollmentId', validateIdParam);
router.use(protect, instructorOnly);

// Instructors only see their own data. Admins may look at any instructor via ?instructorId=
const resolveInstructorId = (req) => {
    if (req.user.role === 'admin' && isValidObjectId(req.query.instructorId)) return req.query.instructorId;
    return req.user._id;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const todayUtc = () => new Date().toISOString().slice(0, 10);
// The browser sends its local date so "today" matches the instructor's calendar.
const resolveDate = (value) => (typeof value === 'string' && DATE_RE.test(value) ? value : todayUtc());
const payoutAmount = (p) => Number(String(p.amount).replace(/[^0-9.]/g, '')) || 0;

router.get('/dashboard', async (req, res) => {
    const instructorId = resolveInstructorId(req);
    const date = resolveDate(req.query.date);
    const month = date.slice(0, 7);

    const [schedule, students, payouts, todayAttendance, monthAttendance] = await Promise.all([
        ClassSession.find({ instructor: instructorId })
            .populate('student', 'name')
            .populate({ path: 'enrollment', select: 'course', populate: { path: 'course', select: 'title' } }),
        // Payment details are not the instructor's business.
        Enrollment.find({ instructor: instructorId })
            .select('-receiptUrl -stripeSessionId -paymentMethod -paymentStatus')
            .populate('student', 'name')
            .populate('course', 'level title'),
        Payout.find({ instructor: instructorId }).sort({ createdAt: -1 }),
        Attendance.find({ instructor: instructorId, date }).select('enrollment status').lean(),
        Attendance.find({ instructor: instructorId, date: mongoose.trusted({ $regex: `^${month}-` }) }).select('status').lean(),
    ]);

    const attendance = Object.fromEntries(todayAttendance.map((a) => [String(a.enrollment), a.status]));

    res.json({
        schedule,
        students,
        payouts,
        attendance,
        stats: {
            presentThisMonth: monthAttendance.filter((a) => a.status === 'Present').length,
            absentThisMonth: monthAttendance.filter((a) => a.status === 'Absent').length,
        },
        wallet: {
            pendingTotal: payouts.filter((p) => p.status === 'Pending').reduce((sum, p) => sum + payoutAmount(p), 0),
            paidTotal: payouts.filter((p) => p.status === 'Paid').reduce((sum, p) => sum + payoutAmount(p), 0),
        },
    });
});

// Mark a student present/absent for a day (status null clears it).
router.post('/attendance', authorize('instructor'), async (req, res) => {
    const { enrollmentId, status } = req.body || {};
    const date = resolveDate(req.body?.date);

    if (!isValidObjectId(enrollmentId)) {
        return res.status(400).json({ success: false, message: 'Invalid ID.' });
    }
    if (status !== null && !ATTENDANCE_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid attendance status.' });
    }

    const enrollment = await Enrollment.findById(enrollmentId).select('instructor student');
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found.' });
    if (String(enrollment.instructor) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'This student is not assigned to you.' });
    }

    if (status === null) {
        await Attendance.deleteOne({ enrollment: enrollment._id, date });
        return res.json({ success: true, enrollmentId, date, status: null });
    }

    await Attendance.findOneAndUpdate(
        { enrollment: enrollment._id, date },
        { enrollment: enrollment._id, date, status, instructor: req.user._id, student: enrollment.student },
        { upsert: true, runValidators: true }
    );
    res.json({ success: true, enrollmentId, date, status });
});

// Update the progress of one of *their* students.
router.put('/progress/:enrollmentId', async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.enrollmentId);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found.' });

    if (req.user.role !== 'admin' && String(enrollment.instructor) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'This student is not assigned to you.' });
    }

    const { currentAyahOrLesson, progressPercentage } = req.body || {};
    if (currentAyahOrLesson !== undefined) {
        enrollment.currentAyahOrLesson = cleanText(currentAyahOrLesson, 200);
    }
    if (progressPercentage !== undefined) {
        const pct = Number(progressPercentage);
        if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
            return res.status(400).json({ success: false, message: 'Progress must be between 0 and 100.' });
        }
        enrollment.progressPercentage = pct;
    }

    await enrollment.save();
    res.json(enrollment);
});

// Request a payout. The instructor, invoice number, date and status are set by the server.
router.post('/payouts', authorize('instructor'), async (req, res) => {
    const body = req.body || {};
    const amount = Number(body.amount);
    const method = body.method;
    const details = cleanText(body.details, 300);

    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
        return res.status(400).json({ success: false, message: 'Please enter a valid amount.' });
    }
    if (!PAYOUT_METHODS.includes(method)) {
        return res.status(400).json({ success: false, message: 'Please choose a valid payout method.' });
    }
    if (!details) {
        return res.status(400).json({ success: false, message: 'Please enter your account details.' });
    }

    const payout = await Payout.create({
        instructor: req.user._id,
        invoiceId: `#INV-${Date.now().toString(36).toUpperCase()}`,
        amount: `$${amount.toFixed(2)}`,
        method,
        details,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
    });
    res.status(201).json(payout);
});

export default router;
