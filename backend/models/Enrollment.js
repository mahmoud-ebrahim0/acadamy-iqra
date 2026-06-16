import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: false },
    progressPercentage: { type: Number, default: 0 },
    currentAyahOrLesson: { type: String, default: 'Beginning' },
    status: { type: String, enum: ['Active', 'Completed', 'Pending'], default: 'Active' },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Pending' },
    enrolledAt: { type: Date, default: Date.now }
});

export default mongoose.model('Enrollment', enrollmentSchema);
