const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const resetPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/manav-seva');
    const hashedPassword = await bcrypt.hash('', 10);
    await User.findOneAndUpdate(
      { email: 'admin@example.com' }, // Replace with your admin email
      { username: 'admin', email: 'admin@example.com', password: hashedPassword, role: 'admin' },
      { upsert: true }
    );
    console.log('Password reset successfully. New password:');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetPassword();
