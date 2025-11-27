import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, fullName, phoneNumber } = req.body;

    // Validation
    if (!email || !password || !role || !fullName) {
      return res.status(400).json({ 
        message: 'Missing required fields: email, password, role, and fullName are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    if (!['admin', 'instructor', 'department_head'].includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be: admin, instructor, or department_head' 
      });
    }

    // Check MongoDB connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: 'Database connection not available. Please check MongoDB connection.' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role,
      fullName,
      phoneNumber: phoneNumber || undefined,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle MongoDB errors
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ 
        message: 'Email already exists' 
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: `Validation error: ${Object.values(error.errors).map((e: any) => e.message).join(', ')}` 
      });
    }

    // Generic error
    res.status(500).json({ 
      message: error.message || 'Internal server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log('📥 Login request received');
    const { email, password } = req.body;
    console.log('   Email:', email);
    console.log('   Password provided:', password ? 'Yes' : 'No');

    // Validation
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Check MongoDB connection
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    console.log('   MongoDB connection state:', dbState === 1 ? 'Connected' : 'Disconnected');
    
    if (dbState !== 1) {
      console.error('❌ Database not connected! State:', dbState);
      return res.status(503).json({ 
        message: 'Database connection not available. Please check MongoDB connection.',
        dbState: dbState
      });
    }

    console.log(`🔐 Searching for user: ${email}`);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`✅ User found: ${user.email} (${user.role})`);
    console.log('   Verifying password...');
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log(`❌ Invalid password for: ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Password verified');
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    console.log(`✅ Login successful for: ${email} (${user.role})`);
    console.log('   Token generated');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    console.error('   Error stack:', error.stack);
    res.status(500).json({ 
      message: error.message || 'Internal server error during login',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal server error' });
  }
};

