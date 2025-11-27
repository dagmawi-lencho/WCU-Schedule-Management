import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISemester extends Document {
  batchId: Types.ObjectId;
  semesterNumber: number; // 1, 2, 3...
  name: string; // e.g., "Semester 1"
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SemesterSchema = new Schema<ISemester>(
  {
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    semesterNumber: { type: Number, required: true },
    name: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SemesterSchema.index({ batchId: 1, semesterNumber: 1 }, { unique: true });

export default mongoose.model<ISemester>('Semester', SemesterSchema);




