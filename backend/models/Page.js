import mongoose from 'mongoose';

// Content the admin can edit from the dashboard:
// - footer pages (about, terms, privacy, refund)
// - home page sections (faq, stars, testimonials): sections hold question/answer, student/achievement, name/quote.
export const PAGE_SLUGS = ['about', 'terms', 'privacy', 'refund', 'faq', 'stars', 'testimonials'];

const sectionSchema = new mongoose.Schema({
    heading: { type: String, required: true, maxlength: 150 },
    text: { type: String, required: true, maxlength: 5000 },
    // Optional photo (used by the Stars of Tarteel section).
    image: { type: String, maxlength: 500 },
}, { _id: false });

const languageContentSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 150 },
    intro: { type: String, default: '', maxlength: 1000 },
    sections: { type: [sectionSchema], default: [] },
}, { _id: false });

const pageSchema = new mongoose.Schema({
    slug: { type: String, enum: PAGE_SLUGS, required: true, unique: true },
    en: { type: languageContentSchema, required: true },
    ar: { type: languageContentSchema, required: true },
}, { timestamps: true });

export default mongoose.model('Page', pageSchema);
