import express from 'express';
import { authenticate } from '../middleware/auth';
import exportService from '../services/exportService';

const router = express.Router();

// Temporarily disabled authentication for easy access
// router.use(authenticate);

router.get('/schedule/:id/pdf', async (req, res) => {
  try {
    const pdfBuffer = await exportService.exportToPDF(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=schedule-${req.params.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/schedule/:id/json', async (req, res) => {
  try {
    const json = await exportService.exportToJSON(req.params.id);
    res.json(json);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

