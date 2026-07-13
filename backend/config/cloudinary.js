import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '874839882361596', // Demo key
  api_secret: process.env.CLOUDINARY_API_SECRET || 'a676b67565c6767a6767d6767f676fe1' // Demo secret
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'academy_iqra',
    allowedFormats: ['jpeg', 'png', 'jpg'],
  },
});

export const upload = multer({ storage });
export { cloudinary };
