import express from 'express';
import mongoose from 'mongoose';
import Attendance, { ATTENDANCE_STATUSES } from '../models/Attendance.js';
import ClassReport, { RATING_MAX, RATING_MIN } from '../models/ClassReport.js';
import Enrollment from '../models/Enrollment.js';
import Payout from '../models/Payout.js';
import Instructor from '../models/Instructor.js';
import { upload, fileUrl, discardUpload } from '../config/cloudinary.js';
import { protect, instructorOnly, authorize } from '../middleware/authMiddleware.js';
import { cleanText, isHttpUrl, isValidObjectId, validateIdParam } from '../utils/validation.js';

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

// Attendance can be recorded for today or up to this many days back (not for future days).
const ATTENDANCE_MAX_DAYS_BACK = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

/** True for a real calendar date (e.g. not 2026-02-31). */
const isRealDate = (value) => {
    if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
    const d = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
};

/** Returns an error message, or '' when the day may be recorded. One day of slack covers time zones. */
const attendanceDateError = (value) => {
    if (!isRealDate(value)) return 'Invalid date.';
    const day = new Date(`${value}T00:00:00Z`).getTime();
    const today = new Date(`${todayUtc()}T00:00:00Z`).getTime();
    if (day > today + DAY_MS) return 'You cannot record attendance for a future day.';
    if (day < today - (ATTENDANCE_MAX_DAYS_BACK + 1) * DAY_MS) return `Attendance can only be recorded for the last ${ATTENDANCE_MAX_DAYS_BACK} days.`;
    return '';
};

router.get('/dashboard', async (req, res) => {
    const instructorId = resolveInstructorId(req);
    const date = resolveDate(req.query.date);
    const month = date.slice(0, 7);

    // Payment details are not the instructor's business – only whether the student has paid yet
    // (paymentStatus), so they know who is still waiting.
    const students = await Enrollment.find({ instructor: instructorId })
        .select('-receiptUrl -stripeSessionId -paymentMethod')
        .populate('student', 'name')
        .populate('course', 'level title');

    const [payouts, todayAttendance, monthAttendance] = await Promise.all([
        Payout.find({ instructor: instructorId }).sort({ createdAt: -1 }),
        // Today's marks for their current students (also those recorded before a student was moved to them).
        Attendance.find({ enrollment: mongoose.trusted({ $in: students.map((s) => s._id) }), date }).select('enrollment status').lean(),
        // This month's numbers = the attendance this instructor recorded.
        Attendance.find({ instructor: instructorId, date: mongoose.trusted({ $regex: `^${month}-` }) }).select('status').lean(),
    ]);

    const attendance = Object.fromEntries(todayAttendance.map((a) => [String(a.enrollment), a.status]));

    res.json({
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
    const date = req.body?.date === undefined ? todayUtc() : req.body.date;

    if (!isValidObjectId(enrollmentId)) {
        return res.status(400).json({ success: false, message: 'Invalid ID.' });
    }
    const dateError = attendanceDateError(date);
    if (dateError) return res.status(400).json({ success: false, message: dateError });
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

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const resolveMonth = (value) => (typeof value === 'string' && MONTH_RE.test(value) ? value : todayUtc().slice(0, 7));

// Attendance totals for every student of the instructor: this month and all time (?month=YYYY-MM).
// Must be declared before /attendance/:enrollmentId.
router.get('/attendance-summary', async (req, res) => {
    const instructorId = resolveInstructorId(req);
    const month = resolveMonth(req.query.month);
    // Grouped by student enrollment (not by who recorded it), so a student moved from another
    // instructor keeps their full attendance history.
    const enrollmentIds = (await Enrollment.find({ instructor: instructorId }).select('_id').lean()).map((e) => e._id);
    const rows = await Attendance.aggregate([
        { $match: { enrollment: mongoose.trusted({ $in: enrollmentIds }) } },
        {
            $group: {
                _id: '$enrollment',
                present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
                absent: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } },
                monthPresent: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'Present'] }, { $eq: [{ $substrCP: ['$date', 0, 7] }, month] }] }, 1, 0] } },
                monthAbsent: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'Absent'] }, { $eq: [{ $substrCP: ['$date', 0, 7] }, month] }] }, 1, 0] } },
                lastDate: { $max: '$date' },
            },
        },
    ]);
    res.json({ month, summary: Object.fromEntries(rows.map(({ _id, ...rest }) => [String(_id), rest])) });
});

