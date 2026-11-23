import mongoose from 'mongoose';

// Rating scale for memorization / tajweed (stars).
export const RATING_MIN = 1;
export const RATING_MAX = 5;

const rating = { type: Number, min: RATING_MIN, max: RATING_MAX, default: null };

// The instructor's report after a class: what was recited, the homework and ratings.
// One report per student enrollment per day. Shown to the student (and parents) on their dashboard.
const classReportSchema = new mongoose.Schema({
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Class day in the instructor's local time, e.g. "2026-11-22".
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    recited: { type: String, default: '', maxlength: 500 },   // e.g. "Al-Mulk 1–15"
    homework: { type: String, default: '', maxlength: 500 },  // e.g. "Memorize Al-Mulk 16–30"
    notes: { type: String, default: '', maxlength: 1000 },    // comments for the student / parents
    memorization: rating,
    tajweed: rating,
}, { timestamps: true });

classReportSchema.index({ enrollment: 1, date: 1 }, { unique: true });
classReportSchema.index({ student: 1, date: -1 });

export default mongoose.model('ClassReport', classReportSchema);
