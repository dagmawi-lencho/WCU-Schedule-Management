import { Request, Response } from 'express';
import Batch from '../models/Batch';

export const createBatch = async (req: Request, res: Response) => {
  try {
    const batch = new Batch(req.body);
    await batch.save();
    res.status(201).json(batch);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Batch number already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const getBatches = async (req: Request, res: Response) => {
  try {
    const batches = await Batch.find().sort({ batchNumber: -1 });
    res.json(batches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBatch = async (req: Request, res: Response) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.json(batch);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBatch = async (req: Request, res: Response) => {
  try {
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.json(batch);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBatch = async (req: Request, res: Response) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.json({ message: 'Batch deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
