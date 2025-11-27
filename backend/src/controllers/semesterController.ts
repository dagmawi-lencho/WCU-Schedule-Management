import { Request, Response } from 'express';
import Semester from '../models/Semester';
import Batch from '../models/Batch';

export const createSemester = async (req: Request, res: Response) => {
  try {
    // Verify batch exists
    const batch = await Batch.findById(req.body.batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const semester = new Semester(req.body);
    await semester.save();
    
    // Populate batch reference
    await semester.populate('batchId');
    res.status(201).json(semester);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getSemesters = async (req: Request, res: Response) => {
  try {
    const { batchId } = req.query;
    const query = batchId ? { batchId } : {};
    const semesters = await Semester.find(query).populate('batchId').sort({ semesterNumber: 1 });
    res.json(semesters);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSemester = async (req: Request, res: Response) => {
  try {
    const semester = await Semester.findById(req.params.id).populate('batchId');
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    res.json(semester);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSemester = async (req: Request, res: Response) => {
  try {
    const semester = await Semester.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('batchId');
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    res.json(semester);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSemester = async (req: Request, res: Response) => {
  try {
    const semester = await Semester.findByIdAndDelete(req.params.id);
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }
    res.json({ message: 'Semester deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
