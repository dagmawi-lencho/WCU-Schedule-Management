import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import models
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'instructor', 'department_head'], default: 'instructor' },
  fullName: { type: String, required: true },
  phoneNumber: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const BatchSchema = new mongoose.Schema({
  batchNumber: { type: String, required: true, unique: true },
  numberOfYears: { type: Number, required: true },
  sections: [String],
  departments: [String],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Batch = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);

const SemesterSchema = new mongoose.Schema({
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  semesterNumber: { type: Number, required: true },
  year: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Semester = mongoose.models.Semester || mongoose.model('Semester', SemesterSchema);

const CourseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  creditHours: { type: Number, required: true },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
  courseType: { type: String, enum: ['major', 'common', 'lab'], default: 'major' },
  department: String,
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);

const InstructorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: String,
  department: String,
  maxCreditLoad: { type: Number, default: 18 },
  currentLoad: { type: Number, default: 0 },
}, { timestamps: true });

const Instructor = mongoose.models.Instructor || mongoose.model('Instructor', InstructorSchema);

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  roomType: { type: String, enum: ['classroom', 'lab'], default: 'classroom' },
  building: String,
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Room = mongoose.models.Room || mongoose.model('Room', RoomSchema);

const ScheduleSchema = new mongoose.Schema({
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
  section: String,
  entries: [{
    day: String,
    timeSlot: String,
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor' },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  }],
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);

// Auth imports
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  await mongoose.connect(uri);
  isConnected = true;
};

// Auth middleware
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', database: isConnected ? 'Connected' : 'Disconnected' });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role, fullName: user.fullName } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    await connectDB();
    const { email, password, role, fullName, phoneNumber } = req.body;
    if (!email || !password || !role || !fullName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, role, fullName, phoneNumber });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role, fullName: user.fullName } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Users routes
app.get('/api/users', authenticate, async (req: any, res) => {
  try {
    await connectDB();
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/users', authenticate, async (req: any, res) => {
  try {
    await connectDB();
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { email, password, role, fullName, phoneNumber } = req.body;
    if (!email || !password || !role || !fullName) {
      return res.status(400).json({ message: 'Missing required fields: email, password, role, and fullName are required' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, role, fullName, phoneNumber });
    res.status(201).json({ message: 'User created', user: await User.findById(user._id).select('-password') });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Batches routes
app.get('/api/batches', authenticate, async (req, res) => {
  try {
    await connectDB();
    const batches = await Batch.find();
    res.json(batches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/batches', authenticate, async (req: any, res) => {
  try {
    await connectDB();
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const batch = await Batch.create(req.body);
    res.status(201).json(batch);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/batches/:id', authenticate, async (req: any, res) => {
  try {
    await connectDB();
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Courses routes
app.get('/api/courses', authenticate, async (req, res) => {
  try {
    await connectDB();
    const courses = await Course.find().populate('semester instructor');
    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/courses', authenticate, async (req: any, res) => {
  try {
    await connectDB();
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/courses/:id', authenticate, async (req: any, res) => {
  try {
    await connectDB();
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Instructors routes
app.get('/api/instructors', authenticate, async (req, res) => {
  try {
    await connectDB();
    const instructors = await Instructor.find().populate('user');
    res.json(instructors);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/instructors', authenticate, async (req: any, res) => {
  try {
    await connectDB();
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { email, password, fullName, phoneNumber, department, maxCreditLoad } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, role: 'instructor', fullName, phoneNumber });
    const instructor = await Instructor.create({ user: user._id, fullName, email, phoneNumber, department, maxCreditLoad });
    res.status(201).json(instructor);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/instructors/:id', authenticate, async (req: any, res) => {
  try {
    await connectDB();
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const instructor = await Instructor.findById(req.params.id);
    if (instructor?.user) await User.findByIdAndDelete(instructor.user);
    await Instructor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Semesters routes
app.get('/api/semesters', authenticate, async (req, res) => {
  try {
    await connectDB();
    const filter = req.query.batchId ? { batch: req.query.batchId } : {};
    const semesters = await Semester.find(filter).populate('batch');
    res.json(semesters);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/semesters', authenticate, async (req: any, res) => {
  try {
    await connectDB();
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const semester = await Semester.create(req.body);
    res.status(201).json(semester);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Rooms routes
app.get('/api/rooms', authenticate, async (req, res) => {
  try {
    await connectDB();
    const filter = req.query.roomType ? { roomType: req.query.roomType } : {};
    const rooms = await Room.find(filter);
    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/rooms/initialize', authenticate, async (req: any, res) => {
  try {
    await connectDB();
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const defaultRooms = [
      { roomNumber: 'A101', capacity: 50, roomType: 'classroom', building: 'Block A' },
      { roomNumber: 'A102', capacity: 50, roomType: 'classroom', building: 'Block A' },
      { roomNumber: 'B101', capacity: 40, roomType: 'classroom', building: 'Block B' },
      { roomNumber: 'LAB1', capacity: 30, roomType: 'lab', building: 'Block C' },
      { roomNumber: 'LAB2', capacity: 30, roomType: 'lab', building: 'Block C' },
    ];
    for (const room of defaultRooms) {
      await Room.findOneAndUpdate({ roomNumber: room.roomNumber }, room, { upsert: true });
    }
    res.json({ message: 'Rooms initialized' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Schedules routes
app.get('/api/schedules', authenticate, async (req, res) => {
  try {
    await connectDB();
    const schedules = await Schedule.find().populate('batch semester entries.course entries.instructor entries.room');
    res.json(schedules);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/schedules/generate', authenticate, async (req: any, res) => {
  try {
    await connectDB();
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const schedule = await Schedule.create(req.body);
    res.status(201).json(schedule);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Catch all
app.all('*', (req, res) => {
  res.status(404).json({ message: 'API route not found', path: req.path });
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await connectDB();
  return app(req as any, res as any);
}

