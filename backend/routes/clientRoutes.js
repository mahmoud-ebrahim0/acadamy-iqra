import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Attendance from '../models/Attendance.js';
import Page, { PAGE_SLUGS } from '../models/Page.js';
import { isMailConfigured, sendMail } from '../utils/mailer.js';
import { isProduction } from '../config/env.js';
import Instructor from '../models/Instructor.js';
import User from '../models/User.js';
import Enrollment, { PAYMENT_METHODS, STUDENT_LEVELS } from '../models/Enrollment.js';
import { upload, fileUrl, discardUpload } from '../config/cloudinary.js';
import { stripe } from '../config/stripe.js';
import { FRONTEND_URL } from '../config/env.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { authLimiter, checkoutLimiter, formLimiter } from '../middleware/rateLimit.js';
import { authResponse } from '../utils/token.js';
import {
    cleanText,
    escapeHtml,
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

const PASSWORD_RULE = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;

// ---------------------------------------------------------------------------
// Public catalogue
// ---------------------------------------------------------------------------

// Only courses the admin has not hidden. (`$ne: false` also includes older courses without the field.)
const PUBLISHED = { published: mongoose.trusted({ $ne: false }) };

router.get('/courses', async (req, res) => {
    const courses = await Course.find(PUBLISHED).sort({ createdAt: 1 }).lean();
    res.json(courses);
});

router.get('/courses/:id', async (req, res) => {
    const course = await Course.findOne({ _id: req.params.id, ...PUBLISHED }).lean();
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json(course);
});

// Only public profile fields – salary / attendance are internal data.
router.get('/instructors', async (req, res) => {
    const instructors = await Instructor.find().select('name rank gender photoUrl bioAr bioEn').sort({ createdAt: 1 }).lean();
    res.json(instructors);
});

// Footer content pages edited by the admin. 404 means "not edited yet" (the website then shows its default text).
router.get('/pages/:slug', async (req, res) => {
    if (!PAGE_SLUGS.includes(req.params.slug)) {
        return res.status(404).json({ success: false, message: 'Not found.' });
    }
    const page = await Page.findOne({ slug: req.params.slug }).select('slug en ar updatedAt').lean();
    if (!page) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json(page);
});

// Live numbers for the home page, counted from the database.
router.get('/stats', async (req, res) => {
    const [students, instructors, courses, classesAttended] = await Promise.all([
        User.countDocuments({ role: 'student' }),
        Instructor.countDocuments(),
        Course.countDocuments(PUBLISHED),
        Attendance.countDocuments({ status: 'Present' }),
    ]);
    res.set('Cache-Control', 'public, max-age=300');
    res.json({ students, instructors, courses, classesAttended });
});

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

// Everyone who signs up from the website is a student.
// Admins are created with `npm run create-admin`, instructors by an admin.
router.post('/register', authLimiter, async (req, res) => {
    const body = req.body || {};
    const name = cleanText(body.name, 100);
    const email = normalizeEmail(body.email);
    const { password } = body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide your name, email and password.' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }
    if (!isValidPassword(password)) {
        return res.status(400).json({ success: false, message: PASSWORD_RULE });
    }

    if (await User.exists({ email })) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }

    const user = await User.create({ name, email, password, role: 'student' });
    res.status(201).json(authResponse(user));
});

