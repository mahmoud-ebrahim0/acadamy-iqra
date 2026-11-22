import mongoose from 'mongoose';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const PASSWORD_MIN_LENGTH = 8;

export const isValidObjectId = (id) => typeof id === 'string' && mongoose.isValidObjectId(id) && /^[a-f\d]{24}$/i.test(id);

/** Returns a trimmed string capped at `max` characters, or '' for non-strings. */
export const cleanText = (value, max = 200) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

export const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

export const isValidEmail = (email) => typeof email === 'string' && email.length <= 254 && EMAIL_RE.test(email);

export const isValidPassword = (password) =>
    typeof password === 'string' && password.length >= PASSWORD_MIN_LENGTH && password.length <= 128;

/** Parses a price such as "50" or "49.99". Returns a non-negative number or null. */
export const parsePrice = (value) => {
    const str = String(value ?? '').trim();
    if (!/^\d+(\.\d{1,2})?$/.test(str)) return null;
    return Number(str);
};

export const isHttpUrl = (value) => {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
        return false;
    }
};

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);

/** Express `router.param` handler that rejects malformed ObjectIds with a 400. */
export const validateIdParam = (req, res, next, id) => {
    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID.' });
    }
    next();
};
