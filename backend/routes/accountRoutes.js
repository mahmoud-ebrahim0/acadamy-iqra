import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { authResponse } from '../utils/token.js';
import { cleanText, isValidEmail, isValidPassword, normalizeEmail, PASSWORD_MIN_LENGTH } from '../utils/validation.js';

// Settings every logged-in user (student, instructor, admin) can change for themselves.
const router = express.Router();
router.use(protect);

const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{5,24}$/;

const profileOf = async (user) => {
    let phone = user.phone || '';
    // Students who haven't saved a number yet: use the WhatsApp number from their latest enrollment.
    if (!phone && user.role === 'student') {
        const latest = await Enrollment.findOne({ student: user._id, whatsapp: mongoose.trusted({ $ne: '' }) }).sort({ enrolledAt: -1 }).select('whatsapp').lean();
        phone = latest?.whatsapp || '';
    }
    return { _id: user._id, name: user.name, email: user.email, phone, role: user.role, createdAt: user.createdAt };
};

// The logged-in user's own profile.
router.get('/me', async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json(await profileOf(user));
});

// Update name / phone. Changing the email also requires the current password.
router.put('/profile', authLimiter, async (req, res) => {
    const { name, phone, email, currentPassword } = req.body || {};
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'Not found.' });

    const cleanName = cleanText(name, 100);
    if (!cleanName || cleanName.length < 2) return res.status(400).json({ success: false, message: 'Please enter your name.' });

    const cleanPhone = cleanText(phone, 30);
    if (cleanPhone && !PHONE_PATTERN.test(cleanPhone)) return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });

    const newEmail = normalizeEmail(email ?? user.email);
    if (newEmail !== user.email) {
        if (!isValidEmail(newEmail)) return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
        // 400 (not 401): a wrong password must not log the user out of the website.
        if (!(await user.matchPassword(currentPassword))) {
            return res.status(400).json({ success: false, message: 'Enter your current password to change your email.' });
        }
        if (await User.exists({ email: newEmail, _id: mongoose.trusted({ $ne: user._id }) })) {
            return res.status(409).json({ success: false, message: 'This email is already used by another account.' });
        }
        user.email = newEmail;
    }

    user.name = cleanName;
    user.phone = cleanPhone;
    await user.save();
    res.json({ ...(await profileOf(user)), message: 'Profile saved.' });
});

// Change password. Requires the current password; signs out other sessions and returns a fresh token.
router.put('/password', authLimiter, async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please enter your current and new password.' });
    }
    if (!isValidPassword(newPassword)) {
        return res.status(400).json({ success: false, message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.` });
    }

    const user = await User.findById(req.user._id).select('+password');
    // 400 (not 401): a wrong current password must not log the user out of the website.
    if (!user || !(await user.matchPassword(currentPassword))) {
        return res.status(400).json({ success: false, message: 'Your current password is incorrect.' });
    }
    if (await user.matchPassword(newPassword)) {
        return res.status(400).json({ success: false, message: 'The new password must be different from the current one.' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ ...authResponse(user), message: 'Password changed successfully.' });
});

export default router;
