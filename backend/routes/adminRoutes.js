import express from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Instructor from '../models/Instructor.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Attendance from '../models/Attendance.js';
import ClassReport from '../models/ClassReport.js';
import Payout from '../models/Payout.js';
import Page, { PAGE_SLUGS } from '../models/Page.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { upload, fileUrl, discardUpload } from '../config/cloudinary.js';
import { authResponse } from '../utils/token.js';
import { notify } from '../utils/notify.js';
import Consultation, { CONSULTATION_STATUSES } from '../models/Consultation.js';
import Setting, { SETTING_FIELDS, SOCIAL_FIELDS } from '../models/Setting.js';
import {
    cleanText,
    isHttpUrl,
    isValidEmail,
    isValidObjectId,
    isValidPassword,
    normalizeEmail,
    parsePrice,
    validateIdParam,
    PASSWORD_MIN_LENGTH,
} from '../utils/validation.js';

const router = express.Router();
router.param('id', validateIdParam);

// Admin Login (kept for API compatibility – the website uses /api/client/login for everyone)
router.post('/login', authLimiter, async (req, res) => {
    const body = req.body || {};
    const email = normalizeEmail(body.email || body.username);

    const user = email ? await User.findOne({ email }).select('+password') : null;
    if (!user || user.role !== 'admin' || !(await user.matchPassword(body.password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials or not an admin.' });
    }
    res.json(authResponse(user));
});

// Every route below requires a logged-in admin.
router.use(protect, adminOnly);

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

// Courses with their numbers: students enrolled, paid (active) enrollments and revenue.
router.get('/courses', async (req, res) => {
    const [courses, rows] = await Promise.all([
        Course.find().sort({ createdAt: 1 }).lean(),
        Enrollment.aggregate([
            {
                $group: {
                    _id: '$course',
                    students: { $sum: 1 },
                    active: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Pending'] }, 1, 0] } },
                },
            },
        ]),
    ]);
    const statsBy = new Map(rows.map(({ _id, ...rest }) => [String(_id), rest]));
    res.json(courses.map((c) => {
        const s = statsBy.get(String(c._id)) || { students: 0, active: 0, pending: 0 };
        const price = Number(c.price) || 0;
        return { ...c, published: c.published !== false, stats: { ...s, revenue: s.active * price } };
    }));
});

router.post('/courses', upload.single('image'), async (req, res) => {
    const body = req.body || {};
    const title = cleanText(body.title, 150);
    const description = cleanText(body.description, 2000);
    const level = cleanText(body.level, 100);
    const price = parsePrice(body.price);

    if (!title || !description || !level || price === null) {
        discardUpload(req.file);
        return res.status(400).json({
            success: false,
            message: 'Title, level, description and a valid price (e.g. 50 or 49.99) are required.',
        });
    }

    const course = await Course.create({
        title,
        description,
        level,
        price: String(price),
        icon: cleanText(body.icon, 10) || '📚',
        imageUrl: fileUrl(req, req.file),
    });
    res.status(201).json(course);
});

// Edit a course. Only the fields that are sent are changed; a new image replaces the old one.
router.put('/courses/:id', upload.single('image'), async (req, res) => {
    const body = req.body || {};
    const update = {};
    const fail = (message) => {
        discardUpload(req.file);
        return res.status(400).json({ success: false, message });
    };

    for (const [field, max] of [['title', 150], ['description', 2000], ['level', 100]]) {
        if (body[field] !== undefined) {
            const value = cleanText(body[field], max);
            if (!value) return fail('Fields cannot be empty.');
            update[field] = value;
        }
    }
    if (body.price !== undefined) {
        const price = parsePrice(body.price);
        if (price === null) return fail('Title, level, description and a valid price (e.g. 50 or 49.99) are required.');
        update.price = String(price);
    }
    if (body.icon !== undefined) update.icon = cleanText(body.icon, 10) || '📚';
    if (body.published !== undefined) update.published = body.published === true || body.published === 'true';
    if (req.file) update.imageUrl = fileUrl(req, req.file);
    else if (body.removeImage === 'true') update.imageUrl = '';

    const course = await Course.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!course) {
        discardUpload(req.file);
        return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    res.json(course);
});

router.delete('/courses/:id', async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid ID.' });
    // A course with students can't be deleted (their enrollments would lose their course): hide it instead.
    if (await Enrollment.exists({ course: req.params.id })) {
        return res.status(409).json({ success: false, message: 'This course has enrolled students. Hide it from the website instead of deleting it.' });
    }
    const deleted = await Course.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, message: 'Course deleted successfully.' });
});

