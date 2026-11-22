import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: String, required: true },
    level: { type: String, required: true },
    icon: { type: String, default: '📚' },
    imageUrl: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Course', courseSchema);
