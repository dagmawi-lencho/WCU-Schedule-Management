import Course from '../models/Course';
import Instructor from '../models/Instructor';
import Room from '../models/Room';
import Batch from '../models/Batch';
import { IScheduleEntry } from '../models/Schedule';

interface SchedulingOptions {
  batchId: string;
  semesterId: string;
  section: string;
  department?: string;
  days: string[]; // ['Monday', 'Tuesday', ...]
  morningShift: { start: string; end: string };
  afternoonShift: { start: string; end: string };
  periodsPerDay: number;
  // New features
  selectedRoomIds?: string[]; // Room selection during generation
  prioritySettings?: {
    majorCoursesShift: 'morning' | 'afternoon';
    commonCoursesShift: 'morning' | 'afternoon';
  };
  sessionType?: 'morning' | 'afternoon' | 'both'; // Session-based generation
  sessionClassCount?: {
    morning?: number;
    afternoon?: number;
  };
  singleSessionOnly?: boolean;
  singleSessionConfig?: {
    session: 'morning' | 'afternoon';
    classCount: number;
    timeRange: { start: string; end: string };
  };
}

interface Conflict {
  type: 'instructor' | 'room' | 'section';
  entry1: IScheduleEntry;
  entry2: IScheduleEntry;
  message: string;
}