// ---------------------------------------------------------------------------
// Instructors
// ---------------------------------------------------------------------------

const pickInstructorFields = (body) => {
    const fields = {};
    if (body.name !== undefined) fields.name = cleanText(body.name, 100);
    if (body.rank !== undefined) fields.rank = cleanText(body.rank, 100);
    if (body.salary !== undefined) fields.salary = cleanText(body.salary, 50);
    if (body.gender === 'male' || body.gender === 'female') fields.gender = body.gender;
    // Attendance and schedule are not typed by the admin: they are calculated from real data (see GET /instructors).
    return fields;
};

router.get('/instructors', async (req, res) => {
    const instructors = await Instructor.find().sort({ createdAt: 1 }).lean();
    // Attach the login email of instructors that have an account.
    // trusted(): our own operator, allowed through mongoose's sanitizeFilter.
    const accounts = await User.find({ _id: mongoose.trusted({ $in: instructors.map((i) => i._id) }), role: 'instructor' })
        .select('email')
        .lean();
    const emails = new Map(accounts.map((a) => [String(a._id), a.email]));

    const ids = instructors.map((i) => i._id);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const [attendanceRows, enrollments] = await Promise.all([
        // Real attendance recorded by each instructor: all time and this month.
        Attendance.aggregate([
            { $match: { instructor: mongoose.trusted({ $in: ids }) } },
            {
                $group: {
                    _id: '$instructor',
                    present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
                    absent: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } },
                    monthPresent: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'Present'] }, { $eq: [{ $substrCP: ['$date', 0, 7] }, thisMonth] }] }, 1, 0] } },
                    monthAbsent: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'Absent'] }, { $eq: [{ $substrCP: ['$date', 0, 7] }, thisMonth] }] }, 1, 0] } },
                },
            },
        ]),
        // Their students' class times (set by the instructor or the admin).
        Enrollment.find({ instructor: mongoose.trusted({ $in: ids }) })
            .select('instructor student course scheduleDays scheduleClock scheduleTime')
            .populate('student', 'name')
            .populate('course', 'title')
            .lean(),
    ]);

    const attendanceBy = new Map(attendanceRows.map(({ _id, ...rest }) => [String(_id), rest]));
    const classesBy = new Map();
    for (const e of enrollments) {
        const key = String(e.instructor);
        if (!classesBy.has(key)) classesBy.set(key, []);
        classesBy.get(key).push({
            enrollmentId: e._id,
            student: e.student?.name || '',
            course: e.course?.title || '',
            days: e.scheduleDays || [],
            clock: e.scheduleClock || '',
            text: e.scheduleTime || '',
        });
    }

    res.json(instructors.map((i) => {
        const { schedule: _legacySchedule, attendance: _legacyAttendance, ...profile } = i;
        const classes = classesBy.get(String(i._id)) || [];
        return {
            ...profile,
            email: emails.get(String(i._id)) || '',
            attendanceStats: attendanceBy.get(String(i._id)) || { present: 0, absent: 0, monthPresent: 0, monthAbsent: 0 },
            students: classes,
            weeklyClasses: classes.reduce((sum, c) => sum + c.days.length, 0),
        };
    }));
});

