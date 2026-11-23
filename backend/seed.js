import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import Instructor from './models/Instructor.js';
import User from './models/User.js';

dotenv.config({ quiet: true });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quran_academy';

const dummyCourses = [
    {
        title: "Quran Memorization (Hifz) for Beginners",
        level: "Beginner",
        description: "A structured path to memorizing the Holy Quran for absolute beginners, starting with Juz Amma.",
        price: 50,
        icon: "📖"
    },
    {
        title: "Advanced Tajweed Rules",
        level: "Advanced",
        description: "Master the rules of Tajweed with practical application and 1-on-1 recitation correction.",
        price: 70,
        icon: "🎙️"
    },
    {
        title: "Arabic for Non-Native Speakers",
        level: "Intermediate",
        description: "Learn to read and understand the language of the Quran directly without translation.",
        price: 60,
        icon: "🗣️"
    },
    {
        title: "Islamic Studies & Seerah",
        level: "All Levels",
        description: "Comprehensive lessons on the life of Prophet Muhammad (PBUH) and foundational Islamic jurisprudence.",
        price: 45,
        icon: "🕌"
    }
];

const dummyInstructors = [
    {
        name: "Sheikh Abdullah Al-Masri",
        rank: "Senior Qari",
        salary: "$1,500",
        gender: "male"
    },
    {
        name: "Ustadha Fatima Zahra",
        rank: "Tajweed Specialist",
        salary: "$1,200",
        gender: "female"
    },
    {
        name: "Sheikh Omar Al-Faruq",
        rank: "Hifz Master",
        salary: "$1,800",
        gender: "male"
    }
];

const seedDatabase = async () => {
    try {
        console.log(`Connecting to MongoDB at: ${MONGO_URI}`);
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB successfully!");

        // Clear existing data to avoid duplicates during seeding
        console.log("Clearing existing data...");
        await Course.deleteMany({});
        await Instructor.deleteMany({});

        // Insert new dummy data
        console.log("Inserting dummy courses...");
        await Course.insertMany(dummyCourses);

        console.log("Inserting dummy instructors...");
        await Instructor.insertMany(dummyInstructors);

        console.log("Database seeded successfully! 🌱");
        process.exit();
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();
