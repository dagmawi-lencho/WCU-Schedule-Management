import express from 'express';
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Temporarily disabled authentication for easy access
// router.use(authenticate);
// router.use(requireAdmin);

router.post('/', createCourse);
router.get('/', getCourses);
router.get('/:id', getCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;