// Creates the instructor's login account and profile together (same _id).
router.post('/instructors', async (req, res) => {
    const body = req.body || {};
    const fields = pickInstructorFields(body);
    const email = normalizeEmail(body.email);

    if (!fields.name || !fields.rank || !fields.salary) {
        return res.status(400).json({ success: false, message: 'Name, rank and salary are required.' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'A valid login email is required for the instructor.' });
    }
    if (!isValidPassword(body.password)) {
        return res.status(400).json({ success: false, message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` });
    }
    if (await User.exists({ email })) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name: fields.name, email, password: body.password, role: 'instructor' });
    try {
        const instructor = await Instructor.create({ _id: user._id, ...fields });
        res.status(201).json({ ...instructor.toObject(), email });
    } catch (err) {
        await User.deleteOne({ _id: user._id });
        throw err;
    }
});

// Everything an admin needs to follow an instructor's work: their students, schedules,
// recorded attendance and class reports (read-only overview).
router.get('/instructors/:id/activity', async (req, res) => {
    if (!isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid ID.' });
    const instructor = await Instructor.findById(req.params.id).select('name rank gender salary createdAt').lean();
    if (!instructor) return res.status(404).json({ success: false, message: 'Instructor not found.' });

    const account = await User.findOne({ _id: instructor._id, role: 'instructor' }).select('email').lean();
    const enrollments = await Enrollment.find({ instructor: instructor._id })
        .select('student course scheduleDays scheduleClock scheduleTime progressPercentage currentAyahOrLesson status paymentStatus enrolledAt')
        .populate('student', 'name')
        .populate('course', 'title')
        .sort({ enrolledAt: 1 })
        .lean();
    const enrollmentIds = enrollments.map((e) => e._id);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const [attendanceRows, reportRows, recentReports, recent30] = await Promise.all([
        Attendance.aggregate([
            { $match: { enrollment: mongoose.trusted({ $in: enrollmentIds }) } },
            {
                $group: {
                    _id: '$enrollment',
                    present: { $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] } },
                    absent: { $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] } },
                    monthPresent: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'Present'] }, { $eq: [{ $substrCP: ['$date', 0, 7] }, thisMonth] }] }, 1, 0] } },
                    monthAbsent: { $sum: { $cond: [{ $and: [{ $eq: ['$status', 'Absent'] }, { $eq: [{ $substrCP: ['$date', 0, 7] }, thisMonth] }] }, 1, 0] } },
                    lastDate: { $max: '$date' },
                },
            },
        ]),
        ClassReport.aggregate([
            { $match: { enrollment: mongoose.trusted({ $in: enrollmentIds }) } },
            {
                $group: {
                    _id: '$enrollment',
                    count: { $sum: 1 },
                    lastDate: { $max: '$date' },
                    memorization: { $avg: '$memorization' },
                    tajweed: { $avg: '$tajweed' },
                },
            },
        ]),
        ClassReport.find({ enrollment: mongoose.trusted({ $in: enrollmentIds }) })
            .select('enrollment date recited homework notes memorization tajweed')
            .sort({ date: -1, updatedAt: -1 })
            .limit(15)
            .lean(),
        Promise.all([
            Attendance.countDocuments({ enrollment: mongoose.trusted({ $in: enrollmentIds }), date: mongoose.trusted({ $gte: since30 }) }),
            ClassReport.countDocuments({ enrollment: mongoose.trusted({ $in: enrollmentIds }), date: mongoose.trusted({ $gte: since30 }) }),
        ]),
    ]);

    const attendanceBy = new Map(attendanceRows.map(({ _id, ...rest }) => [String(_id), rest]));
    const reportsBy = new Map(reportRows.map(({ _id, ...rest }) => [String(_id), rest]));
    const nameBy = new Map(enrollments.map((e) => [String(e._id), e.student?.name || '']));
    const emptyAttendance = { present: 0, absent: 0, monthPresent: 0, monthAbsent: 0, lastDate: null };
    const emptyReports = { count: 0, lastDate: null, memorization: null, tajweed: null };

    const students = enrollments.map((e) => ({
        ...e,
        attendance: attendanceBy.get(String(e._id)) || emptyAttendance,
        reports: reportsBy.get(String(e._id)) || emptyReports,
    }));
    const latest = (key) => students.reduce((max, s) => (s[key].lastDate && (!max || s[key].lastDate > max) ? s[key].lastDate : max), null);

    res.json({
        instructor: { ...instructor, email: account?.email || '' },
        students,
        recentReports: recentReports.map((r) => ({ ...r, studentName: nameBy.get(String(r.enrollment)) || '' })),
        summary: {
            students: students.length,
            weeklyClasses: students.reduce((sum, s) => sum + (s.scheduleDays?.length || 0), 0),
            present: students.reduce((sum, s) => sum + s.attendance.present, 0),
            absent: students.reduce((sum, s) => sum + s.attendance.absent, 0),
            attendanceLast30: recent30[0],
            reportsLast30: recent30[1],
            lastAttendanceDate: latest('attendance'),
            lastReportDate: latest('reports'),
        },
    });
});

// Edit an instructor. Optional login changes: `email` (change it, or create a login for an instructor
// who has none – then `password` is required too) and `password` (reset; signs them out everywhere).
router.put('/instructors/:id', async (req, res) => {
    const body = req.body || {};
    const fields = pickInstructorFields(body);
    if (Object.values(fields).some((v) => v === '')) {
        return res.status(400).json({ success: false, message: 'Fields cannot be empty.' });
    }

    const existing = await Instructor.findById(req.params.id).select('name').lean();
    if (!existing) return res.status(404).json({ success: false, message: 'Instructor not found.' });
    const account = await User.findOne({ _id: existing._id, role: 'instructor' }).select('+password');

    // --- validate login changes before saving anything ---
    const wantsEmail = typeof body.email === 'string' && body.email.trim() !== '';
    const wantsPassword = typeof body.password === 'string' && body.password !== '';
    const email = wantsEmail ? normalizeEmail(body.email) : '';
    if (wantsEmail && !isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'A valid login email is required for the instructor.' });
    }
    if (wantsPassword && !isValidPassword(body.password)) {
        return res.status(400).json({ success: false, message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` });
    }
    if (!account && (wantsEmail || wantsPassword) && !(wantsEmail && wantsPassword)) {
        return res.status(400).json({ success: false, message: 'To create a login, enter both an email and a password.' });
    }
    if (wantsEmail && (!account || email !== account.email)
        && await User.exists({ email, _id: mongoose.trusted({ $ne: existing._id }) })) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const instructor = await Instructor.findByIdAndUpdate(existing._id, fields, { new: true, runValidators: true }).lean();
    const name = fields.name || instructor.name;

    let loginEmail = account?.email || '';
    if (account) {
        account.name = name;
        if (wantsEmail) account.email = email;
        if (wantsPassword) account.password = body.password; // hashed by the model; old sessions stop working
        await account.save();
        loginEmail = account.email;
    } else if (wantsEmail && wantsPassword) {
        await User.create({ _id: existing._id, name, email, password: body.password, role: 'instructor' });
        loginEmail = email;
    }
    res.json({ ...instructor, email: loginEmail });
});

