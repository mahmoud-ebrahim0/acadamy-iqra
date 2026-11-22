import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false -> the hash is never returned by queries unless explicitly requested.
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'admin', 'instructor'], default: 'student' },
    // Contact number (WhatsApp) the user can edit from their profile.
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    // Login tokens issued before this moment are rejected (set when the password changes).
    passwordChangedAt: { type: Date },
    // Forgot-password flow: only a hash of the emailed token is stored.
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    createdAt: { type: Date, default: Date.now }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (typeof enteredPassword !== 'string' || !this.password) return false;
    return bcrypt.compare(enteredPassword, this.password);
};

// Hash the password whenever it is set or changed.
// Mongoose 9 no longer passes `next` to async middleware, so we simply return.
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // Changing the password signs out every other session.
    if (!this.isNew) this.passwordChangedAt = new Date();
});

/** True when a token issued at `iat` (seconds) predates the last password change. */
userSchema.methods.tokenIssuedBeforePasswordChange = function (iat) {
    if (!this.passwordChangedAt || typeof iat !== 'number') return false;
    return iat < Math.floor(this.passwordChangedAt.getTime() / 1000);
};

export default mongoose.model('User', userSchema);
