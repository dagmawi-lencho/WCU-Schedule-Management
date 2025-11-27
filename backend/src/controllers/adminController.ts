import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Batch from '../models/Batch';
import Semester from '../models/Semester';
import Course from '../models/Course';
import Instructor from '../models/Instructor';
import Room from '../models/Room';
import Schedule from '../models/Schedule';
import User from '../models/User';
// Note: Department and ClassRepresentative models may not exist yet
import { AuthRequest } from '../middleware/auth';

// Clear all data (admin only) - KEEP ADMIN USER
export const clearAllData = async (req: AuthRequest, res: Response) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database connection not available. Please check MongoDB connection.' 
      });
    }

    // Get admin user email to preserve
    const adminEmail = 'admin@wachemo.edu';
    const adminUser = await User.findOne({ email: adminEmail });

    // Delete all data except admin user
    const results = {
      batches: await Batch.deleteMany({}),
      semesters: await Semester.deleteMany({}),
      courses: await Course.deleteMany({}),
      instructors: await Instructor.deleteMany({}),
      rooms: await Room.deleteMany({}),
      schedules: await Schedule.deleteMany({}),
      // departments: await Department.deleteMany({}), // Uncomment if Department model exists
      // classRepresentatives: await ClassRepresentative.deleteMany({}), // Uncomment if ClassRepresentative model exists
      users: await User.deleteMany({ email: { $ne: adminEmail } }), // Keep admin user
    };

    // Recreate admin user if it was deleted (shouldn't happen, but safety check)
    if (!adminUser) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Admin@2024', 10);
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        fullName: 'Super Administrator',
        phoneNumber: '+251900000000'
      });
    }

    res.json({
      message: 'All data cleared successfully. Admin user preserved.',
      deleted: {
        batches: results.batches.deletedCount,
        semesters: results.semesters.deletedCount,
        courses: results.courses.deletedCount,
        instructors: results.instructors.deletedCount,
        rooms: results.rooms.deletedCount,
        schedules: results.schedules.deletedCount,
        users: results.users.deletedCount,
      },
      preserved: {
        adminUser: adminEmail
      }
    });
  } catch (error: any) {
    console.error('Error clearing data:', error);
    res.status(500).json({ 
      message: error.message || 'Error clearing data',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

