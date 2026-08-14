import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Configure Cloudinary
const isCloudinaryConfigured = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== '874839882361596';

let storage;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'academy_iqra',
      allowedFormats: ['jpeg', 'png', 'jpg'],
    },
  });
  console.log('Cloudinary configured for uploads.');
} else {
  // Ensure local uploads directory exists (use /tmp on Vercel)
  const uploadDir = process.env.VERCEL ? '/tmp/uploads' : 'uploads';
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
      console.warn('Could not create upload directory:', err.message);
    }
  }

  // Fallback to local storage for demo purposes
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
    }
  });
  console.log(`Using local disk storage for uploads at ${uploadDir}`);
}

export const upload = multer({ storage });
export { cloudinary };
