import express from 'express';
import {
  createSemester,
  getSemesters,
  getSemester,
  updateSemester,
  deleteSemester,
} from '../controllers/semesterController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Temporarily disabled authentication for easy access
// router.use(authenticate);
// router.use(requireAdmin);

router.post('/', createSemester);
router.get('/', getSemesters);
router.get('/:id', getSemester);
router.put('/:id', updateSemester);
router.delete('/:id', deleteSemester);

export default router;