// One student's attendance for a month (?month=YYYY-MM, default: this month). Own students only.
router.get('/attendance/:enrollmentId', async (req, res) => {
    const month = resolveMonth(req.query.month);

    const enrollment = await Enrollment.findById(req.params.enrollmentId).select('instructor');
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found.' });
    if (req.user.role !== 'admin' && String(enrollment.instructor) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'This student is not assigned to you.' });
    }

    const [records, totals] = await Promise.all([
        Attendance.find({ enrollment: enrollment._id, date: mongoose.trusted({ $regex: `^${month}-` }) })
            .select('date status -_id').sort({ date: 1 }).lean(),
        Attendance.aggregate([
            { $match: { enrollment: enrollment._id } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
    ]);
    const total = Object.fromEntries(totals.map((t) => [t._id, t.count]));

    res.json({
        month,
        records,
        maxDaysBack: ATTENDANCE_MAX_DAYS_BACK,
        allTime: { present: total.Present || 0, absent: total.Absent || 0 },
    });
});

// ---------------------------------------------------------------------------
// Class reports (what was recited, homework, notes, ratings)
// ---------------------------------------------------------------------------

/** Loads the enrollment and checks it belongs to the instructor (admins may access any). */
const ownEnrollment = async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.enrollmentId).select('instructor student');
    if (!enrollment) {
        res.status(404).json({ success: false, message: 'Enrollment not found.' });
        return null;
    }
    if (req.user.role !== 'admin' && String(enrollment.instructor) !== String(req.user._id)) {
        res.status(403).json({ success: false, message: 'This student is not assigned to you.' });
        return null;
    }
    return enrollment;
};

/** A rating is optional: null/empty clears it, otherwise a whole number in range. Returns undefined when invalid. */
const parseRating = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isInteger(n) && n >= RATING_MIN && n <= RATING_MAX ? n : undefined;
};

const REPORT_FIELDS = 'date recited homework notes memorization tajweed updatedAt';

// A student's reports, newest first.
router.get('/reports/:enrollmentId', async (req, res) => {
    const enrollment = await ownEnrollment(req, res);
    if (!enrollment) return;
    const reports = await ClassReport.find({ enrollment: enrollment._id }).select(REPORT_FIELDS).sort({ date: -1 }).limit(200).lean();
    res.json({ reports });
});

// Create or update the report for one class day.
router.put('/reports/:enrollmentId/:date', authorize('instructor'), async (req, res) => {
    const { date } = req.params;
    const dateError = attendanceDateError(date);
    if (dateError) return res.status(400).json({ success: false, message: dateError });

    const enrollment = await ownEnrollment(req, res);
    if (!enrollment) return;

    const body = req.body || {};
    const recited = cleanText(body.recited, 500);
    const homework = cleanText(body.homework, 500);
    const notes = cleanText(body.notes, 1000);
    const memorization = parseRating(body.memorization);
    const tajweed = parseRating(body.tajweed);
    if (memorization === undefined || tajweed === undefined) {
        return res.status(400).json({ success: false, message: `Ratings must be between ${RATING_MIN} and ${RATING_MAX}.` });
    }
    if (!recited && !homework && !notes && memorization === null && tajweed === null) {
        return res.status(400).json({ success: false, message: 'The report is empty.' });
    }

    const report = await ClassReport.findOneAndUpdate(
        { enrollment: enrollment._id, date },
        { enrollment: enrollment._id, date, instructor: req.user._id, student: enrollment.student, recited, homework, notes, memorization, tajweed },
        { upsert: true, new: true, runValidators: true }
    ).select(REPORT_FIELDS).lean();
    res.json(report);
});

