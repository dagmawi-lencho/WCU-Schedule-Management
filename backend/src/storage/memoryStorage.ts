// In-Memory Storage - No Database Required!
// Data persists during server session, resets on restart

interface Batch {
  _id: string;
  batchNumber: string;
  numberOfYears: number;
  sections: string[];
  departments: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Semester {
  _id: string;
  batchId: string;
  semesterNumber: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Course {
  _id: string;
  courseName: string;
  courseCode: string;
  creditHour: number;
  majorOrCommon: 'major' | 'common';
  semesterId: string;
  batchId: string;
  hasLab: boolean;
  lectureHours: number;
  labHours: number;
  instructorId: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Instructor {
  _id: string;
  userId?: string;
  fullName: string;
  phoneNumber?: string;
  idNumber: string;
  profession?: string;
  position?: string;
  maxTeachingLoad: number;
  specialization: string[];
  assignedCourses?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Room {
  _id: string;
  roomNumber: string;
  roomType: 'lab' | 'classroom';
  capacity: number;
  isAvailable: boolean;
  facilities?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ScheduleEntry {
  courseId: string;
  courseCode: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  roomId: string;
  roomNumber: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  shift: 'morning' | 'afternoon';
  startTime: string;
  endTime: string;
  isLab: boolean;
}

interface Schedule {
  _id: string;
  batchId: string;
  semesterId: string;
  section: string;
  department?: string;
  entries: ScheduleEntry[];
  status: 'draft' | 'published';
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ClassRepresentative {
  _id: string;
  batchId: string;
  section: string;
  fullName: string;
  idNumber: string;
  phoneNumber?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Department {
  _id: string;
  name: string;
  code: string; // Short name/code - Required
  createdAt: Date;
  updatedAt: Date;
}

class MemoryStorage {
  private batches: Batch[] = [];
  private semesters: Semester[] = [];
  private courses: Course[] = [];
  private instructors: Instructor[] = [];
  private rooms: Room[] = [];
  private schedules: Schedule[] = [];
  private classRepresentatives: ClassRepresentative[] = [];
  private departments: Department[] = [];
  private idCounter = { batch: 1, semester: 1, course: 1, instructor: 1, room: 1, schedule: 1, classRepresentative: 1, department: 1 };

  // Generate unique ID
  private generateId(type: keyof typeof this.idCounter): string {
    return `${type}_${Date.now()}_${this.idCounter[type]++}`;
  }

  // ========== BATCHES ==========
  createBatch(data: Omit<Batch, '_id' | 'createdAt' | 'updatedAt'>): Batch {
    const batch: Batch = {
      _id: this.generateId('batch'),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.batches.push(batch);
    return batch;
  }

  getBatches(): Batch[] {
    return [...this.batches].sort((a, b) => b.batchNumber.localeCompare(a.batchNumber));
  }

  getBatchById(id: string): Batch | undefined {
    return this.batches.find(b => b._id === id);
  }

  updateBatch(id: string, data: Partial<Batch>): Batch | null {
    const index = this.batches.findIndex(b => b._id === id);
    if (index === -1) return null;
    this.batches[index] = { ...this.batches[index], ...data, updatedAt: new Date() };
    return this.batches[index];
  }

  deleteBatch(id: string): boolean {
    const index = this.batches.findIndex(b => b._id === id);
    if (index === -1) return false;
    this.batches.splice(index, 1);
    return true;
  }

  // ========== SEMESTERS ==========
  createSemester(data: Omit<Semester, '_id' | 'createdAt' | 'updatedAt'>): Semester {
    const semester: Semester = {
      _id: this.generateId('semester'),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.semesters.push(semester);
    return semester;
  }

  getSemesters(batchId?: string): Semester[] {
    let result = [...this.semesters];
    if (batchId) {
      result = result.filter(s => s.batchId === batchId);
    }
    return result.sort((a, b) => a.semesterNumber - b.semesterNumber);
  }

  getSemesterById(id: string): Semester | undefined {
    return this.semesters.find(s => s._id === id);
  }

  updateSemester(id: string, data: Partial<Semester>): Semester | null {
    const index = this.semesters.findIndex(s => s._id === id);
    if (index === -1) return null;
    this.semesters[index] = { ...this.semesters[index], ...data, updatedAt: new Date() };
    return this.semesters[index];
  }

  deleteSemester(id: string): boolean {
    const index = this.semesters.findIndex(s => s._id === id);
    if (index === -1) return false;
    this.semesters.splice(index, 1);
    return true;
  }

  // ========== COURSES ==========
  createCourse(data: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>): Course {
    const course: Course = {
      _id: this.generateId('course'),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.courses.push(course);
    return course;
  }

  getCourses(filter?: { batchId?: string; semesterId?: string; department?: string }): Course[] {
    let result = [...this.courses];
    if (filter?.batchId) {
      result = result.filter(c => c.batchId === filter.batchId);
    }
    if (filter?.semesterId) {
      result = result.filter(c => c.semesterId === filter.semesterId);
    }
    if (filter?.department) {
      result = result.filter(c => c.department === filter.department);
    }
    return result;
  }

  getCourseById(id: string): Course | undefined {
    return this.courses.find(c => c._id === id);
  }

  updateCourse(id: string, data: Partial<Course>): Course | null {
    const index = this.courses.findIndex(c => c._id === id);
    if (index === -1) return null;
    this.courses[index] = { ...this.courses[index], ...data, updatedAt: new Date() };
    return this.courses[index];
  }

  deleteCourse(id: string): boolean {
    const index = this.courses.findIndex(c => c._id === id);
    if (index === -1) return false;
    this.courses.splice(index, 1);
    return true;
  }

  // ========== INSTRUCTORS ==========
  createInstructor(data: Omit<Instructor, '_id' | 'createdAt' | 'updatedAt'>): Instructor {
    const instructor: Instructor = {
      _id: this.generateId('instructor'),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.instructors.push(instructor);
    return instructor;
  }

  getInstructors(): Instructor[] {
    return [...this.instructors];
  }

  getInstructorById(id: string): Instructor | undefined {
    return this.instructors.find(i => i._id === id);
  }

  updateInstructor(id: string, data: Partial<Instructor>): Instructor | null {
    const index = this.instructors.findIndex(i => i._id === id);
    if (index === -1) return null;
    this.instructors[index] = { ...this.instructors[index], ...data, updatedAt: new Date() };
    return this.instructors[index];
  }

  deleteInstructor(id: string): boolean {
    const index = this.instructors.findIndex(i => i._id === id);
    if (index === -1) return false;
    this.instructors.splice(index, 1);
    return true;
  }

  // ========== ROOMS ==========
  createRoom(data: Omit<Room, '_id' | 'createdAt' | 'updatedAt' | 'isAvailable'> & { isAvailable?: boolean }): Room {
    const room: Room = {
      _id: this.generateId('room'),
      ...data,
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.rooms.push(room);
    return room;
  }

  getRooms(filter?: { roomType?: string }): Room[] {
    let result = [...this.rooms];
    if (filter?.roomType) {
      result = result.filter(r => r.roomType === filter.roomType);
    }
    return result.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  }

  getRoomById(id: string): Room | undefined {
    return this.rooms.find(r => r._id === id);
  }

  updateRoom(id: string, data: Partial<Room>): Room | null {
    const index = this.rooms.findIndex(r => r._id === id);
    if (index === -1) return null;
    this.rooms[index] = { ...this.rooms[index], ...data, updatedAt: new Date() };
    return this.rooms[index];
  }

  deleteRoom(id: string): boolean {
    const index = this.rooms.findIndex(r => r._id === id);
    if (index === -1) return false;
    this.rooms.splice(index, 1);
    return true;
  }

  // ========== SCHEDULES ==========
  createSchedule(data: Omit<Schedule, '_id' | 'createdAt' | 'updatedAt' | 'generatedAt'>): Schedule {
    const schedule: Schedule = {
      _id: this.generateId('schedule'),
      generatedAt: new Date(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.schedules.push(schedule);
    return schedule;
  }

  getSchedules(filter?: { batchId?: string; semesterId?: string; section?: string }): Schedule[] {
    let result = [...this.schedules];
    if (filter?.batchId) {
      result = result.filter(s => s.batchId === filter.batchId);
    }
    if (filter?.semesterId) {
      result = result.filter(s => s.semesterId === filter.semesterId);
    }
    if (filter?.section) {
      result = result.filter(s => s.section === filter.section);
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getScheduleById(id: string): Schedule | undefined {
    return this.schedules.find(s => s._id === id);
  }

  updateSchedule(id: string, data: Partial<Schedule>): Schedule | null {
    const index = this.schedules.findIndex(s => s._id === id);
    if (index === -1) return null;
    this.schedules[index] = { ...this.schedules[index], ...data, updatedAt: new Date() };
    return this.schedules[index];
  }

  deleteSchedule(id: string): boolean {
    const index = this.schedules.findIndex(s => s._id === id);
    if (index === -1) return false;
    this.schedules.splice(index, 1);
    return true;
  }

  // ========== CLASS REPRESENTATIVES ==========
  createClassRepresentative(data: Omit<ClassRepresentative, '_id' | 'createdAt' | 'updatedAt'>): ClassRepresentative {
    const rep: ClassRepresentative = {
      _id: this.generateId('classRepresentative'),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.classRepresentatives.push(rep);
    return rep;
  }

  getClassRepresentatives(filter?: { batchId?: string; section?: string }): ClassRepresentative[] {
    let result = [...this.classRepresentatives];
    if (filter?.batchId) {
      result = result.filter(r => r.batchId === filter.batchId);
    }
    if (filter?.section) {
      result = result.filter(r => r.section === filter.section);
    }
    return result.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  getClassRepresentativeById(id: string): ClassRepresentative | undefined {
    return this.classRepresentatives.find(r => r._id === id);
  }

  updateClassRepresentative(id: string, data: Partial<ClassRepresentative>): ClassRepresentative | null {
    const index = this.classRepresentatives.findIndex(r => r._id === id);
    if (index === -1) return null;
    this.classRepresentatives[index] = { ...this.classRepresentatives[index], ...data, updatedAt: new Date() };
    return this.classRepresentatives[index];
  }

  deleteClassRepresentative(id: string): boolean {
    const index = this.classRepresentatives.findIndex(r => r._id === id);
    if (index === -1) return false;
    this.classRepresentatives.splice(index, 1);
    return true;
  }

  // ========== DEPARTMENTS ==========
  createDepartment(data: Omit<Department, '_id' | 'createdAt' | 'updatedAt'>): Department {
    if (!data.name || !data.code) {
      throw new Error('Department name and code are required');
    }
    
    // Check for duplicate code
    if (this.departments.some(d => d.code.toLowerCase() === data.code.toLowerCase())) {
      throw new Error(`Department with code "${data.code}" already exists`);
    }
    
    // Check for duplicate name
    if (this.departments.some(d => d.name.toLowerCase() === data.name.toLowerCase())) {
      throw new Error(`Department "${data.name}" already exists`);
    }
    
    const department: Department = {
      _id: this.generateId('department'),
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.departments.push(department);
    return department;
  }

  getDepartments(): Department[] {
    return [...this.departments].sort((a, b) => a.name.localeCompare(b.name));
  }

  getDepartmentById(id: string): Department | undefined {
    return this.departments.find(d => d._id === id);
  }

  getDepartmentByName(name: string): Department | undefined {
    return this.departments.find(d => d.name.toLowerCase() === name.toLowerCase());
  }

  updateDepartment(id: string, data: Partial<Department>): Department | null {
    const index = this.departments.findIndex(d => d._id === id);
    if (index === -1) return null;
    
    // Check for duplicate code (excluding current department)
    const codeToCheck = data.code;
    if (codeToCheck && this.departments.some((d, i) => i !== index && d.code.toLowerCase() === codeToCheck.toLowerCase())) {
      throw new Error(`Department with code "${codeToCheck}" already exists`);
    }
    
    // Check for duplicate name (excluding current department)
    const nameToCheck = data.name;
    if (nameToCheck && this.departments.some((d, i) => i !== index && d.name.toLowerCase() === nameToCheck.toLowerCase())) {
      throw new Error(`Department "${nameToCheck}" already exists`);
    }
    
    const updated: Department = {
      ...this.departments[index],
      ...(data.name && { name: data.name.trim() }),
      ...(data.code && { code: data.code.trim().toUpperCase() }),
      updatedAt: new Date(),
    };
    
    this.departments[index] = updated;
    return this.departments[index];
  }

  deleteDepartment(id: string): boolean {
    const index = this.departments.findIndex(d => d._id === id);
    if (index === -1) return false;
    this.departments.splice(index, 1);
    return true;
  }

  // ========== RESET ALL DATA ==========
  reset(): void {
    this.batches = [];
    this.semesters = [];
    this.courses = [];
    this.instructors = [];
    this.rooms = [];
    this.schedules = [];
    this.classRepresentatives = [];
    this.departments = [];
    this.idCounter = { batch: 1, semester: 1, course: 1, instructor: 1, room: 1, schedule: 1, classRepresentative: 1, department: 1 };
  }

  // ========== INITIALIZE WITH SAMPLE DATA ==========
  // REMOVED: Sample data initialization - using real database now
  initializeSampleData(): void {
    // This function is disabled - using MongoDB for real data storage
    return;
    // Create Departments (must be created first)
    const dept1 = this.createDepartment({
      name: 'Software Engineering',
      code: 'SE',
    });
    
    const dept2 = this.createDepartment({
      name: 'Computer Science',
      code: 'CS',
    });
    
    const dept3 = this.createDepartment({
      name: 'Information Technology',
      code: 'IT',
    });
    
    const dept4 = this.createDepartment({
      name: 'Electrical Engineering',
      code: 'EE',
    });
    
    const dept5 = this.createDepartment({
      name: 'Mechanical Engineering',
      code: 'ME',
    });

    // Create Batch 2018
    const batch = this.createBatch({
      batchNumber: '2018',
      numberOfYears: 4,
      sections: ['A', 'B'],
      departments: [dept1.name],
    });

    // Create First Semester
    const semester = this.createSemester({
      batchId: batch._id,
      semesterNumber: 1,
      name: 'First Semester',
      isActive: true,
    });

    // Create Instructors
    const instructor1 = this.createInstructor({
      fullName: 'Fozia A.',
      idNumber: 'INS001',
      phoneNumber: '+251900000000',
      profession: 'MSc in Software Engineering',
      position: 'Lecturer',
      maxTeachingLoad: 15,
      specialization: ['major', 'common'],
    });

    const instructor2 = this.createInstructor({
      fullName: 'Senedu G.',
      idNumber: 'INS002',
      phoneNumber: '+251900000000',
      profession: 'MSc in Software Engineering',
      position: 'Lecturer',
      maxTeachingLoad: 15,
      specialization: ['major', 'common'],
    });

    const instructor3 = this.createInstructor({
      fullName: 'Alemayehu Sh.',
      idNumber: 'INS003',
      phoneNumber: '+251900000000',
      profession: 'MSc in Software Engineering',
      position: 'Lecturer',
      maxTeachingLoad: 15,
      specialization: ['major', 'common'],
    });

    const tbaInstructor = this.createInstructor({
      fullName: 'TBA',
      idNumber: 'TBA001',
      phoneNumber: '+251900000000',
      profession: 'TBA',
      position: 'TBA',
      maxTeachingLoad: 20,
      specialization: ['major', 'common'],
    });

    // Create Rooms
    const rooms = [
      { roomNumber: 'Lab1', roomType: 'lab' as const, capacity: 30 },
      { roomNumber: 'Lab2', roomType: 'lab' as const, capacity: 30 },
      { roomNumber: 'Lab3', roomType: 'lab' as const, capacity: 30 },
      { roomNumber: 'Lab4', roomType: 'lab' as const, capacity: 30 },
      { roomNumber: 'CR1', roomType: 'classroom' as const, capacity: 50 },
      { roomNumber: 'CR2', roomType: 'classroom' as const, capacity: 50 },
      { roomNumber: 'CR3', roomType: 'classroom' as const, capacity: 50 },
      { roomNumber: 'CR4', roomType: 'classroom' as const, capacity: 50 },
      { roomNumber: 'CR5', roomType: 'classroom' as const, capacity: 50 },
      { roomNumber: 'CR6', roomType: 'classroom' as const, capacity: 50 },
      { roomNumber: 'CR7', roomType: 'classroom' as const, capacity: 50 },
    ];
    rooms.forEach(room => this.createRoom(room));

    // Create Courses
    const courses = [
      {
        courseName: 'Fundamentals of Database Systems',
        courseCode: 'SE202',
        creditHour: 5,
        majorOrCommon: 'major' as const,
        semesterId: semester._id,
        batchId: batch._id,
        hasLab: true,
        lectureHours: 2,
        labHours: 3,
        instructorId: instructor1._id,
        department: 'Software Engineering',
      },
      {
        courseName: 'Discrete Mathematics and Combinatory',
        courseCode: 'SE203',
        creditHour: 3,
        majorOrCommon: 'common' as const,
        semesterId: semester._id,
        batchId: batch._id,
        hasLab: false,
        lectureHours: 3,
        labHours: 0,
        instructorId: tbaInstructor._id,
        department: 'Software Engineering',
      },
      {
        courseName: 'Fundamentals of Software Engineering',
        courseCode: 'SE204',
        creditHour: 5,
        majorOrCommon: 'major' as const,
        semesterId: semester._id,
        batchId: batch._id,
        hasLab: true,
        lectureHours: 2,
        labHours: 3,
        instructorId: instructor2._id,
        department: 'Software Engineering',
      },
      {
        courseName: 'Computer Programming II',
        courseCode: 'SE205',
        creditHour: 5,
        majorOrCommon: 'major' as const,
        semesterId: semester._id,
        batchId: batch._id,
        hasLab: true,
        lectureHours: 2,
        labHours: 3,
        instructorId: instructor3._id,
        department: 'Software Engineering',
      },
      {
        courseName: 'Global Trends',
        courseCode: 'GT101',
        creditHour: 3,
        majorOrCommon: 'common' as const,
        semesterId: semester._id,
        batchId: batch._id,
        hasLab: false,
        lectureHours: 3,
        labHours: 0,
        instructorId: tbaInstructor._id,
        department: 'Software Engineering',
      },
      {
        courseName: 'Introduction to Economics',
        courseCode: 'EC101',
        creditHour: 3,
        majorOrCommon: 'common' as const,
        semesterId: semester._id,
        batchId: batch._id,
        hasLab: false,
        lectureHours: 3,
        labHours: 0,
        instructorId: tbaInstructor._id,
        department: 'Software Engineering',
      },
      {
        courseName: 'Inclusiveness',
        courseCode: 'IN101',
        creditHour: 3,
        majorOrCommon: 'common' as const,
        semesterId: semester._id,
        batchId: batch._id,
        hasLab: false,
        lectureHours: 3,
        labHours: 0,
        instructorId: tbaInstructor._id,
        department: 'Software Engineering',
      },
    ];
    courses.forEach(course => this.createCourse(course));

    // Create Sample Schedule
    const labRooms = this.getRooms({ roomType: 'lab' });
    const classroomRooms = this.getRooms({ roomType: 'classroom' });
    const allCourses = this.getCourses({ batchId: batch._id, semesterId: semester._id });

    const scheduleEntries: ScheduleEntry[] = [
      // Monday
      {
        courseId: allCourses.find(c => c.courseCode === 'SE202')?._id || '',
        courseCode: 'SE202',
        courseName: 'Fundamentals of Database Systems',
        instructorId: instructor1._id,
        instructorName: 'Fozia A.',
        roomId: classroomRooms[0]?._id || '',
        roomNumber: 'CR1',
        day: 'Monday' as const,
        shift: 'afternoon' as const,
        startTime: '14:00',
        endTime: '17:00',
        isLab: false,
      },
      {
        courseId: allCourses.find(c => c.courseCode === 'SE202')?._id || '',
        courseCode: 'SE202',
        courseName: 'Fundamentals of Database Systems',
        instructorId: instructor1._id,
        instructorName: 'Fozia A.',
        roomId: labRooms[0]?._id || '',
        roomNumber: 'Lab1',
        day: 'Monday' as const,
        shift: 'morning' as const,
        startTime: '08:00',
        endTime: '11:00',
        isLab: true,
      },
      // Tuesday
      {
        courseId: allCourses.find(c => c.courseCode === 'SE203')?._id || '',
        courseCode: 'SE203',
        courseName: 'Discrete Mathematics and Combinatory',
        instructorId: tbaInstructor._id,
        instructorName: 'TBA',
        roomId: classroomRooms[1]?._id || '',
        roomNumber: 'CR2',
        day: 'Tuesday' as const,
        shift: 'afternoon' as const,
        startTime: '14:00',
        endTime: '17:00',
        isLab: false,
      },
      {
        courseId: allCourses.find(c => c.courseCode === 'EC101')?._id || '',
        courseCode: 'EC101',
        courseName: 'Introduction to Economics',
        instructorId: tbaInstructor._id,
        instructorName: 'TBA',
        roomId: classroomRooms[2]?._id || '',
        roomNumber: 'CR3',
        day: 'Tuesday' as const,
        shift: 'morning' as const,
        startTime: '08:00',
        endTime: '11:00',
        isLab: false,
      },
      // Wednesday
      {
        courseId: allCourses.find(c => c.courseCode === 'SE204')?._id || '',
        courseCode: 'SE204',
        courseName: 'Fundamentals of Software Engineering',
        instructorId: instructor2._id,
        instructorName: 'Senedu G.',
        roomId: classroomRooms[0]?._id || '',
        roomNumber: 'CR1',
        day: 'Wednesday' as const,
        shift: 'afternoon' as const,
        startTime: '14:00',
        endTime: '17:00',
        isLab: false,
      },
      {
        courseId: allCourses.find(c => c.courseCode === 'IN101')?._id || '',
        courseCode: 'IN101',
        courseName: 'Inclusiveness',
        instructorId: tbaInstructor._id,
        instructorName: 'TBA',
        roomId: classroomRooms[3]?._id || '',
        roomNumber: 'CR4',
        day: 'Wednesday' as const,
        shift: 'morning' as const,
        startTime: '08:00',
        endTime: '11:00',
        isLab: false,
      },
      // Thursday
      {
        courseId: allCourses.find(c => c.courseCode === 'SE205')?._id || '',
        courseCode: 'SE205',
        courseName: 'Computer Programming II',
        instructorId: instructor3._id,
        instructorName: 'Alemayehu Sh.',
        roomId: classroomRooms[1]?._id || '',
        roomNumber: 'CR2',
        day: 'Thursday' as const,
        shift: 'afternoon' as const,
        startTime: '14:00',
        endTime: '17:00',
        isLab: false,
      },
      {
        courseId: allCourses.find(c => c.courseCode === 'SE204')?._id || '',
        courseCode: 'SE204',
        courseName: 'Fundamentals of Software Engineering',
        instructorId: instructor2._id,
        instructorName: 'Senedu G.',
        roomId: labRooms[1]?._id || '',
        roomNumber: 'Lab2',
        day: 'Thursday' as const,
        shift: 'morning' as const,
        startTime: '08:00',
        endTime: '11:00',
        isLab: true,
      },
      // Friday
      {
        courseId: allCourses.find(c => c.courseCode === 'GT101')?._id || '',
        courseCode: 'GT101',
        courseName: 'Global Trends',
        instructorId: tbaInstructor._id,
        instructorName: 'TBA',
        roomId: classroomRooms[2]?._id || '',
        roomNumber: 'CR3',
        day: 'Friday' as const,
        shift: 'afternoon' as const,
        startTime: '14:00',
        endTime: '17:00',
        isLab: false,
      },
      {
        courseId: allCourses.find(c => c.courseCode === 'SE205')?._id || '',
        courseCode: 'SE205',
        courseName: 'Computer Programming II',
        instructorId: instructor3._id,
        instructorName: 'Alemayehu Sh.',
        roomId: labRooms[2]?._id || '',
        roomNumber: 'Lab3',
        day: 'Friday' as const,
        shift: 'morning' as const,
        startTime: '08:00',
        endTime: '11:00',
        isLab: true,
      },
    ].filter(e => e.courseId); // Filter out invalid entries

    this.createSchedule({
      batchId: batch._id,
      semesterId: semester._id,
      section: 'B',
      department: 'Software Engineering',
      entries: scheduleEntries,
      status: 'published',
    });

    // Create Batch 2019 (Yesterday's data - additional sample)
    const batch2019 = this.createBatch({
      batchNumber: '2019',
      numberOfYears: 4,
      sections: ['A', 'B', 'C'],
      departments: [dept1.name, dept2.name],
    });

    const semester2019 = this.createSemester({
      batchId: batch2019._id,
      semesterNumber: 1,
      name: 'First Semester',
      isActive: true,
    });

    // Create additional instructor for 2019 batch
    const instructor4 = this.createInstructor({
      fullName: 'Mulugeta K.',
      idNumber: 'INS004',
      phoneNumber: '+251900000004',
      profession: 'PhD in Computer Science',
      position: 'Associate Professor',
      maxTeachingLoad: 12,
      specialization: ['major'],
    });

    // Create additional courses for 2019 batch
    const course2019_1 = this.createCourse({
      courseName: 'Data Structures and Algorithms',
      courseCode: 'CS301',
      creditHour: 4,
      majorOrCommon: 'major',
      batchId: batch2019._id,
      semesterId: semester2019._id,
      instructorId: instructor4._id,
      hasLab: true,
      lectureHours: 3,
      labHours: 2,
      department: dept2.name,
    });

    const course2019_2 = this.createCourse({
      courseName: 'Database Management Systems',
      courseCode: 'CS302',
      creditHour: 5,
      majorOrCommon: 'major',
      batchId: batch2019._id,
      semesterId: semester2019._id,
      instructorId: instructor1._id,
      hasLab: true,
      lectureHours: 3,
      labHours: 3,
      department: dept2.name,
    });
  }
}

// Export singleton instance
const memoryStorage = new MemoryStorage();
export default memoryStorage;

// Export types for use in controllers
export type { Batch, Semester, Course, Instructor, Room, Schedule, ScheduleEntry, ClassRepresentative, Department };

