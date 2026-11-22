import express from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Instructor from '../models/Instructor.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Attendance from '../models/Attendance.js';
import Payout from '../models/Payout.js';
import Page, { PAGE_SLUGS } from '../models/Page.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { upload, fileUrl, discardUpload } from '../config/cloudinary.js';
import { authResponse } from '../utils/token.js';
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

router.get('/courses', async (req, res) => {
    res.json(await Course.find().sort({ createdAt: 1 }));
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
    if (body.schedule !== undefined) fields.schedule = cleanText(body.schedule, 200);
    if (body.salary !== undefined) fields.salary = cleanText(body.salary, 50);
    if (body.gender === 'male' || body.gender === 'female') fields.gender = body.gender;
    if (body.attendance !== undefined) {
        const attendance = Number(body.attendance);
        if (Number.isFinite(attendance)) fields.attendance = Math.min(100, Math.max(0, attendance));
    }
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
    res.json(instructors.map((i) => ({ ...i, email: emails.get(String(i._id)) || '' })));
});

// Creates the instructor's login account and profile together (same _id).
router.post('/instructors', async (req, res) => {
    const body = req.body || {};
    const fields = pickInstructorFields(body);
    const email = normalizeEmail(body.email);

    if (!fields.name || !fields.rank || !fields.schedule || !fields.salary) {
        return res.status(400).json({ success: false, message: 'Name, rank, schedule and salary are required.' });
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

router.put('/instructors/:id', async (req, res) => {
    const fields = pickInstructorFields(req.body || {});
    if (Object.values(fields).some((v) => v === '')) {
        return res.status(400).json({ success: false, message: 'Fields cannot be empty.' });
    }

    const instructor = await Instructor.findByIdAndUpdate(req.params.id, fields, { new: true, runValidators: true });
    if (!instructor) return res.status(404).json({ success: false, message: 'Instructor not found.' });

    if (fields.name) {
        await User.updateOne({ _id: instructor._id, role: 'instructor' }, { name: fields.name });
    }
    res.json(instructor);
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
    res.json(await Payout.findById(payout._id).populate('instructor', 'name rank'));
});

router.get('/stats', async (req, res) => {
    const [totalCourses, totalInstructors, totalStudents] = await Promise.all([
        Course.countDocuments(),
        Instructor.countDocuments(),
        User.countDocuments({ role: 'student' }),
    ]);
    res.json({ totalCourses, totalInstructors, totalStudents });
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

    if (scheduleTime !== undefined) update.scheduleTime = cleanText(scheduleTime, 100);

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
    // A confirmed payment activates the enrollment.
    if (update.paymentStatus === 'Paid' && enrollment.status === 'Pending') enrollment.status = 'Active';
    await enrollment.save();

    res.json(await populateEnrollment(Enrollment.findById(enrollment._id)));
});

router.delete('/enrollments/:id', async (req, res) => {
    const deleted = await Enrollment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Enrollment not found.' });
    await Attendance.deleteMany({ enrollment: deleted._id });
    res.json({ success: true, message: 'Enrollment deleted successfully.' });
});

export default router;
