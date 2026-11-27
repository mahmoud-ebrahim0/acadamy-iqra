import mongoose from 'mongoose';

export const CONSULTATION_STATUSES = ['New', 'Contacted', 'Enrolled', 'Closed'];

// Free trial / consultation request sent from the website.
const consultationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    age: { type: Number, min: 3, max: 120 },
    whatsapp: { type: String, required: true, trim: true, maxlength: 30 },
    status: { type: String, enum: CONSULTATION_STATUSES, default: 'New' },
    // Private admin notes (e.g. "called, trial on Sunday").
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
    createdAt: { type: Date, default: Date.now },
});

consultationSchema.index({ createdAt: -1 });

export default mongoose.model('Consultation', consultationSchema);
