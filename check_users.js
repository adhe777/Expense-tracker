const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const checkUsers = async () => {
  await connectDB();
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  console.log('--- Users in Database ---');
  users.forEach(u => {
    console.log(`Email: ${u.email}, Name: ${u.name}, ID: ${u._id}`);
  });
  process.exit(0);
};

checkUsers();
