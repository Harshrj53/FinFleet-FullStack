import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const promoteAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/finfleet');
    console.log('Connected to MongoDB');

    const user = await User.findOneAndUpdate(
      { email: 'admin@finfleet.com' },
      { isAdmin: true },
      { new: true }
    );

    if (user) {
      console.log(`SUCCESS: ${user.email} has been promoted to Admin.`);
    } else {
      console.log('ERROR: User admin@finfleet.com not found. Please sign up with this email first.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

promoteAdmin();
