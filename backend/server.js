import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import adminRoutes from './routes/adminRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/instructor', instructorRoutes);

// Global Error Handler to return JSON instead of HTML
app.use((err, req, res, next) => {
    console.error('Express Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Quran Academy API is running');
});

// Database connection can be initialized here or imported
// For local development, we'll connect if MONGO_URI is provided or try local
const connectDB = async () => {
    try {
        // Fallback to local DB if no URI in .env, using port 27018 to avoid conflicts
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/quran_academy');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        console.warn('Server is running without Database connection. Please ensure MongoDB is running.');
        // process.exit(1); // Do not exit so the server can start
    }
};

connectDB(); // Run asynchronously

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