router.post('/login', authLimiter, async (req, res) => {
    const body = req.body || {};
    const email = normalizeEmail(body.email);

    if (!email || typeof body.password !== 'string') {
        return res.status(400).json({ success: false, message: 'Please provide your email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(body.password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    res.json(authResponse(user));
});

// ---------------------------------------------------------------------------
// Forgot / reset password
// ---------------------------------------------------------------------------

const RESET_TOKEN_MINUTES = 60;
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const FORGOT_REPLY = 'If an account exists for this email, we have sent a link to reset the password.';

// Always gives the same answer, so nobody can find out which emails have accounts.
router.post('/forgot-password', formLimiter, async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const user = await User.findOne({ email });
    if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordTokenHash = hashToken(token);
        user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_MINUTES * 60 * 1000);
        await user.save();

        const link = `${FRONTEND_URL}/reset-password?token=${token}`;
        if (isMailConfigured()) {
            try {
                await sendMail({
                    to: user.email,
                    subject: 'Reset your password - Tarteel Academy / إعادة تعيين كلمة المرور',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
                            <h2 style="color: #7A1B29;">Tarteel Academy</h2>
                            <p>Hello ${escapeHtml(user.name)},</p>
                            <p>We received a request to reset your password. Click the button below to choose a new one. The link expires in ${RESET_TOKEN_MINUTES} minutes.</p>
                            <p dir="rtl" style="text-align: right;">وصلنا طلب لإعادة تعيين كلمة المرور الخاصة بك. اضغط على الزر لاختيار كلمة مرور جديدة، وتنتهي صلاحية الرابط خلال ${RESET_TOKEN_MINUTES} دقيقة.</p>
                            <p style="text-align: center; margin: 28px 0;">
                                <a href="${link}" style="background: #7A1B29; color: #fff; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-weight: bold;">Reset Password / إعادة التعيين</a>
                            </p>
                            <p style="color: #777; font-size: 13px;">If you did not request this, you can ignore this email. / إذا لم تطلب ذلك فتجاهل هذه الرسالة.</p>
                        </div>`,
                });
            } catch (err) {
                console.error('Password reset email failed:', err.message);
            }
        } else if (!isProduction) {
            // Local development without email settings: print the link so the flow can be tested.
            console.log(`[dev] Password reset link for ${user.email}: ${link}`);
        } else {
            console.error('Password reset requested but email is not configured (EMAIL_USER / EMAIL_PASS).');
        }
    }

    res.json({ success: true, message: FORGOT_REPLY });
});

router.post('/reset-password', authLimiter, async (req, res) => {
    const { token, password } = req.body || {};
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
        return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired.' });
    }
    if (!isValidPassword(password)) {
        return res.status(400).json({ success: false, message: PASSWORD_RULE });
    }

    const user = await User.findOne({
        resetPasswordTokenHash: hashToken(token),
        resetPasswordExpires: mongoose.trusted({ $gt: new Date() }),
    }).select('+resetPasswordTokenHash +resetPasswordExpires');
    if (!user) {
        return res.status(400).json({ success: false, message: 'This reset link is invalid or has expired.' });
    }

    // Saving the new password also signs out every existing session.
    user.password = password;
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json(authResponse(user));
});

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

/**
 * Finds the student making the purchase:
 *  - logged-in user (valid token)        -> that user
 *  - email already registered            -> only with the correct password
 *  - new email                           -> creates a student account
 * Returns { user } or { status, message } on failure.
 */
const resolveCheckoutUser = async (req, body) => {
    if (req.user) return { user: req.user };

    const email = normalizeEmail(body.email);
    if (!isValidEmail(email)) return { status: 400, message: 'Please enter a valid email address.' };
    if (typeof body.password !== 'string' || !body.password) return { status: 400, message: 'Please enter a password.' };

    const existing = await User.findOne({ email }).select('+password');
    if (existing) {
        if (!(await existing.matchPassword(body.password))) {
            return {
                status: 401,
                message: 'An account with this email already exists. Please log in first, or enter the correct password for this account.',
            };
        }
        return { user: existing };
    }

    const name = cleanText(body.name, 100);
    if (!name) return { status: 400, message: 'Please enter your full name.' };
    if (!isValidPassword(body.password)) return { status: 400, message: PASSWORD_RULE };

    const user = await User.create({ name, email, password: body.password, role: 'student' });
    return { user };
};

router.post('/checkout', checkoutLimiter, optionalAuth, upload.single('screenshot'), async (req, res) => {
    const body = req.body || {};
    const fail = (status, message) => {
        discardUpload(req.file);
        return res.status(status).json({ success: false, message });
    };

    const { courseId, paymentMethod } = body;
    if (!isValidObjectId(courseId)) return fail(400, 'Invalid course.');
    if (!PAYMENT_METHODS.includes(paymentMethod)) return fail(400, 'Please choose a valid payment method.');

    const course = await Course.findOne({ _id: courseId, ...PUBLISHED });
    if (!course) return fail(404, 'Course not found.');

    const price = parsePrice(course.price);
    if (price === null) return fail(500, 'This course has an invalid price. Please contact the academy.');

    const isFree = price === 0;
    const isCard = paymentMethod === 'Credit Card' && !isFree;
    if (!isFree && !isCard && !req.file) return fail(400, 'Please upload a screenshot of your transfer.');
    if (isCard && !stripe) return fail(503, 'Card payments are not available right now. Please choose another payment method.');

    const result = await resolveCheckoutUser(req, body);
    if (!result.user) return fail(result.status, result.message);
    const { user } = result;

    if (user.role !== 'student') return fail(403, 'Only student accounts can enroll in courses.');

    // An unfinished card payment for the same course is replaced; anything else is a duplicate.
    await Enrollment.deleteMany({
        student: user._id,
        course: course._id,
        paymentMethod: 'Credit Card',
        paymentStatus: mongoose.trusted({ $in: ['Pending', 'Failed'] }),
    });
    const duplicate = await Enrollment.exists({
        student: user._id,
        course: course._id,
        paymentStatus: mongoose.trusted({ $in: ['Paid', 'Pending'] }),
    });
    if (duplicate) return fail(409, 'You are already enrolled in this course. Check your dashboard.');

    const age = Number.parseInt(body.age, 10);
    const enrollment = new Enrollment({
        student: user._id,
        course: course._id,
        instructor: null,
        status: isFree ? 'Active' : 'Pending',
        paymentStatus: isFree ? 'Paid' : 'Pending',
        paymentMethod,
        receiptUrl: isFree || isCard ? '' : fileUrl(req, req.file),
        whatsapp: cleanText(body.whatsapp, 30),
        studentAge: age >= 3 && age <= 120 ? age : undefined,
        level: STUDENT_LEVELS.includes(body.level) ? body.level : '',
    });
    if (isFree || isCard) discardUpload(req.file);
    await enrollment.save();

    if (!isCard) {
        return res.status(201).json(authResponse(user));
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            customer_email: user.email,
            client_reference_id: String(enrollment._id),
            metadata: { enrollmentId: String(enrollment._id) },
            success_url: `${FRONTEND_URL}/dashboard?payment=success`,
            cancel_url: `${FRONTEND_URL}/checkout/${course._id}?payment=cancelled`,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: { name: course.title },
                        unit_amount: Math.round(price * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
        });
        enrollment.stripeSessionId = session.id;
        await enrollment.save();
        res.status(200).json({ ...authResponse(user), url: session.url });
    } catch (err) {
        await Enrollment.deleteOne({ _id: enrollment._id });
        console.error('Stripe session error:', err.message);
        res.status(502).json({ success: false, message: 'Could not start the card payment. Please try again later.' });
    }
});

// ---------------------------------------------------------------------------
// Free consultation request (emails the admin)
// ---------------------------------------------------------------------------

router.post('/consultation', formLimiter, async (req, res) => {
    const body = req.body || {};
    const name = cleanText(body.name, 100);
    const whatsapp = cleanText(body.whatsapp, 30);
    const age = Number.parseInt(body.age, 10);

    if (!name || !whatsapp || !body.age) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!(age >= 3 && age <= 120)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid age.' });
    }
    if (!/^[+\d][\d\s()-]{6,}$/.test(whatsapp)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid WhatsApp number.' });
    }

    const { ADMIN_EMAIL } = process.env;
    if (!isMailConfigured() || !ADMIN_EMAIL) {
        console.error('Consultation email is not configured (EMAIL_USER / EMAIL_PASS / ADMIN_EMAIL).');
        return res.status(503).json({ success: false, message: 'This service is temporarily unavailable. Please contact us on WhatsApp.' });
    }

    const safeName = escapeHtml(name);
    const safeWhatsapp = escapeHtml(whatsapp);
    const waDigits = whatsapp.replace(/\D/g, '');

    try {
        await sendMail({
            to: ADMIN_EMAIL,
            subject: `New Free Trial Request - ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: auto;">
                    <h2 style="color: #b45309; text-align: center;">New Free Consultation Request</h2>
                    <p style="font-size: 16px;">You have received a new free trial evaluation request from the website.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd; color: #333;">Student Name:</th>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${safeName}</td>
                        </tr>
                        <tr>
                            <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd; color: #333;">Student Age:</th>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${age} Years</td>
                        </tr>
                        <tr>
                            <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd; color: #333;">WhatsApp:</th>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                <a href="https://wa.me/${waDigits}" style="color: #25D366; font-weight: bold; text-decoration: none;">
                                    ${safeWhatsapp} (Click to Chat)
                                </a>
                            </td>
                        </tr>
                    </table>
                    <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #777;">Tarteel Academy System</p>
                </div>
            `,
        });

        res.status(200).json({ success: true, message: 'Consultation request sent successfully.' });
    } catch (err) {
        console.error('Email sending error:', err.message);
        res.status(502).json({ success: false, message: 'We could not send your request right now. Please try again or contact us on WhatsApp.' });
    }
});

export default router;
