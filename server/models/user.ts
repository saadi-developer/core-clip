import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  id: string; // Clerk user ID
  email: string;
  name: string;
  image: string;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    id: { type: String, unique: true, required: true, index: true }, // Clerk user ID
    email: { type: String, required: true, index: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    credits: { type: Number, default: 20, min: 0 },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
