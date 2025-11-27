import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'admin' | 'instructor' | 'department_head';
  fullName: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'instructor', 'department_head'], required: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);




