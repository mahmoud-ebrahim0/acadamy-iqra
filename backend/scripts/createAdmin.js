/**
 * Creates (or promotes) an admin account.
 *
 *   npm run create-admin
 *
 * You will be asked for the name, email and password. For automation you can instead set
 * ADMIN_NAME, ADMIN_EMAIL_LOGIN and ADMIN_PASSWORD environment variables.
 */
import '../config/env.js';
import mongoose from 'mongoose';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import User from '../models/User.js';
import { isValidEmail, isValidPassword, normalizeEmail, PASSWORD_MIN_LENGTH } from '../utils/validation.js';

const ask = async (rl, question, fallback) => fallback ?? (await rl.question(question)).trim();

const main = async () => {
    const rl = readline.createInterface({ input, output });
    try {
        const name = await ask(rl, 'Admin name: ', process.env.ADMIN_NAME);
        const email = normalizeEmail(await ask(rl, 'Admin email: ', process.env.ADMIN_EMAIL_LOGIN));
        const password = await ask(rl, `Password (min ${PASSWORD_MIN_LENGTH} characters): `, process.env.ADMIN_PASSWORD);

        if (!name) throw new Error('Name is required.');
        if (!isValidEmail(email)) throw new Error('Invalid email.');
        if (!isValidPassword(password)) throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);

        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quran_academy', {
            serverSelectionTimeoutMS: 10000,
        });

        let user = await User.findOne({ email });
        if (user) {
            user.name = name;
            user.role = 'admin';
            user.password = password;
            await user.save();
            console.log(`\n✅ Existing account ${email} is now an admin (password updated).`);
        } else {
            user = await User.create({ name, email, password, role: 'admin' });
            console.log(`\n✅ Admin account created: ${email}`);
        }
    } finally {
        rl.close();
        await mongoose.disconnect();
    }
};

main().catch((err) => {
    console.error(`\n❌ ${err.message}`);
    process.exit(1);
});
