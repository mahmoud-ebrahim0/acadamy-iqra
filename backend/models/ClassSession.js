import mongoose from 'mongoose';

const classSessionSchema = new mongoose.Schema({
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // e.g. "Today" or "2026-06-20"
    time: { type: String, required: true }, // e.g. "5:00 PM"
    status: { type: String, enum: ['upcoming', 'live', 'completed', 'cancelled'], default: 'upcoming' },
    zoomLink: { type: String, default: '#' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ClassSession', classSessionSchema);
