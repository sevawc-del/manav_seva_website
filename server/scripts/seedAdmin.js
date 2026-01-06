// Seed Admin User Script
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const adminUser = new User({
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@manavseva.com',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email:', adminUser.email);
    console.log('Password:', process.env.ADMIN_PASSWORD || 'admin123');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedAdmin();
