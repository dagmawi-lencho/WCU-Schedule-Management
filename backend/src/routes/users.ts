import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users (admin only)
router.get('/', requireAdmin, getUsers);

// Get user by ID
router.get('/:id', getUserById);

// Create user (admin only)
router.post('/', requireAdmin, createUser);

// Update user
router.put('/:id', updateUser);

// Delete user (admin only)
router.delete('/:id', requireAdmin, deleteUser);

export default router;



