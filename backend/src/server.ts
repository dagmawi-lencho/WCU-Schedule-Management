import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User';
import bcrypt from 'bcryptjs';

// Routes
import authRoutes from './routes/auth';
import batchRoutes from './routes/batches';
import semesterRoutes from './routes/semesters';
import courseRoutes from './routes/courses';
import instructorRoutes from './routes/instructors';
import scheduleRoutes from './routes/schedules';
import roomRoutes from './routes/rooms';
import exportRoutes from './routes/export';
import classRepresentativeRoutes from './routes/classRepresentatives';
import departmentRoutes from './routes/departments';
import userRoutes from './routes/users';
import { clearAllData } from './controllers/adminController';
import { authenticate, requireAdmin } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (admin panel)
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/class-schedule';

if (!process.env.MONGODB_URI) {
  console.warn('⚠️  WARNING: MONGODB_URI not set in .env file!');
  console.warn('   Using default: mongodb://localhost:27017/class-schedule');
  console.warn('   Please create a .env file with your MongoDB connection string.');
}

console.log('🔌 Attempting to connect to MongoDB...');
console.log('   URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 15000, // 15 seconds
  socketTimeoutMS: 45000,
})
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully!');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    
    // Auto-create super admin if it doesn't exist
    await createSuperAdmin();
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('   Error details:', error);
    console.error('   Please check:');
    console.error('   1. MongoDB URI in .env file is correct');
    console.error('   2. MongoDB Atlas IP whitelist includes your IP (0.0.0.0/0 for all)');
    console.error('   3. MongoDB credentials are correct');
    console.error('   4. Network connection is available');
    console.log('⚠️  Server will continue but database features may not work');
  });

// Function to create super admin
async function createSuperAdmin() {
  try {
    const adminEmail = 'admin@wachemo.edu';
    const adminPassword = 'Admin@2024';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const superAdmin = new User({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        fullName: 'Super Administrator',
        phoneNumber: '+251900000000'
      });
      
      await superAdmin.save();
      console.log('✅ Super Admin created successfully!');
      console.log('   📧 Email: admin@wachemo.edu');
      console.log('   🔑 Password: Admin@2024');
      console.log('   ⚠️  Please change the password after first login!');
    } else {
      console.log('ℹ️  Super Admin already exists');
    }
  } catch (error: any) {
    console.error('❌ Error creating super admin:', error.message);
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/class-representatives', classRepresentativeRoutes);
app.use('/api/departments', departmentRoutes);

// Admin endpoints
app.post('/api/admin/clear-all-data', authenticate, requireAdmin, clearAllData);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    
    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      database: isConnected ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'ERROR',
      message: error.message 
    });
  }
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Admin Panel: http://localhost:${PORT}`);
  console.log(`💾 Database: MongoDB`);
  console.log(`🔐 Authentication: Enabled`);
});
