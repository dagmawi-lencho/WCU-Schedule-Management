import { Request, Response } from 'express';
import Course from '../models/Course';
import Batch from '../models/Batch';
import Semester from '../models/Semester';
import Instructor from '../models/Instructor';

export const createCourse = async (req: Request, res: Response) => {
  try {
    // Verify references exist
    const batch = await Batch.findById(req.body.batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const semester = await Semester.findById(req.body.semesterId);
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    const instructor = await Instructor.findById(req.body.instructorId);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Auto-calculate lecture hours from credit hours
    const { creditHour, hasLab } = req.body;
    
    let lectureHours = creditHour;
    let labHours = 0;

    if (hasLab && creditHour === 5) {
      // 5 ECTS → 2 lecture + 3 lab
      lectureHours = 2;
      labHours = 3;
    } else if (hasLab) {
      // Other lab courses
      lectureHours = Math.floor(creditHour * 0.4);
      labHours = creditHour - lectureHours;
    }

    const course = new Course({
      ...req.body,
      lectureHours,
      labHours,
    });
    await course.save();
    
    // Populate references
    await course.populate(['batchId', 'semesterId', 'instructorId']);
    res.status(201).json(course);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Course code already exists' });
    }
    res.status(400).json({ message: error.message });
  }
};

export const getCourses = async (req: Request, res: Response) => {
  try {
    const { batchId, semesterId, department } = req.query;
    const query: any = {};
    if (batchId) query.batchId = batchId;
    if (semesterId) query.semesterId = semesterId;
    if (department) query.department = department;

    const courses = await Course.find(query)
      .populate('batchId')
      .populate('semesterId')
      .populate('instructorId')
      .sort({ courseCode: 1 });
    
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('batchId')
      .populate('semesterId')
      .populate('instructorId');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    // Recalculate hours if creditHour or hasLab changed
    if (req.body.creditHour !== undefined || req.body.hasLab !== undefined) {
      const existingCourse = await Course.findById(req.params.id);
      if (existingCourse) {
        const creditHour = req.body.creditHour || existingCourse.creditHour;
        const hasLab = req.body.hasLab !== undefined ? req.body.hasLab : existingCourse.hasLab;
        
        let lectureHours = creditHour;
        let labHours = 0;

        if (hasLab && creditHour === 5) {
          lectureHours = 2;
          labHours = 3;
        } else if (hasLab) {
          lectureHours = Math.floor(creditHour * 0.4);
          labHours = creditHour - lectureHours;
        }

        req.body.lectureHours = lectureHours;
        req.body.labHours = labHours;
      }
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('batchId')
      .populate('semesterId')
      .populate('instructorId');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
