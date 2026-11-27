import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { put, del } from '@vercel/blob';
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

// Vercel Blob: file storage built into Vercel (token added automatically when a Blob store is connected).
const isBlobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

let storage;

if (isBlobConfigured) {
    // Multer storage engine that buffers the (max 5 MB) image and uploads it to Vercel Blob.
    storage = {
        _handleFile(req, file, cb) {
            const chunks = [];
            file.stream.on('data', (c) => chunks.push(c));
            file.stream.on('error', cb);
            file.stream.on('end', async () => {
                try {
                    const body = Buffer.concat(chunks);
                    const name = `academy_iqra/${crypto.randomUUID()}${ALLOWED_TYPES[file.mimetype]}`;
                    const blob = await put(name, body, { access: 'public', contentType: file.mimetype });
                    cb(null, { path: blob.url, filename: blob.url, size: body.length, blob: true });
                } catch (err) {
                    cb(err);
                }
            });
        },
        _removeFile(req, file, cb) {
            del(file.path).then(() => cb(null), () => cb(null));
        },
    };
    console.log('Vercel Blob configured for uploads.');
} else if (isCloudinaryConfigured) {
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
        console.warn('[uploads] No cloud storage (Vercel Blob or Cloudinary) is configured – files are stored on local disk and will be lost on redeploy.');
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
    if (file?.blob && file.path) {
        del(file.path).catch(() => {});
        return;
    }
    if (file?.filename && file.path && !/^https?:\/\//.test(file.path)) {
        fs.promises.unlink(file.path).catch(() => {});
    }
};

export { cloudinary };
