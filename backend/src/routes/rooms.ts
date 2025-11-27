import express from 'express';
import {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
  initializeRooms,
} from '../controllers/roomController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Temporarily disabled authentication for easy access
router.post('/initialize', initializeRooms);
router.post('/', createRoom);
router.get('/', getRooms);
router.get('/:id', getRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);

export default router;

