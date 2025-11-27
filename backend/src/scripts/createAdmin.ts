import mongoose from 'mongoose';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/class-schedule';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB for admin creation');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@university.edu' });
    if (existingAdmin) {
      console.log('ℹ️  Admin account already exists');
      console.log('   Email: admin@university.edu');
      console.log('   Password: admin123');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      email: 'admin@university.edu',
      password: hashedPassword,
      role: 'admin',
      fullName: 'System Administrator',
      phoneNumber: '',
    });

    await admin.save();
    console.log('✅ Admin account created successfully!');
    console.log('   Email: admin@university.edu');
    console.log('   Password: admin123');
    console.log('   Role: admin');

    await mongoose.disconnect();
  } catch (error: any) {
    console.error('❌ Error creating admin:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();
