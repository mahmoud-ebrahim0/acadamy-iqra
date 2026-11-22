import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';

export const generateToken = (id) => jwt.sign({ id: String(id) }, JWT_SECRET, { expiresIn: '7d' });

export const publicUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
});

/** Standard body returned after a successful login / registration. */
export const authResponse = (user) => ({
    success: true,
    token: generateToken(user._id),
    user: publicUser(user),
});
