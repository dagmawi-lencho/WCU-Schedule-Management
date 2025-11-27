import { Request, Response } from 'express';
import ClassRepresentative from '../models/ClassRepresentative';
import Batch from '../models/Batch';

export const createClassRepresentative = async (req: Request, res: Response) => {
  try {
    // Verify batch exists
    const batch = await Batch.findById(req.body.batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const rep = new ClassRepresentative(req.body);
    await rep.save();
    
    // Populate batch reference
    await rep.populate('batchId');
    res.status(201).json(rep);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A class representative already exists for this batch and section' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const getClassRepresentatives = async (req: Request, res: Response) => {
  try {
    const { batchId, section } = req.query;
    const query: any = {};
    if (batchId) query.batchId = batchId;
    if (section) query.section = section;

    const reps = await ClassRepresentative.find(query)
      .populate('batchId')
      .sort({ createdAt: -1 });
    res.json(reps);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getClassRepresentative = async (req: Request, res: Response) => {
  try {
    const rep = await ClassRepresentative.findById(req.params.id).populate('batchId');
    if (!rep) {
      return res.status(404).json({ message: 'Class representative not found' });
    }
    res.json(rep);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateClassRepresentative = async (req: Request, res: Response) => {
  try {
    const rep = await ClassRepresentative.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('batchId');
    if (!rep) {
      return res.status(404).json({ message: 'Class representative not found' });
    }
    res.json(rep);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A class representative already exists for this batch and section' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const deleteClassRepresentative = async (req: Request, res: Response) => {
  try {
    const rep = await ClassRepresentative.findByIdAndDelete(req.params.id);
    if (!rep) {
      return res.status(404).json({ message: 'Class representative not found' });
    }
    res.json({ message: 'Class representative deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
