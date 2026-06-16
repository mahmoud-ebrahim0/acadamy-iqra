import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rank: { type: String, required: true },
    schedule: { type: String, required: true },
    attendance: { type: Number, default: 100 },
    salary: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Instructor', instructorSchema);
