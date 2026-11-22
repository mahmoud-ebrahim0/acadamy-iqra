import mongoose from 'mongoose';

export const ATTENDANCE_STATUSES = ['Present', 'Absent'];

// One record per student enrollment per day, set by the instructor.
const attendanceSchema = new mongoose.Schema({
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Calendar day in the instructor's local time, e.g. "2026-11-21".
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    status: { type: String, enum: ATTENDANCE_STATUSES, required: true },
}, { timestamps: true });

attendanceSchema.index({ enrollment: 1, date: 1 }, { unique: true });
attendanceSchema.index({ instructor: 1, date: 1 });

export default mongoose.model('Attendance', attendanceSchema);
