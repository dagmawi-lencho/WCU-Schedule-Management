import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICourse extends Document {
  courseName: string; // e.g., "OOP"
  courseCode: string; // e.g., "CSE202"
  creditHour: number; // e.g., 3, 5
  majorOrCommon: 'major' | 'common';
  semesterId: Types.ObjectId;
  batchId: Types.ObjectId;
  hasLab: boolean;
  lectureHours: number; // Auto-calculated from credits
  labHours: number; // e.g., 5 ECTS → 2 lecture + 3 lab
  instructorId: Types.ObjectId; // One instructor per course
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    courseName: { type: String, required: true },
    courseCode: { type: String, required: true, unique: true },
    creditHour: { type: Number, required: true },
    majorOrCommon: { type: String, enum: ['major', 'common'], required: true },
    semesterId: { type: Schema.Types.ObjectId, ref: 'Semester', required: true },
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    hasLab: { type: Boolean, default: false },
    lectureHours: { type: Number, required: true },
    labHours: { type: Number, default: 0 },
    instructorId: { type: Schema.Types.ObjectId, ref: 'Instructor', required: true },
    department: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ICourse>('Course', CourseSchema);




