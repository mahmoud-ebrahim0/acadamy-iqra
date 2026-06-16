import mongoose from 'mongoose';
import Course from './models/Course.js';
import Instructor from './models/Instructor.js';

const seedDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27018/quran_academy');
        console.log('Connected to seed DB');

        await Course.deleteMany({});
        await Instructor.deleteMany({});

        const instructor = new Instructor({
            name: 'Sheikh Mahmoud',
            rank: 'Grand Master Qari',
            schedule: 'Mon, Wed, Fri',
            attendance: 100,
            salary: '2500'
        });
        await instructor.save();

        const courses = [
            {
                title: "Noorani Qaida for Beginners",
                level: "Kids (4-8 Years)",
                description: "The perfect start for children to learn Arabic alphabets and basic pronunciation rules.",
                price: 40,
                icon: "✨"
            },
            {
                title: "Tajweed Mastery Program",
                level: "Adults (Intermediate)",
                description: "Master the rules of Tajweed and beautify your recitation with certified instructors.",
                price: 60,
                icon: "📖"
            },
            {
                title: "Hifz (Memorization) Track",
                level: "All Ages",
                description: "Intensive memorization program with daily tracking and rigorous revision sessions.",
                price: 80,
                icon: "🕌"
            }
        ];

        await Course.insertMany(courses);
        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
