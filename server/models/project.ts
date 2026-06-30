import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
  _id: Types.ObjectId;
  id?: string;
  name: string;
  userId: string;
  productName: string;
  productDescription: string;
  userPrompt: string;
  aspectRatio: string;
  targetLength: number;
  uploadedImages: string[];
  generatedImage: string;
  generatedVideo: string;
  isGenerating: boolean;
  isPublished: boolean;
  error: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    productDescription: { type: String, default: "" },
    userPrompt: { type: String, default: "" },
    aspectRatio: { type: String, default: "9:16", enum: ["9:16", "16:9"] },
    targetLength: { type: Number, default: 5, min: 1 },
    uploadedImages: { type: [String], default: [] },
    generatedImage: { type: String, default: "" },
    generatedVideo: { type: String, default: "" },
    isGenerating: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: false, index: true },
    error: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>("Project", projectSchema);
