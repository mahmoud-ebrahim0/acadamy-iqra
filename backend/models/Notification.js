import mongoose from 'mongoose';

// In-site notification for one user. The text is built on the website from `type` + `data`,
// so it shows in the reader's language (Arabic / English).
export const NOTIFICATION_TYPES = [
    // Admin
    'newConsultation', 'newEnrollment', 'newPayoutRequest',
    // Student
    'paymentApproved', 'instructorAssigned', 'scheduleUpdated', 'newReport',
    // Instructor
    'newStudent', 'payoutPaid', 'payoutRejected',
];

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    // Small values used in the text (names, course title, amount…).
    data: { type: Map, of: String, default: {} },
    // Page of the website to open when the notification is clicked.
    link: { type: String, default: '', maxlength: 200 },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ user: 1, createdAt: -1 });
// Old notifications are removed automatically after 90 days.
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('Notification', notificationSchema);
