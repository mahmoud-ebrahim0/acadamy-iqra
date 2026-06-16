import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
    invoiceId: { type: String, required: true },
    amount: { type: String, required: true },
    method: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    details: { type: String },
    date: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Payout', payoutSchema);
