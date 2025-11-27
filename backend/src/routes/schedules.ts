import express from 'express';
import {
  generateSchedule,
  generateAllBatches,
  getSchedules,
  getSchedule,
  updateSchedule,
  publishSchedule,
  deleteSchedule,
  getInstructorSchedule,
} from '../controllers/scheduleController';
import { authenticate, requireAdmin, requireInstructor } from '../middleware/auth';

const router = express.Router();

// Temporarily disabled authentication for easy access
router.post('/generate', generateSchedule);
router.post('/generate-all', generateAllBatches);
router.get('/instructor/:instructorId', getInstructorSchedule);
router.get('/', getSchedules);
router.get('/:id', getSchedule);
router.put('/:id', updateSchedule);
router.patch('/:id/publish', publishSchedule);
router.delete('/:id', deleteSchedule);

export default router;

