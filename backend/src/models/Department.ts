import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string; // e.g., "Software Engineering"
  code: string; // e.g., "SE", "CS"
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true, uppercase: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDepartment>('Department', DepartmentSchema);


