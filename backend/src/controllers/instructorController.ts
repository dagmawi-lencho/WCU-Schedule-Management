import { Request, Response } from 'express';
import Instructor from '../models/Instructor';

export const createInstructor = async (req: Request, res: Response) => {
  try {
    const instructor = new Instructor(req.body);
    await instructor.save();
    res.status(201).json(instructor);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getInstructors = async (req: Request, res: Response) => {
  try {
    const instructors = await Instructor.find().sort({ fullName: 1 });
    res.json(instructors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getInstructor = async (req: Request, res: Response) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    res.json(instructor);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInstructor = async (req: Request, res: Response) => {
  try {
    const instructor = await Instructor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    res.json(instructor);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteInstructor = async (req: Request, res: Response) => {
  try {
    const instructor = await Instructor.findByIdAndDelete(req.params.id);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    res.json({ message: 'Instructor deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getInstructorWorkload = async (req: Request, res: Response) => {
  try {
    const instructor = await Instructor.findById(req.params.id);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    
    // Calculate workload from courses
    const Course = require('../models/Course').default;
    const courses = await Course.find({ instructorId: req.params.id });
    const totalHours = courses.reduce((sum: number, course: any) => {
      return sum + (course.lectureHours || 0) + (course.labHours || 0);
    }, 0);
    
    res.json({
      instructor,
      totalHours,
      maxHours: instructor.maxTeachingLoad || 0,
      courses: courses.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