export class SchedulingService {
  /**
   * Generate schedule with conflict detection and resolution
   */
  async generateSchedule(options: SchedulingOptions): Promise<{
    schedule: IScheduleEntry[];
    conflicts: Conflict[];
    warnings: string[];
  }> {
    const { 
      batchId, 
      semesterId, 
      section, 
      department, 
      days, 
      morningShift, 
      afternoonShift,
      selectedRoomIds,
      prioritySettings,
    } = options;

    // Fetch all required data from MongoDB
    const courseQuery: any = { batchId, semesterId };
    if (department) {
      courseQuery.department = department;
    }
    const courses = await Course.find(courseQuery).lean();

    if (courses.length === 0) {
      throw new Error(`No courses found for Batch ${batchId}, Semester ${semesterId}${department ? `, Department ${department}` : ''}`);
    }

    const instructors = await Instructor.find().lean();
    if (instructors.length === 0) {
      throw new Error('No instructors found. Please add instructors first.');
    }

    const roomQuery: any = { isAvailable: true };
    if (selectedRoomIds && selectedRoomIds.length > 0) {
      roomQuery._id = { $in: selectedRoomIds };
    }
    const availableRooms = await Room.find(roomQuery).lean();
    
    if (availableRooms.length === 0) {
      throw new Error('No available rooms found. Please initialize rooms first or select rooms.');
    }

    const labRooms = availableRooms.filter(r => r.roomType === 'lab');
    const classrooms = availableRooms.filter(r => r.roomType === 'classroom');

    if (classrooms.length === 0) {
      throw new Error('No classroom rooms available. Please add classroom rooms.');
    }

    // Apply priority settings if provided
    const majorPreferredShift = prioritySettings?.majorCoursesShift || 'morning';
    const commonPreferredShift = prioritySettings?.commonCoursesShift || 'afternoon';

    const schedule: IScheduleEntry[] = [];
    const conflicts: Conflict[] = [];
    const warnings: string[] = [];

    // Group courses by type
    const majorCourses = courses.filter(c => c.majorOrCommon === 'major');
    const commonCourses = courses.filter(c => c.majorOrCommon === 'common');

    // Helper function to check if a day/shift already has a class
    const hasClassInShift = (day: string, shift: 'morning' | 'afternoon'): boolean => {
      return schedule.some(e => e.day === day && e.shift === shift);
    };

    // Helper function to find next available day for a shift
    const findNextAvailableDay = (shift: 'morning' | 'afternoon', startDayIndex: number): string | null => {
      for (let i = 0; i < days.length; i++) {
        const dayIndex = (startDayIndex + i) % days.length;
        const day = days[dayIndex];
        if (!hasClassInShift(day, shift)) {
          return day;
        }
      }
      return null;
    };

    // Helper function to assign a course to a shift (preferred or fallback)
    const assignCourseToShift = (
      course: any,
      preferredShift: 'morning' | 'afternoon',
      preferredDayIndex: number,
      shiftConfig: { start: string; end: string },
      courseType: 'major' | 'common'
      ): { entry: IScheduleEntry | null; dayIndex: number; usedShift: 'morning' | 'afternoon' } => {
      const instructor = instructors.find(i => 
        (i._id?.toString ? i._id.toString() : i._id) === (course.instructorId?.toString ? course.instructorId.toString() : course.instructorId)
      );
      if (!instructor) {
        return { entry: null, dayIndex: preferredDayIndex, usedShift: preferredShift };
      }

      // Try preferred shift first
      let availableDay = findNextAvailableDay(preferredShift, preferredDayIndex);
      let shift = preferredShift;
      let shiftTime = preferredShift === 'morning' ? morningShift : afternoonShift;

      // If preferred shift not available, try fallback shift
      if (!availableDay) {
        const fallbackShift = preferredShift === 'morning' ? 'afternoon' : 'morning';
        availableDay = findNextAvailableDay(fallbackShift, preferredDayIndex);
        if (availableDay) {
          shift = fallbackShift;
          shiftTime = fallbackShift === 'morning' ? morningShift : afternoonShift;
          warnings.push(`${course.courseCode} scheduled in ${fallbackShift} (preferred ${preferredShift} unavailable)`);
        }
      }

      if (!availableDay) {
        return { entry: null, dayIndex: preferredDayIndex, usedShift: preferredShift };
      }

      const room = this.selectRoom(classrooms, schedule, { 
        day: availableDay, 
        startTime: shiftTime.start, 
        endTime: this.addHours(shiftTime.start, course.lectureHours) 
      });

      if (!room) {
        warnings.push(`No room available for ${course.courseCode} on ${availableDay} - skipping`);
        return { entry: null, dayIndex: preferredDayIndex, usedShift: preferredShift };
      }

      // Ensure room data is properly set
      const roomId = room._id?.toString ? room._id.toString() : room._id;
      const roomNumber = room.roomNumber || 'Room TBA';

      const entry: IScheduleEntry = {
        courseId: course._id,
        courseCode: course.courseCode || 'N/A',
        courseName: course.courseName || 'Course Name',
        instructorId: instructor._id as any,
        instructorName: instructor.fullName || 'TBA',
        roomId: roomId as any,
        roomNumber: roomNumber,
        day: availableDay as any,
        shift: shift,
        startTime: shiftTime.start,
        endTime: this.addHours(shiftTime.start, course.lectureHours),
        isLab: false,
      };

      const conflict = this.detectConflict(entry, schedule);
      if (conflict) {
        return { entry: null, dayIndex: preferredDayIndex, usedShift: preferredShift };
      }

      return { 
        entry, 
        dayIndex: (days.indexOf(availableDay) + 1) % days.length, 
        usedShift: shift 
      };
    };

    // Assign major courses - PREFER morning, but can use afternoon if needed
    let majorDayIndex = 0;
    for (const course of majorCourses) {
      const instructor = instructors.find(i => 
        (i._id?.toString ? i._id.toString() : i._id) === (course.instructorId?.toString ? course.instructorId.toString() : course.instructorId)
      );
      if (!instructor) {
        warnings.push(`Instructor not found for course ${course.courseCode}`);
        continue;
      }

      const instructorIdStr = instructor._id?.toString ? instructor._id.toString() : String(instructor._id);
      const currentLoad = this.calculateInstructorLoad(schedule, instructorIdStr, courses);
      if (currentLoad + course.creditHour > instructor.maxTeachingLoad) {
        warnings.push(`Instructor ${instructor.fullName} exceeds max load for ${course.courseCode}`);
        continue;
      }

      // Try morning first (preferred), fallback to afternoon
      const result = assignCourseToShift(course, 'morning', majorDayIndex, morningShift, 'major');
      if (result.entry) {
        schedule.push(result.entry);
        majorDayIndex = result.dayIndex;

        // Assign lab if applicable
        if (course.hasLab && course.labHours > 0) {
          const labDay = findNextAvailableDay(result.usedShift, majorDayIndex);
          if (labDay) {
            const labRoomsToUse = result.usedShift === 'morning' ? labRooms : labRooms;
            const shiftTime = result.usedShift === 'morning' ? morningShift : afternoonShift;
            const labRoom = this.selectRoom(labRoomsToUse, schedule, { 
              day: labDay, 
              startTime: shiftTime.start, 
              endTime: this.addHours(shiftTime.start, course.labHours) 
            });
            
            if (labRoom) {
              const labRoomId = labRoom._id?.toString ? labRoom._id.toString() : labRoom._id;
              const labRoomNumber = labRoom.roomNumber || 'Lab TBA';
              
              const labEntry: IScheduleEntry = {
                courseId: course._id,
                courseCode: course.courseCode || 'N/A',
                courseName: course.courseName || 'Course Name',
                instructorId: instructor._id as any,
                instructorName: instructor.fullName || 'TBA',
                roomId: labRoomId as any,
                roomNumber: labRoomNumber,
                day: labDay as any,
                shift: result.usedShift,
                startTime: shiftTime.start,
                endTime: this.addHours(shiftTime.start, course.labHours),
                isLab: true,
              };

              const labConflict = this.detectConflict(labEntry, schedule);
              if (!labConflict) {
                schedule.push(labEntry);
                majorDayIndex = (days.indexOf(labDay) + 1) % days.length;
              }
            }
          }
        }
      } else {
        warnings.push(`Could not schedule ${course.courseCode} - no available slots`);
      }
    }

    // Assign common courses - PREFER afternoon, but can use morning if needed
    let commonDayIndex = 0;
    for (const course of commonCourses) {
      const instructor = instructors.find(i => 
        (i._id?.toString ? i._id.toString() : i._id) === (course.instructorId?.toString ? course.instructorId.toString() : course.instructorId)
      );
      if (!instructor) {
        warnings.push(`Instructor not found for course ${course.courseCode}`);
        continue;
      }

      const instructorIdStr = instructor._id?.toString ? instructor._id.toString() : String(instructor._id);
      const currentLoad = this.calculateInstructorLoad(schedule, instructorIdStr, courses);
      if (currentLoad + course.creditHour > instructor.maxTeachingLoad) {
        warnings.push(`Instructor ${instructor.fullName} exceeds max load for ${course.courseCode}`);
        continue;
      }

      // Try afternoon first (preferred), fallback to morning
      const result = assignCourseToShift(course, 'afternoon', commonDayIndex, afternoonShift, 'common');
      if (result.entry) {
        schedule.push(result.entry);
        commonDayIndex = result.dayIndex;
      } else {
        warnings.push(`Could not schedule ${course.courseCode} - no available slots`);
      }
    }

    return { schedule, conflicts, warnings };
  }

