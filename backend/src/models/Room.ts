import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  roomNumber: string; // e.g., "Lab1", "CR1"
  roomType: 'lab' | 'classroom';
  capacity: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    roomNumber: { type: String, required: true, unique: true },
    roomType: { type: String, enum: ['lab', 'classroom'], required: true },
    capacity: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRoom>('Room', RoomSchema);