router.delete('/reports/:enrollmentId/:date', authorize('instructor'), async (req, res) => {
    const enrollment = await ownEnrollment(req, res);
    if (!enrollment) return;
    if (!isRealDate(req.params.date)) return res.status(400).json({ success: false, message: 'Invalid date.' });
    await ClassReport.deleteOne({ enrollment: enrollment._id, date: req.params.date });
    res.json({ success: true });
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

const CLOCK_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// Set a student's class days, time and Zoom link (own students only; admins may edit any).
// Sending no days clears the schedule.
router.put('/schedule/:enrollmentId', async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.enrollmentId);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found.' });
    if (req.user.role !== 'admin' && String(enrollment.instructor) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'This student is not assigned to you.' });
    }

    const { days, time, zoomLink } = req.body || {};
    if (!Array.isArray(days) || days.length > 7 || !days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6)) {
        return res.status(400).json({ success: false, message: 'Please choose the class days.' });
    }
    const uniqueDays = [...new Set(days)].sort((a, b) => a - b);
    if (uniqueDays.length > 0 && (typeof time !== 'string' || !CLOCK_RE.test(time))) {
        return res.status(400).json({ success: false, message: 'Please choose the class time.' });
    }
    const link = cleanText(zoomLink, 500);
    if (link && !isHttpUrl(link)) {
        return res.status(400).json({ success: false, message: 'The class link must start with https://' });
    }

    enrollment.scheduleDays = uniqueDays;
    enrollment.scheduleClock = uniqueDays.length ? time : '';
    enrollment.scheduleTime = ''; // the structured schedule replaces any old free-text time
    enrollment.zoomLink = link;
    await enrollment.save();
    res.json({ _id: enrollment._id, scheduleDays: enrollment.scheduleDays, scheduleClock: enrollment.scheduleClock, scheduleTime: '', zoomLink: enrollment.zoomLink });
});

// ---------------------------------------------------------------------------
// Public profile (photo + short bio shown on the website)
// ---------------------------------------------------------------------------

const PUBLIC_PROFILE = 'name rank gender photoUrl bioAr bioEn';

router.get('/profile', authorize('instructor'), async (req, res) => {
    const profile = await Instructor.findById(req.user._id).select(PUBLIC_PROFILE).lean();
    if (!profile) return res.status(404).json({ success: false, message: 'Instructor not found.' });
    res.json(profile);
});

router.put('/profile', authorize('instructor'), async (req, res) => {
    const body = req.body || {};
    const update = {};
    if (body.bioAr !== undefined) update.bioAr = cleanText(body.bioAr, 600);
    if (body.bioEn !== undefined) update.bioEn = cleanText(body.bioEn, 600);
    const profile = await Instructor.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true }).select(PUBLIC_PROFILE).lean();
    if (!profile) return res.status(404).json({ success: false, message: 'Instructor not found.' });
    res.json(profile);
});

// Upload / replace the profile photo (JPEG, PNG or WEBP, max 5 MB).
router.post('/photo', authorize('instructor'), upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please choose an image.' });
    const profile = await Instructor.findByIdAndUpdate(req.user._id, { photoUrl: fileUrl(req, req.file) }, { new: true }).select(PUBLIC_PROFILE).lean();
    if (!profile) {
        discardUpload(req.file);
        return res.status(404).json({ success: false, message: 'Instructor not found.' });
    }
    res.json(profile);
});

// Remove the photo (the website then shows the default picture).
router.delete('/photo', authorize('instructor'), async (req, res) => {
    const profile = await Instructor.findByIdAndUpdate(req.user._id, { photoUrl: '' }, { new: true }).select(PUBLIC_PROFILE).lean();
    if (!profile) return res.status(404).json({ success: false, message: 'Instructor not found.' });
    res.json(profile);
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
