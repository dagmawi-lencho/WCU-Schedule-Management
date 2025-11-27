import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IScheduleEntry {
  courseId: Types.ObjectId;
  courseCode: string;
  courseName: string;
  instructorId: Types.ObjectId;
  instructorName: string;
  roomId: Types.ObjectId;
  roomNumber: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  shift: 'morning' | 'afternoon';
  startTime: string; // e.g., "08:00"
  endTime: string; // e.g., "10:00"
  isLab: boolean;
}

export interface ISchedule extends Document {
  batchId: Types.ObjectId;
  semesterId: Types.ObjectId;
  section: string; // e.g., "A", "B"
  department?: string;
  entries: IScheduleEntry[];
  status: 'draft' | 'published';
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleEntrySchema = new Schema<IScheduleEntry>({
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  instructorId: { type: Schema.Types.ObjectId, ref: 'Instructor', required: true },
  instructorName: { type: String, required: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  roomNumber: { type: String, required: true },
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], required: true },
  shift: { type: String, enum: ['morning', 'afternoon'], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isLab: { type: Boolean, default: false },
}, { _id: false });

const ScheduleSchema = new Schema<ISchedule>(
  {
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    semesterId: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    section: { type: String, required: true },
    department: { type: String },
    entries: [ScheduleEntrySchema],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ScheduleSchema.index({ batchId: 1, semesterId: 1, section: 1 }, { unique: true });

export default mongoose.model<ISchedule>('Schedule', ScheduleSchema);




