import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rank: { type: String, required: true },
    // Schedule and attendance are not stored here: they are calculated from the students'
    // class times and the attendance the instructor records (see GET /api/admin/instructors).
    salary: { type: String, required: true },
    // Used to pick the profile picture on the website.
    gender: { type: String, enum: ['male', 'female'], default: 'male' },
    // Public profile shown on the website, edited by the instructor.
    photoUrl: { type: String, default: '' },
    bioAr: { type: String, default: '', maxlength: 600 },
    bioEn: { type: String, default: '', maxlength: 600 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Instructor', instructorSchema);