router.delete('/instructors/:id', async (req, res) => {
    const instructor = await Instructor.findByIdAndDelete(req.params.id);
    if (!instructor) return res.status(404).json({ success: false, message: 'Instructor not found.' });

    // Remove their login and unassign their students.
    await User.deleteOne({ _id: instructor._id, role: 'instructor' });
    await Enrollment.updateMany({ instructor: instructor._id }, { instructor: null });
    res.json({ success: true, message: 'Instructor deleted successfully.' });
});

// ---------------------------------------------------------------------------
// Dashboard & enrollments
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Website content pages (About, Terms, Privacy, Refund)
// ---------------------------------------------------------------------------

const MAX_SECTIONS = 20;

/** Cleans one language's content. Returns { value } or { error }. Text is shown as plain text (never HTML). */
const cleanPageLanguage = (raw) => {
    if (!raw || typeof raw !== 'object') return { error: 'Page content is missing.' };
    const title = cleanText(raw.title, 150);
    if (!title) return { error: 'Each language needs a page title.' };
    const intro = cleanText(raw.intro, 1000);

    const rawSections = Array.isArray(raw.sections) ? raw.sections : [];
    if (rawSections.length > MAX_SECTIONS) return { error: `A page can have at most ${MAX_SECTIONS} sections.` };
    const sections = [];
    for (const s of rawSections) {
        const heading = cleanText(s?.heading, 150);
        const text = cleanText(s?.text, 5000);
        if (!heading || !text) return { error: 'Every section needs a heading and text.' };
        const image = typeof s?.image === 'string' ? s.image.trim() : '';
        if (image && (image.length > 500 || !isHttpUrl(image))) return { error: 'Invalid image link.' };
        sections.push(image ? { heading, text, image } : { heading, text });
    }
    return { value: { title, intro, sections } };
};

// Uploads one image for the website content (e.g. a Stars of Tarteel photo) and returns its link.
router.post('/uploads/image', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please choose an image.' });
    res.status(201).json({ url: fileUrl(req, req.file) });
});

