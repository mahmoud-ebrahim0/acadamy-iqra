import express from 'express';
import Course from '../models/Course.js';
import Instructor from '../models/Instructor.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { upload } from '../config/cloudinary.js';
import nodemailer from 'nodemailer';

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

const router = express.Router();

// Get public courses for client page
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get public instructors for client page
router.get('/instructors', async (req, res) => {
    try {
        const instructors = await Instructor.find();
        res.json(instructors);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// User Registration
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        let role = 'student';
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail === 'admin@admin.com') {
            role = 'admin';
        } else if (normalizedEmail.endsWith('@instructor.com')) {
            role = 'instructor';
        }

        const newUser = new User({ name, email, password, role });
        await newUser.save();

        if (role === 'instructor') {
            const newInstructor = new Instructor({
                _id: newUser._id,
                name: newUser.name,
                rank: 'New Instructor',
                schedule: 'TBD',
                salary: 'TBD'
            });
            await newInstructor.save();
        }

        res.status(201).json({ 
            success: true, 
            token: generateToken(newUser._id), 
            user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// User Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        
        if (user && (await user.matchPassword(password))) {
            res.json({ 
                success: true, 
                token: generateToken(user._id), 
                user: { _id: user._id, name: user.name, email: user.email, role: user.role } 
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Checkout Endpoint: Registers user and creates pending enrollment
router.post('/checkout', upload.single('screenshot'), async (req, res) => {
    try {
        const { name, email, password, age, whatsapp, level, courseId, paymentMethod } = req.body;
        
        // 1. Find or create user
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ name, email, password, role: 'student' });
            await user.save();
        }

        // Get Cloudinary URL or local path if uploaded
        let receiptUrl = '';
        if (req.file) {
            if (req.file.path && req.file.path.startsWith('http')) {
                receiptUrl = req.file.path;
            } else {
                receiptUrl = `https://acadamy-iqra-production.up.railway.app/${req.file.path.replace(/\\/g, '/')}`;
            }
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Handle Stripe Credit Card Payment
        if (paymentMethod === 'Credit Card') {
            if (!stripe) {
                return res.status(500).json({ success: false, message: 'Stripe is not configured. Please contact the administrator.' });
            }
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL || 'https://acadamy-iqra.vercel.app'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL || 'https://acadamy-iqra.vercel.app'}/checkout`,
                customer_email: user.email,
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: course.title,
                            },
                            unit_amount: course.price * 100, // Stripe expects cents
                        },
                        quantity: 1,
                    },
                ],
            });

            const newEnrollment = new Enrollment({
                student: user._id,
                course: courseId,
                instructor: null,
                status: 'Pending',
                paymentStatus: 'Pending', // Will be updated via webhook in a real app
                receiptUrl
            });
            await newEnrollment.save();

            return res.status(200).json({
                success: true,
                url: session.url, // Send stripe checkout URL to frontend
                token: generateToken(user._id),
                user: { _id: user._id, name: user.name, email: user.email, role: user.role }
            });
        }

        // Handle Manual Payments (Vodafone Cash / InstaPay)
        const newEnrollment = new Enrollment({
            student: user._id,
            course: courseId,
            instructor: null,
            status: 'Pending',
            paymentStatus: 'Pending',
            receiptUrl // Save the Cloudinary URL here
        });
        await newEnrollment.save();

        res.status(201).json({ 
            success: true, 
            token: generateToken(user._id), 
            user: { _id: user._id, name: user.name, email: user.email, role: user.role } 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Free Consultation Email Route
router.post('/consultation', async (req, res) => {
    try {
        const { name, age, whatsapp } = req.body;

        if (!name || !age || !whatsapp) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: `New Free Trial Request - ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: auto;">
                    <h2 style="color: #b45309; text-align: center;">New Free Consultation Request</h2>
                    <p style="font-size: 16px;">You have received a new free trial evaluation request from the website.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd; color: #333;">Student Name:</th>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${name}</td>
                        </tr>
                        <tr>
                            <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd; color: #333;">Student Age:</th>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${age} Years</td>
                        </tr>
                        <tr>
                            <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd; color: #333;">WhatsApp:</th>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                                <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" style="color: #25D366; font-weight: bold; text-decoration: none;">
                                    ${whatsapp} (Click to Chat)
                                </a>
                            </td>
                        </tr>
                    </table>
                    <p style="text-align: center; margin-top: 30px; font-size: 14px; color: #777;">Tarteel Academy System</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Consultation request sent successfully.' });
    } catch (err) {
        console.error('Email sending error:', err);
        res.status(500).json({ success: false, message: 'Failed to send email. Check credentials.' });
    }
});

export default router;
