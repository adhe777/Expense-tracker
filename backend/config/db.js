const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.warn('Backend is running, but database features will be unavailable. Please start MongoDB.');
        // Don't exit process to allow project to stay "running" for UI/UX debugging
    }
};

module.exports = connectDB;
