import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../config/env.js';

const readBearerToken = (req) => {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    return scheme === 'Bearer' && token ? token : null;
};

const loadUserFromToken = async (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        // Tokens from before a password change are no longer valid.
        if (!user || user.tokenIssuedBeforePasswordChange(decoded.iat)) return null;
        return user;
    } catch {
        return null;
    }
};

/** Requires a valid token. The user is always re-loaded from the DB so roles cannot be forged. */
export const protect = async (req, res, next) => {
    const token = readBearerToken(req);
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, please log in.' });
    }
    const user = await loadUserFromToken(token);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Your session has expired, please log in again.' });
    }
    req.user = user;
    next();
};

/** Attaches req.user when a valid token is sent, but never blocks the request. */
export const optionalAuth = async (req, res, next) => {
    const token = readBearerToken(req);
    if (token) {
        const user = await loadUserFromToken(token);
        if (user) req.user = user;
    }
    next();
};

export const authorize = (...roles) => (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) return next();
    res.status(403).json({ success: false, message: 'You do not have permission to do this.' });
};

export const adminOnly = authorize('admin');
export const instructorOnly = authorize('instructor', 'admin');