  /**
   * Generate schedules for all batches at once
   */
  async generateAllBatches(options: {
    semesterId: string;
    department?: string;
    days: string[];
    morningShift: { start: string; end: string };
    afternoonShift: { start: string; end: string };
    selectedRoomIds?: string[];
    prioritySettings?: {
      majorCoursesShift: 'morning' | 'afternoon';
      commonCoursesShift: 'morning' | 'afternoon';
    };
  }): Promise<{
    schedules: Array<{ batchId: string; section: string; schedule: IScheduleEntry[]; conflicts: Conflict[]; warnings: string[] }>;
    totalConflicts: Conflict[];
    totalWarnings: string[];
  }> {
    const batches = await Batch.find().lean();
    const allSchedules: Array<{ batchId: string; section: string; schedule: IScheduleEntry[]; conflicts: Conflict[]; warnings: string[] }> = [];
    const totalConflicts: Conflict[] = [];
    const totalWarnings: string[] = [];

    for (const batch of batches) {
      for (const section of batch.sections) {
        try {
          const result = await this.generateSchedule({
            batchId: batch._id?.toString ? batch._id.toString() : String(batch._id),
            semesterId: options.semesterId,
            section,
            department: options.department,
            days: options.days,
            morningShift: options.morningShift,
            afternoonShift: options.afternoonShift,
            periodsPerDay: 2,
            selectedRoomIds: options.selectedRoomIds,
            prioritySettings: options.prioritySettings,
          });

          allSchedules.push({
            batchId: batch._id?.toString ? batch._id.toString() : String(batch._id),
            section,
            schedule: result.schedule,
            conflicts: result.conflicts,
            warnings: result.warnings,
          });

          totalConflicts.push(...result.conflicts);
          totalWarnings.push(...result.warnings);
        } catch (error: any) {
          totalWarnings.push(`Failed to generate schedule for Batch ${batch.batchNumber}, Section ${section}: ${error.message}`);
        }
      }
    }

    return {
      schedules: allSchedules,
      totalConflicts,
      totalWarnings,
    };
  }