router.get('/pages/:slug', async (req, res) => {
    if (!PAGE_SLUGS.includes(req.params.slug)) return res.status(404).json({ success: false, message: 'Not found.' });
    const page = await Page.findOne({ slug: req.params.slug }).lean();
    if (!page) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json(page);
});

router.put('/pages/:slug', async (req, res) => {
    const { slug } = req.params;
    if (!PAGE_SLUGS.includes(slug)) return res.status(404).json({ success: false, message: 'Not found.' });

    const en = cleanPageLanguage(req.body?.en);
    const ar = cleanPageLanguage(req.body?.ar);
    const error = en.error || ar.error;
    if (error) return res.status(400).json({ success: false, message: error });

    const page = await Page.findOneAndUpdate(
        { slug },
        { slug, en: en.value, ar: ar.value },
        { upsert: true, new: true, runValidators: true }
    ).lean();
    res.json(page);
});

// ---------------------------------------------------------------------------
// Instructor payout requests
// ---------------------------------------------------------------------------

router.get('/payouts', async (req, res) => {
    const payouts = await Payout.find().sort({ createdAt: -1 }).populate('instructor', 'name rank').lean();
    res.json(payouts);
});

// Approve (Paid) or reject a pending request.
router.put('/payouts/:id', async (req, res) => {
    const { status } = req.body || {};
    if (!['Paid', 'Rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid payout status.' });
    }

    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ success: false, message: 'Payout request not found.' });
    if (payout.status !== 'Pending') {
        return res.status(409).json({ success: false, message: 'This request has already been processed.' });
    }

    payout.status = status;
    payout.processedAt = new Date();
    await payout.save();
    await notify(payout.instructor, status === 'Paid' ? 'payoutPaid' : 'payoutRejected', { amount: payout.amount }, '/instructor?tab=wallet');
    res.json(await Payout.findById(payout._id).populate('instructor', 'name rank'));
});

router.get('/stats', async (req, res) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = now.toISOString().slice(0, 7);

    const [
        totalCourses, totalInstructors, totalStudents, newStudents,
        enrollments, monthAttendance, pendingPayouts,
    ] = await Promise.all([
        Course.countDocuments(),
        Instructor.countDocuments(),
        User.countDocuments({ role: 'student' }),
        User.countDocuments({ role: 'student', createdAt: mongoose.trusted({ $gte: monthStart }) }),
        Enrollment.find().select('paymentStatus instructor scheduleDays scheduleTime enrolledAt course').populate('course', 'price').lean(),
        Attendance.find({ date: mongoose.trusted({ $regex: `^${thisMonth}-` }) }).select('status').lean(),
        Payout.find({ status: 'Pending' }).select('amount').lean(),
    ]);

    const priceOf = (e) => Number(String(e.course?.price ?? '').replace(/[^0-9.]/g, '')) || 0;
    const paid = enrollments.filter((e) => e.paymentStatus === 'Paid');
    const present = monthAttendance.filter((a) => a.status === 'Present').length;
    const absent = monthAttendance.length - present;

    res.json({
        // Kept for older clients.
        totalCourses, totalInstructors, totalStudents,
        newStudentsThisMonth: newStudents,
        enrollments: {
            total: enrollments.length,
            active: paid.length,
        },
        // Approximate: course price of paid enrollments that started this month.
        revenueThisMonth: paid.filter((e) => e.enrolledAt >= monthStart).reduce((sum, e) => sum + priceOf(e), 0),
        revenueTotal: paid.reduce((sum, e) => sum + priceOf(e), 0),
        attendanceThisMonth: { present, absent, rate: monthAttendance.length ? Math.round((present / monthAttendance.length) * 100) : null },
        // Things waiting for the admin.
        needsAttention: {
            pendingPayments: enrollments.filter((e) => e.paymentStatus === 'Pending').length,
            unassigned: enrollments.filter((e) => !e.instructor && e.paymentStatus !== 'Failed').length,
            noSchedule: enrollments.filter((e) => e.instructor && !(e.scheduleDays?.length) && !e.scheduleTime).length,
            pendingPayouts: pendingPayouts.length,
            pendingPayoutsAmount: pendingPayouts.reduce((sum, p) => sum + (Number(String(p.amount).replace(/[^0-9.]/g, '')) || 0), 0),
        },
    });
});

const populateEnrollment = (query) =>
    query.populate('student', 'name email').populate('course', 'title').populate('instructor', 'name');

