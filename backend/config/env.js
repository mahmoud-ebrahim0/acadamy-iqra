import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ quiet: true });

export const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

// ---- JWT secret -----------------------------------------------------------
// Never fall back to a hard-coded secret: anyone who knows it can forge tokens.
let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
    if (isProduction) {
        throw new Error('JWT_SECRET must be set to a random string of at least 32 characters in production.');
    }
    if (!jwtSecret) {
        jwtSecret = crypto.randomBytes(48).toString('hex');
        console.warn('[security] JWT_SECRET is not set. Using a random temporary secret – everyone is logged out on each restart.');
    } else {
        console.warn('[security] JWT_SECRET is shorter than 32 characters. Use a longer random value.');
    }
}
export const JWT_SECRET = jwtSecret;

// ---- URLs / CORS ------------------------------------------------------------
const stripSlash = (url) => url.replace(/\/+$/, '');

export const FRONTEND_URL = stripSlash(process.env.FRONTEND_URL || 'http://localhost:5173');

const devOrigins = isProduction ? [] : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173'];
const extraOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => stripSlash(o.trim()))
    .filter(Boolean);

export const allowedOrigins = [...new Set([FRONTEND_URL, ...extraOrigins, ...devOrigins])];
