import rateLimit from 'express-rate-limit';

const limiter = (windowMinutes, limit, message, extra = {}) =>
    rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        limit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { success: false, message },
        ...extra,
    });

// Login / registration: slows down password guessing. Only failed attempts count,
// so many students on the same network (school, family) are not blocked.
export const authLimiter = limiter(15, 10, 'Too many failed attempts. Please wait 15 minutes and try again.', {
    skipSuccessfulRequests: true,
});

export const checkoutLimiter = limiter(15, 10, 'Too many enrollment attempts. Please wait a few minutes and try again.');

// Public contact form: prevents the admin inbox from being flooded.
export const formLimiter = limiter(60, 5, 'Too many requests. Please try again later.');
