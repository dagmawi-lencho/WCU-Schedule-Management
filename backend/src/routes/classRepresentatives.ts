import express from 'express';
import {
  createClassRepresentative,
  getClassRepresentatives,
  getClassRepresentative,
  updateClassRepresentative,
  deleteClassRepresentative,
} from '../controllers/classRepresentativeController';

const router = express.Router();

router.post('/', createClassRepresentative);
router.get('/', getClassRepresentatives);
router.get('/:id', getClassRepresentative);
router.put('/:id', updateClassRepresentative);
router.delete('/:id', deleteClassRepresentative);

export default router;