  /**
   * Generate schedule for single session only
   */
  private generateSingleSessionSchedule(config: {
    courses: any[];
    instructors: any[];
    classrooms: any[];
    labRooms: any[];
    days: string[];
    sessionConfig: { session: 'morning' | 'afternoon'; classCount: number; timeRange: { start: string; end: string } };
    majorPreferredShift: 'morning' | 'afternoon';
    commonPreferredShift: 'morning' | 'afternoon';
  }): { schedule: IScheduleEntry[]; conflicts: Conflict[]; warnings: string[] } {
    const { courses, instructors, classrooms, days, sessionConfig } = config;
    const schedule: IScheduleEntry[] = [];
    const conflicts: Conflict[] = [];
    const warnings: string[] = [];

    const allCourses = [...courses];
    const coursesToSchedule = allCourses.slice(0, sessionConfig.classCount);
    let dayIndex = 0;

    for (const course of coursesToSchedule) {
      const instructor = instructors.find(i => 
        (i._id?.toString ? i._id.toString() : i._id) === (course.instructorId?.toString ? course.instructorId.toString() : course.instructorId)
      );
      if (!instructor) {
        warnings.push(`Instructor not found for course ${course.courseCode}`);
        continue;
      }

      const day = days[dayIndex % days.length];
      const room = this.selectRoom(classrooms, schedule, {
        day,
        startTime: sessionConfig.timeRange.start,
        endTime: sessionConfig.timeRange.end,
      });

      if (!room) {
        warnings.push(`No room available for ${course.courseCode}`);
        dayIndex++;
        continue;
      }

      const roomId = room._id?.toString ? room._id.toString() : room._id;
      const roomNumber = room.roomNumber || 'Room TBA';

      const entry: IScheduleEntry = {
        courseId: course._id,
        courseCode: course.courseCode || 'N/A',
        courseName: course.courseName || 'Course Name',
        instructorId: instructor._id as any,
        instructorName: instructor.fullName || 'TBA',
        roomId: roomId as any,
        roomNumber: roomNumber,
        day: day as any,
        shift: sessionConfig.session,
        startTime: sessionConfig.timeRange.start,
        endTime: sessionConfig.timeRange.end,
        isLab: false,
      };

      const conflict = this.detectConflict(entry, schedule);
      if (conflict) {
        conflicts.push(conflict);
        warnings.push(`Conflict detected for ${course.courseCode}: ${conflict.message}`);
        dayIndex++;
        continue;
      }

      schedule.push(entry);
      dayIndex++;
    }

    return { schedule, conflicts, warnings };
  }

  /**
   * Generate schedule based on session type and class count
   */
  private generateSessionBasedSchedule(config: {
    courses: any[];
    instructors: any[];
    classrooms: any[];
    labRooms: any[];
    days: string[];
    sessionType: 'morning' | 'afternoon';
    sessionClassCount: { morning?: number; afternoon?: number };
    morningShift: { start: string; end: string };
    afternoonShift: { start: string; end: string };
    majorPreferredShift: 'morning' | 'afternoon';
    commonPreferredShift: 'morning' | 'afternoon';
  }): { schedule: IScheduleEntry[]; conflicts: Conflict[]; warnings: string[] } {
    const { courses, instructors, classrooms, days, sessionType, sessionClassCount, morningShift, afternoonShift } = config;
    const schedule: IScheduleEntry[] = [];
    const conflicts: Conflict[] = [];
    const warnings: string[] = [];

    const allCourses = [...courses];
    const shift = sessionType === 'morning' ? morningShift : afternoonShift;
    const maxClasses = sessionClassCount[sessionType] || courses.length;
    let dayIndex = 0;
    let classesScheduled = 0;

    const coursesToSchedule = allCourses.slice(0, maxClasses);

    for (const course of coursesToSchedule) {
      if (classesScheduled >= maxClasses) break;

      const instructor = instructors.find(i => 
        (i._id?.toString ? i._id.toString() : i._id) === (course.instructorId?.toString ? course.instructorId.toString() : course.instructorId)
      );
      if (!instructor) {
        warnings.push(`Instructor not found for course ${course.courseCode}`);
        continue;
      }

      const day = days[dayIndex % days.length];
      const room = this.selectRoom(classrooms, schedule, {
        day,
        startTime: shift.start,
        endTime: this.addHours(shift.start, course.lectureHours),
      });

      if (!room) {
        warnings.push(`No room available for ${course.courseCode}`);
        dayIndex++;
        continue;
      }

      const roomId = room._id?.toString ? room._id.toString() : room._id;
      const roomNumber = room.roomNumber || 'Room TBA';

      const entry: IScheduleEntry = {
        courseId: course._id,
        courseCode: course.courseCode || 'N/A',
        courseName: course.courseName || 'Course Name',
        instructorId: instructor._id as any,
        instructorName: instructor.fullName || 'TBA',
        roomId: roomId as any,
        roomNumber: roomNumber,
        day: day as any,
        shift: sessionType,
        startTime: shift.start,
        endTime: this.addHours(shift.start, course.lectureHours),
        isLab: false,
      };

      const conflict = this.detectConflict(entry, schedule);
      if (conflict) {
        conflicts.push(conflict);
        warnings.push(`Conflict detected for ${course.courseCode}: ${conflict.message}`);
        dayIndex++;
        continue;
      }

      schedule.push(entry);
      classesScheduled++;
      dayIndex++;
    }

    return { schedule, conflicts, warnings };
  }