router.get('/enrollments', async (req, res) => {
    res.json(await populateEnrollment(Enrollment.find().sort({ enrolledAt: -1 })));
});

router.put('/enrollments/:id', async (req, res) => {
    const { paymentStatus, instructor, scheduleTime, zoomLink } = req.body || {};
    const update = {};

    if (paymentStatus !== undefined) {
        if (!Enrollment.schema.path('paymentStatus').enumValues.includes(paymentStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid payment status.' });
        }
        update.paymentStatus = paymentStatus;
    }

    if (instructor !== undefined) {
        if (instructor === null || instructor === '') {
            update.instructor = null;
        } else if (!isValidObjectId(instructor) || !(await Instructor.exists({ _id: instructor }))) {
            return res.status(400).json({ success: false, message: 'Instructor not found.' });
        } else {
            update.instructor = instructor;
        }
    }


    if (zoomLink !== undefined) {
        const link = cleanText(zoomLink, 500);
        if (link && !isHttpUrl(link)) {
            return res.status(400).json({ success: false, message: 'The class link must start with https://' });
        }
        update.zoomLink = link;
    }

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found.' });

    enrollment.set(update);
    // Typing a new free-text time replaces the instructor's day/time schedule.
    if (scheduleTime !== undefined) {
        const text = cleanText(scheduleTime, 100);
        if (text !== enrollment.scheduleTime) {
            enrollment.scheduleTime = text;
            enrollment.scheduleDays = [];
            enrollment.scheduleClock = '';
        }
    }
    const becamePaid = update.paymentStatus === 'Paid' && enrollment.isModified('paymentStatus');
    const newInstructor = update.instructor && enrollment.isModified('instructor') ? update.instructor : null;
    // A confirmed payment activates the enrollment.
    if (update.paymentStatus === 'Paid' && enrollment.status === 'Pending') enrollment.status = 'Active';
    await enrollment.save();

    const full = await populateEnrollment(Enrollment.findById(enrollment._id));
    const data = { student: full.student?.name, course: full.course?.title, instructor: full.instructor?.name };
    if (becamePaid) await notify(enrollment.student, 'paymentApproved', data, '/dashboard/courses');
    if (newInstructor) {
        await notify(enrollment.student, 'instructorAssigned', data, '/dashboard/courses');
        await notify(newInstructor, 'newStudent', data, '/instructor?tab=students');
    }
    res.json(full);
});

router.delete('/enrollments/:id', async (req, res) => {
    const deleted = await Enrollment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Enrollment not found.' });
    await Attendance.deleteMany({ enrollment: deleted._id });
    await ClassReport.deleteMany({ enrollment: deleted._id });
    res.json({ success: true, message: 'Enrollment deleted successfully.' });
});

// ---------------------------------------------------------------------------
// Students (search, edit, suspend)
// ---------------------------------------------------------------------------

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\export default router;');
const STUDENT_FIELDS = 'name email phone active createdAt';

// All students with their number of courses and payment summary. ?q= searches name / email / phone.
router.get('/students', async (req, res) => {
    const q = cleanText(req.query.q, 100);
    const filter = { role: 'student' };
    if (q) {
        const re = new RegExp(escapeRegex(q), 'i');
        filter.$or = mongoose.trusted([{ name: re }, { email: re }, { phone: re }]);
    }
    const [students, rows] = await Promise.all([
        User.find(filter).select(STUDENT_FIELDS).sort({ createdAt: -1 }).limit(1000).lean(),
        Enrollment.aggregate([
            {
                $group: {
                    _id: '$student',
                    courses: { $sum: 1 },
                    paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'Pending'] }, 1, 0] } },
                    whatsapp: { $last: '$whatsapp' },
                },
            },
        ]),
    ]);
    const statsBy = new Map(rows.map(({ _id, ...rest }) => [String(_id), rest]));
    res.json(students.map((s) => {
        const st = statsBy.get(String(s._id)) || { courses: 0, paid: 0, pending: 0, whatsapp: '' };
        return { ...s, active: s.active !== false, phone: s.phone || st.whatsapp || '', stats: { courses: st.courses, paid: st.paid, pending: st.pending } };
    }));
});

