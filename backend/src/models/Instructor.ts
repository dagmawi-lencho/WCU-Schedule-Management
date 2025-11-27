import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInstructor extends Document {
  userId: Types.ObjectId; // Link to User account
  fullName: string;
  phoneNumber: string;
  idNumber: string; // Staff ID
  profession: string; // e.g., "MSc in Software Engineering"
  position: string; // e.g., "Lecturer", "Assistant Professor"
  rank: string;
  maxTeachingLoad: number; // Maximum credits (e.g., 12, 15)
  specialization: string[]; // e.g., ["major", "common"]
  assignedCourses: Types.ObjectId[]; // Array of course IDs
  createdAt: Date;
  updatedAt: Date;
}

const InstructorSchema = new Schema<IInstructor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    idNumber: { type: String, required: true, unique: true },
    profession: { type: String, required: true },
    position: { type: String, required: true },
    rank: { type: String },
    maxTeachingLoad: { type: Number, required: true, default: 12 },
    specialization: [{ type: String }], // ["major", "common"]
    assignedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  },
  { timestamps: true }
);

export default mongoose.model<IInstructor>('Instructor', InstructorSchema);