  /**
   * Generate lecture slots based on credit hours
   */
  private generateLectureSlots(
    course: any,
    days: string[],
    shift: { start: string; end: string },
    isLab: boolean
  ): Array<{ day: string; startTime: string; endTime: string }> {
    const slots: Array<{ day: string; startTime: string; endTime: string }> = [];
    const hours = isLab ? course.labHours : course.lectureHours;
    const hoursPerSlot = 2; // Assume 2 hours per slot

    let remainingHours = hours;
    let dayIndex = 0;

    while (remainingHours > 0 && dayIndex < days.length) {
      const day = days[dayIndex];
      const slotHours = Math.min(hoursPerSlot, remainingHours);
      
      slots.push({
        day,
        startTime: shift.start,
        endTime: this.addHours(shift.start, slotHours),
      });

      remainingHours -= slotHours;
      dayIndex++;
    }

    return slots;
  }

  /**
   * Generate lecture slots distributed across days starting from a specific day index
   */
  private generateLectureSlotsDistributed(
    course: any,
    days: string[],
    shift: { start: string; end: string },
    isLab: boolean,
    startDayIndex: number
  ): Array<{ day: string; startTime: string; endTime: string }> {
    const slots: Array<{ day: string; startTime: string; endTime: string }> = [];
    const hours = isLab ? course.labHours : course.lectureHours;
    const hoursPerSlot = 3; // 3 hours per slot for better distribution

    let remainingHours = hours;
    let dayIndex = startDayIndex;
    let slotsCreated = 0;

    // Distribute across different days, one slot per day
    while (remainingHours > 0 && slotsCreated < days.length && slotsCreated < Math.ceil(hours / hoursPerSlot)) {
      const day = days[dayIndex % days.length];
      const slotHours = Math.min(hoursPerSlot, remainingHours);
      
      slots.push({
        day,
        startTime: shift.start,
        endTime: this.addHours(shift.start, slotHours),
      });

      remainingHours -= slotHours;
      dayIndex++;
      slotsCreated++;
    }

    return slots;
  }

  /**
   * Generate lab slots
   */
  private generateLabSlots(
    course: any,
    days: string[],
    shift: { start: string; end: string }
  ): Array<{ day: string; startTime: string; endTime: string }> {
    return this.generateLectureSlots(course, days, shift, true);
  }

  /**
   * Generate lab slots distributed across days
   */
  private generateLabSlotsDistributed(
    course: any,
    days: string[],
    shift: { start: string; end: string },
    startDayIndex: number
  ): Array<{ day: string; startTime: string; endTime: string }> {
    return this.generateLectureSlotsDistributed(course, days, shift, true, startDayIndex);
  }

