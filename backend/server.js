import { allowedOrigins } from './config/env.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import adminRoutes from './routes/adminRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import { stripeWebhook } from './routes/stripeWebhook.js';
import { uploadDir } from './config/cloudinary.js';

// Turns {"email": {"$ne": null}} style payloads into plain values (NoSQL injection protection).
mongoose.set('sanitizeFilter', true);

const app = express();

app.disable('x-powered-by');
// Behind Vercel's proxy the real client IP is in X-Forwarded-For (needed for rate limiting).
if (process.env.VERCEL || process.env.TRUST_PROXY) app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.includes(origin)),
}));

// Stripe needs the raw body to verify the signature, so this route comes before express.json().
app.post('/api/client/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json({ limit: '100kb' }));
app.use('/uploads', express.static(uploadDir, { dotfiles: 'deny', index: false }));

app.get('/', (req, res) => {
    res.send('Quran Academy API is running');
});

// Fail fast with a clear message instead of hanging when the database is down.
app.use('/api', (req, res, next) => {
    if (mongoose.connection.readyState === 0) {
        return res.status(503).json({ success: false, message: 'The service is temporarily unavailable. Please try again shortly.' });
    }
    next();
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/account', accountRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not found.' });
});

// Global error handler: always JSON, never leaks stack traces or internals to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        const message = err.code === 'LIMIT_FILE_SIZE' ? 'The image is too large (max 5 MB).' : 'Invalid file upload.';
        return res.status(400).json({ success: false, message });
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'Invalid JSON body.' });
    }
    if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid data. Please check the form and try again.' });
    }
    if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'This record already exists.' });
    }

    const status = err.status && err.status >= 400 && err.status < 500 ? err.status : 500;
    if (status === 500) console.error('Unhandled error:', err);
    res.status(status).json({
        success: false,
        message: status === 500 ? 'Something went wrong. Please try again later.' : err.message,
    });
});

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quran_academy', {
            serverSelectionTimeoutMS: 10000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        console.warn('Server is running without Database connection. Please ensure MongoDB is running.');
    }
};

connectDB();

const PORT = process.env.PORT || 5000;
// On Vercel the app is exported as a serverless function; everywhere else we listen normally.
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
