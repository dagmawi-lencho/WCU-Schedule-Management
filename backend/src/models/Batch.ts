import mongoose, { Document, Schema } from 'mongoose';

export interface IBatch extends Document {
  batchNumber: string; // e.g., "2018", "2019"
  numberOfYears: number; // e.g., 3, 4
  departments?: string[];
  sections: string[]; // e.g., ["A", "B"]
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    batchNumber: { type: String, required: true, unique: true },
    numberOfYears: { type: Number, required: true },
    departments: [{ type: String }],
    sections: [{ type: String, default: ['A'] }],
  },
  { timestamps: true }
);

export default mongoose.model<IBatch>('Batch', BatchSchema);