  /**
   * Select an available room
   */
  private selectRoom(
    rooms: any[],
    schedule: IScheduleEntry[],
    slot: { day: string; startTime: string; endTime: string }
  ): any {
    if (!rooms || rooms.length === 0) {
      return null;
    }

    const occupiedRooms = schedule
      .filter(e => e.day === slot.day && this.timeOverlaps(e.startTime, e.endTime, slot.startTime, slot.endTime))
      .map(e => {
        const roomId = e.roomId?.toString ? e.roomId.toString() : e.roomId;
        return roomId;
      });

    // Try to find an available room
    let availableRoom = rooms.find(r => {
      const roomId = r._id?.toString ? r._id.toString() : r._id;
      return !occupiedRooms.some(occId => {
        const occIdStr = occId?.toString ? occId.toString() : occId;
        return occIdStr === roomId;
      });
    });

    // If no room is available, use the first room anyway (allow double booking detection later)
    if (!availableRoom && rooms.length > 0) {
      availableRoom = rooms[0];
    }

    return availableRoom;
  }

  /**
   * Detect conflicts in schedule
   */
  private detectConflict(newEntry: IScheduleEntry, schedule: IScheduleEntry[]): Conflict | null {
    for (const existing of schedule) {
      const existingInstructorId = existing.instructorId?.toString ? existing.instructorId.toString() : existing.instructorId;
      const newInstructorId = newEntry.instructorId?.toString ? newEntry.instructorId.toString() : newEntry.instructorId;
      const existingRoomId = existing.roomId?.toString ? existing.roomId.toString() : existing.roomId;
      const newRoomId = newEntry.roomId?.toString ? newEntry.roomId.toString() : newEntry.roomId;
      
      // Check instructor overlap
      if (
        existingInstructorId === newInstructorId &&
        existing.day === newEntry.day &&
        this.timeOverlaps(existing.startTime, existing.endTime, newEntry.startTime, newEntry.endTime)
      ) {
        return {
          type: 'instructor',
          entry1: existing,
          entry2: newEntry,
          message: `Instructor ${newEntry.instructorName} has overlapping classes`,
        };
      }

      // Check room overlap
      if (
        existingRoomId === newRoomId &&
        existing.day === newEntry.day &&
        this.timeOverlaps(existing.startTime, existing.endTime, newEntry.startTime, newEntry.endTime)
      ) {
        return {
          type: 'room',
          entry1: existing,
          entry2: newEntry,
          message: `Room ${newEntry.roomNumber} is double-booked`,
        };
      }
    }

    return null;
  }

  /**
   * Find alternative slot for conflicted entry
   */
  private findAlternativeSlot(
    entry: IScheduleEntry,
    schedule: IScheduleEntry[],
    days: string[],
    shift: { start: string; end: string }
  ): { day: string; startTime: string; endTime: string } | null {
    for (const day of days) {
      if (day === entry.day) continue;

      const testSlot = {
        day,
        startTime: shift.start,
        endTime: entry.endTime,
      };

      const testEntry = { ...entry, day: day as any };
      if (!this.detectConflict(testEntry, schedule)) {
        return testSlot;
      }
    }

    return null;
  }

  /**
   * Check if two time ranges overlap
   */
  private timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
    const s1 = this.timeToMinutes(start1);
    const e1 = this.timeToMinutes(end1);
    const s2 = this.timeToMinutes(start2);
    const e2 = this.timeToMinutes(end2);

    return s1 < e2 && s2 < e1;
  }

  /**
   * Convert time string to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Add hours to time string
   */
  private addHours(time: string, hours: number): string {
    const [h, m] = time.split(':').map(Number);
    const newHours = h + hours;
    return `${String(newHours).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  /**
   * Calculate current instructor load
   */
  private calculateInstructorLoad(schedule: IScheduleEntry[], instructorId: string, courses: any[]): number {
    const instructorIdStr = String(instructorId);
    const instructorEntries = schedule.filter(e => {
      const entryInstructorId = e.instructorId?.toString ? e.instructorId.toString() : String(e.instructorId);
      return entryInstructorId === instructorIdStr;
    });
    let totalLoad = 0;
    
    for (const entry of instructorEntries) {
      const entryCourseId = entry.courseId?.toString ? entry.courseId.toString() : entry.courseId;
      const course = courses.find(c => {
        const courseId = c._id?.toString ? c._id.toString() : c._id;
        return courseId === entryCourseId;
      });
      if (course) {
        totalLoad += course.creditHour;
      }
    }
    
    return totalLoad;
  }

}

// Export singleton instance
const schedulingService = new SchedulingService();
export default schedulingService;
