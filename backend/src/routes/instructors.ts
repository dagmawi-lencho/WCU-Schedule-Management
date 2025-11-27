import express from 'express';
import {
  createInstructor,
  getInstructors,
  getInstructor,
  getInstructorWorkload,
  updateInstructor,
  deleteInstructor,
} from '../controllers/instructorController';
import { authenticate, requireAdmin, requireInstructor } from '../middleware/auth';

const router = express.Router();

// Temporarily disabled authentication for easy access
router.post('/', createInstructor);
router.get('/', getInstructors);
router.get('/:id', getInstructor);
router.get('/:id/workload', getInstructorWorkload);
router.put('/:id', updateInstructor);
router.delete('/:id', deleteInstructor);

export default router;

