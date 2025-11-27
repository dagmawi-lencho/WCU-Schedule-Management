import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';

// Get all users (admin only)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching users' });
  }
};

// Get user by ID
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching user' });
  }
};

// Create user (admin only)
export const createUser = async (req: AuthRequest, res: Response) => {
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
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

    const userResponse = await User.findById(user._id).select('-password');
    res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
    });
  } catch (error: any) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: error.message || 'Error creating user' });
  }
};

// Update user (admin only, or user updating themselves)
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, role, fullName, phoneNumber } = req.body;
    const userId = req.params.id;
    const currentUserId = req.userId;
    const currentUserRole = req.userRole;

    // Non-admins can only update themselves
    if (currentUserRole !== 'admin' && userId !== currentUserId) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only admins can change roles
    if (role && role !== user.role && currentUserRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change user roles' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    if (role && currentUserRole === 'admin') {
      user.role = role;
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

    await user.save();

    const userResponse = await User.findById(user._id).select('-password');
    res.json({
      message: 'User updated successfully',
      user: userResponse,
    });
  } catch (error: any) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: error.message || 'Error updating user' });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.userId;

    // Prevent self-deletion
    if (userId === currentUserId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error deleting user' });
  }
};


