import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

const clean = (data = {}) => Object.fromEntries(
    Object.entries(data)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => [k, String(v).slice(0, 200)])
);

/**
 * Creates in-site notifications. Never throws: a failed notification must not break the
 * action that triggered it (payment, report…).
 */
export const notify = async (userIds, type, data = {}, link = '') => {
    try {
        const ids = [...new Set((Array.isArray(userIds) ? userIds : [userIds]).filter(Boolean).map(String))];
        if (!ids.length) return;
        await Notification.insertMany(ids.map((user) => ({ user, type, data: clean(data), link })));
    } catch (err) {
        console.error('Notification error:', err.message);
    }
};

/** Notifies every admin account. */
export const notifyAdmins = async (type, data = {}, link = '') => {
    try {
        const admins = await User.find({ role: 'admin', active: mongoose.trusted({ $ne: false }) }).select('_id').lean();
        await notify(admins.map((a) => a._id), type, data, link);
    } catch (err) {
        console.error('Notification error:', err.message);
    }
};
