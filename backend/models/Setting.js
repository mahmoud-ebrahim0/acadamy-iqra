import mongoose from 'mongoose';

// Contact numbers, payment accounts and social links edited from the admin "Settings" page.
// There is a single document (key: 'site').
export const SETTING_FIELDS = {
    whatsapp: 30,
    phone: 30,
    email: 120,
    vodafoneCash: 30,
    instapay: 120,
    facebook: 300,
    instagram: 300,
    youtube: 300,
    tiktok: 300,
};
export const SOCIAL_FIELDS = ['facebook', 'instagram', 'youtube', 'tiktok'];

const fields = Object.fromEntries(
    Object.entries(SETTING_FIELDS).map(([name, max]) => [name, { type: String, trim: true, maxlength: max, default: '' }])
);

const settingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true, default: 'site' },
    ...fields,
    updatedAt: { type: Date, default: Date.now },
});

/** Returns the site settings as a plain object (empty values when nothing was saved yet). */
settingSchema.statics.getSite = async function () {
    const doc = await this.findOne({ key: 'site' }).lean();
    return Object.fromEntries(Object.keys(SETTING_FIELDS).map((k) => [k, doc?.[k] || '']));
};

export default mongoose.model('Setting', settingSchema);
