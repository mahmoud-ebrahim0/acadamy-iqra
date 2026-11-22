import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isProduction } from './env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ALLOWED_TYPES = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, '..', 'uploads');

const isCloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

let storage;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Minimal multer storage engine that streams each file straight to Cloudinary.
    storage = {
        _handleFile(req, file, cb) {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'academy_iqra',
                    public_id: crypto.randomUUID(),
                    resource_type: 'image',
                    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                },
                (err, result) => {
                    if (err) return cb(err);
                    cb(null, { path: result.secure_url, filename: result.public_id, size: result.bytes });
                }
            );
            file.stream.pipe(uploadStream);
        },
        _removeFile(req, file, cb) {
            cloudinary.uploader.destroy(file.filename, () => cb(null));
        },
    };
    console.log('Cloudinary configured for uploads.');
} else {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.warn('Could not create upload directory:', err.message);
    }

    storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        // Never trust the client's file name: generate an unguessable one.
        filename: (req, file, cb) => cb(null, crypto.randomUUID() + ALLOWED_TYPES[file.mimetype]),
    });

    if (isProduction) {
        console.warn('[uploads] Cloudinary is not configured – files are stored on local disk and will be lost on redeploy.');
    } else {
        console.log(`Using local disk storage for uploads at ${uploadDir}`);
    }
}

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_TYPES[file.mimetype]) {
        const err = new Error('Only JPG, PNG or WEBP images are allowed.');
        err.status = 400;
        return cb(err);
    }
    cb(null, true);
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE, files: 1 } });

/** Public URL of an uploaded file (Cloudinary URL or this server's /uploads path). */
export const fileUrl = (req, file) => {
    if (!file) return '';
    if (file.path && /^https?:\/\//.test(file.path)) return file.path;
    const base = (process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');
    return `${base}/uploads/${file.filename}`;
};

/** Deletes a locally stored upload (used when a request fails after the file was saved). */
export const discardUpload = (file) => {
    if (file?.filename && file.path && !/^https?:\/\//.test(file.path)) {
        fs.promises.unlink(file.path).catch(() => {});
    }
};

export { cloudinary };
