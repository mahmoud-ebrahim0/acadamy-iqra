import mongoose from 'mongoose';

export const PAYMENT_METHODS = ['Vodafone Cash', 'InstaPay', 'Credit Card'];
export const STUDENT_LEVELS = ['Beginner', 'Memorized Some', 'Advanced'];

const enrollmentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: false },
    scheduleTime: { type: String, default: '' },
    zoomLink: { type: String, default: '' },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    currentAyahOrLesson: { type: String, default: 'Beginning' },
    status: { type: String, enum: ['Active', 'Completed', 'Pending'], default: 'Active' },
    paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed', 'Refunded'], default: 'Pending' },
    paymentMethod: { type: String, enum: [...PAYMENT_METHODS, ''], default: '' },
    receiptUrl: { type: String, default: '' },
    stripeSessionId: { type: String, index: true, sparse: true },
    // Details collected on the checkout form so the academy can contact the student.
    whatsapp: { type: String, default: '' },
    studentAge: { type: Number, min: 3, max: 120 },
    level: { type: String, enum: [...STUDENT_LEVELS, ''], default: '' },
    enrolledAt: { type: Date, default: Date.now }
});

export default mongoose.model('Enrollment', enrollmentSchema);
