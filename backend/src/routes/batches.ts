import express from 'express';
import {
  createBatch,
  getBatches,
  getBatch,
  updateBatch,
  deleteBatch,
} from '../controllers/batchController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Temporarily disabled authentication for easy access
// router.use(authenticate);
// router.use(requireAdmin);

router.post('/', createBatch);
router.get('/', getBatches);
router.get('/:id', getBatch);
router.put('/:id', updateBatch);
router.delete('/:id', deleteBatch);

export default router;