// One student: profile, courses (with instructor and schedule) and attendance totals.
router.get('/students/:id', async (req, res) => {
    const student = await User.findOne({ _id: req.params.id, role: 'student' }).select(STUDENT_FIELDS).lean();
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    const enrollments = await Enrollment.find({ student: student._id })
        .populate('course', 'title')
        .populate('instructor', 'name')
        .select('course instructor paymentStatus paymentMethod status enrolledAt scheduleDays scheduleClock scheduleTime whatsapp studentAge level')
        .sort({ enrolledAt: -1 })
        .lean();
    const attendance = await Attendance.aggregate([
        { $match: { enrollment: { $in: enrollments.map((e) => e._id) } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const att = Object.fromEntries(attendance.map((a) => [a._id, a.count]));
    res.json({
        ...student,
        active: student.active !== false,
        phone: student.phone || enrollments.find((e) => e.whatsapp)?.whatsapp || '',
        enrollments,
        attendance: { present: att.Present || 0, absent: att.Absent || 0 },
    });
});

// Edit name / email / phone, suspend or re-activate, or set a new password.
router.put('/students/:id', async (req, res) => {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    const body = req.body || {};

    if (body.name !== undefined) {
        const name = cleanText(body.name, 100);
        if (!name) return res.status(400).json({ success: false, message: 'Please enter the name.' });
        student.name = name;
    }
    if (body.email !== undefined) {
        const email = normalizeEmail(body.email);
        if (!isValidEmail(email)) return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
        if (email !== student.email && (await User.exists({ email }))) {
            return res.status(409).json({ success: false, message: 'This email is already used by another account.' });
        }
        student.email = email;
    }
    if (body.phone !== undefined) {
        const phone = cleanText(body.phone, 30);
        if (phone && !/^\+?[0-9][0-9\s-]{5,24}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
        }
        student.phone = phone;
    }
    if (body.active !== undefined) student.active = Boolean(body.active);
    if (body.password) {
        if (!isValidPassword(body.password)) {
            return res.status(400).json({ success: false, message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` });
        }
        student.password = body.password; // hashed on save; signs the student out everywhere
    }
    await student.save();
    const { _id, name, email, phone, active, createdAt } = student;
    res.json({ _id, name, email, phone, active: active !== false, createdAt });
});

// ---------------------------------------------------------------------------
// Consultation / free trial requests
// ---------------------------------------------------------------------------

router.get('/consultations', async (req, res) => {
    res.json(await Consultation.find().sort({ createdAt: -1 }).limit(1000).lean());
});

router.put('/consultations/:id', async (req, res) => {
    const body = req.body || {};
    const update = {};
    if (body.status !== undefined) {
        if (!CONSULTATION_STATUSES.includes(body.status)) {
            return res.status(400).json({ success: false, message: 'Invalid status.' });
        }
        update.status = body.status;
    }
    if (body.notes !== undefined) update.notes = cleanText(body.notes, 1000);
    const item = await Consultation.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).lean();
    if (!item) return res.status(404).json({ success: false, message: 'Request not found.' });
    res.json(item);
});

router.delete('/consultations/:id', async (req, res) => {
    const item = await Consultation.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Request not found.' });
    res.json({ success: true });
});

// ---------------------------------------------------------------------------
// Site settings (contact numbers, payment accounts, social links)
// ---------------------------------------------------------------------------

router.get('/settings', async (req, res) => {
    res.json(await Setting.getSite());
});

router.put('/settings', async (req, res) => {
    const body = req.body || {};
    const update = { updatedAt: new Date() };
    for (const [field, max] of Object.entries(SETTING_FIELDS)) {
        if (body[field] === undefined) continue;
        const value = cleanText(body[field], max);
        if (value && SOCIAL_FIELDS.includes(field) && !isHttpUrl(value)) {
            return res.status(400).json({ success: false, message: 'Social media links must start with https://' });
        }
        if (value && field === 'email' && !isValidEmail(value.toLowerCase())) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
        }
        if (value && ['whatsapp', 'phone', 'vodafoneCash'].includes(field) && !/^\+?[0-9][0-9\s-]{5,24}$/.test(value)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
        }
        update[field] = field === 'email' ? value.toLowerCase() : value;
    }
    await Setting.findOneAndUpdate({ key: 'site' }, { $set: update }, { upsert: true, runValidators: true });
    res.json(await Setting.getSite());
});

export default router;
