import { Request, Response } from 'express';
import Schedule from '../models/Schedule';
import schedulingService from '../services/schedulingService';

export const generateSchedule = async (req: Request, res: Response) => {
  try {
    const {
      batchId,
      semesterId,
      section,
      department,
      days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      morningShift = { start: '08:00', end: '12:00' },
      afternoonShift = { start: '13:00', end: '17:00' },
      periodsPerDay = 2,
      selectedRoomIds,
      prioritySettings,
    } = req.body;

    const result = await schedulingService.generateSchedule({
      batchId,
      semesterId,
      section,
      department,
      days,
      morningShift,
      afternoonShift,
      periodsPerDay,
      selectedRoomIds,
      prioritySettings,
    });

    // Check if schedule already exists
    const existingSchedule = await Schedule.findOne({
      batchId,
      semesterId,
      section,
    });

    let schedule;
    if (existingSchedule) {
      // Update existing schedule
      existingSchedule.entries = result.schedule;
      existingSchedule.department = department;
      existingSchedule.status = 'draft';
      existingSchedule.generatedAt = new Date();
      await existingSchedule.save();
      schedule = existingSchedule;
    } else {
      // Create new schedule
      schedule = new Schedule({
        batchId,
        semesterId,
        section,
        department,
        entries: result.schedule,
        status: 'draft',
        generatedAt: new Date(),
      });
      await schedule.save();
    }

    // Populate references for response
    await schedule.populate('batchId');
    await schedule.populate('semesterId');

    res.json({
      schedule: schedule,
      conflicts: result.conflicts,
      warnings: result.warnings,
      message: 'Schedule generated successfully',
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSchedules = async (req: Request, res: Response) => {
  try {
    const { batchId, semesterId, section } = req.query;
    const query: any = {};
    if (batchId) query.batchId = batchId;
    if (semesterId) query.semesterId = semesterId;
    if (section) query.section = section;

    const schedules = await Schedule.find(query)
      .populate('batchId')
      .populate('semesterId')
      .sort({ createdAt: -1 });
    
    res.json(schedules);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('batchId')
      .populate('semesterId');
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    
    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('batchId')
      .populate('semesterId');
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const publishSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true }
    )
      .populate('batchId')
      .populate('semesterId');
    
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json(schedule);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getInstructorSchedule = async (req: Request, res: Response) => {
  try {
    const { instructorId } = req.params;
    const schedules = await Schedule.find({ status: 'published' })
      .populate('batchId')
      .populate('semesterId');
    
    // Filter schedules for this instructor
    const instructorSchedules = schedules.filter(schedule =>
      schedule.entries.some(e => e.instructorId.toString() === instructorId)
    );
    
    // Filter entries for this instructor
    const instructorEntries = instructorSchedules.flatMap(schedule =>
      schedule.entries
        .filter(e => {
          const entryInstructorId = e.instructorId?.toString ? e.instructorId.toString() : e.instructorId;
          return entryInstructorId === instructorId;
        })
        .map(entry => ({
          courseId: entry.courseId,
          courseCode: entry.courseCode,
          courseName: entry.courseName,
          instructorId: entry.instructorId,
          instructorName: entry.instructorName,
          roomId: entry.roomId,
          roomNumber: entry.roomNumber,
          day: entry.day,
          shift: entry.shift,
          startTime: entry.startTime,
          endTime: entry.endTime,
          isLab: entry.isLab,
          batch: schedule.batchId,
          semester: schedule.semesterId,
          section: schedule.section,
        }))
    );

    res.json(instructorEntries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const generateAllBatches = async (req: Request, res: Response) => {
  try {
    const {
      semesterId,
      department,
      days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      morningShift = { start: '08:00', end: '12:00' },
      afternoonShift = { start: '13:00', end: '17:00' },
      selectedRoomIds,
      prioritySettings,
    } = req.body;

    const result = await schedulingService.generateAllBatches({
      semesterId,
      department,
      days,
      morningShift,
      afternoonShift,
      selectedRoomIds,
      prioritySettings,
    });

    // Save all schedules to MongoDB
    const savedSchedules = [];
    for (const { batchId, section, schedule: entries } of result.schedules) {
      const existingSchedule = await Schedule.findOne({
        batchId,
        semesterId,
        section,
      });

      let schedule;
      if (existingSchedule) {
        existingSchedule.entries = entries;
        existingSchedule.department = department;
        existingSchedule.status = 'draft';
        existingSchedule.generatedAt = new Date();
        await existingSchedule.save();
        schedule = existingSchedule;
      } else {
        schedule = new Schedule({
          batchId,
          semesterId,
          section,
          department,
          entries,
          status: 'draft',
          generatedAt: new Date(),
        });
        await schedule.save();
      }

      await schedule.populate('batchId');
      await schedule.populate('semesterId');
      savedSchedules.push(schedule);
    }

    res.json({
      schedules: savedSchedules,
      conflicts: result.totalConflicts,
      warnings: result.totalWarnings,
      message: `Generated ${savedSchedules.length} schedules successfully`,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
