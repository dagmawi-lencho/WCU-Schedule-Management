import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IClassRepresentative extends Document {
  batchId: Types.ObjectId;
  section: string; // e.g., "A", "B"
  fullName: string;
  idNumber: string; // Student ID
  phoneNumber?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassRepresentativeSchema = new Schema<IClassRepresentative>(
  {
    batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
    section: { type: String, required: true },
    fullName: { type: String, required: true },
    idNumber: { type: String, required: true },
    phoneNumber: { type: String },
    email: { type: String },
  },
  { timestamps: true }
);

// Ensure one representative per batch-section combination
ClassRepresentativeSchema.index({ batchId: 1, section: 1 }, { unique: true });

export default mongoose.model<IClassRepresentative>('ClassRepresentative', ClassRepresentativeSchema);

