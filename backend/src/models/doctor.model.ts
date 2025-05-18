// src/models/doctor.model.ts
import mongoose, { Document, Schema } from 'mongoose';

// Update your IDoctor interface to include all the properties being used
export interface IDoctor extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  specialization: string;
  qualifications?: string[];
  experience?: number;
  bio?: string;
  consultationFee?: number;
  commissionRate?: number;
  isOnLeave?: boolean;
  isAvailable?: boolean;
  schedule?: {
    [key: string]: {
      start: string;
      end: string;
      isAvailable: boolean;
    }[];
  };
  // Add any other properties your doctor model uses
}

const doctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    qualifications: {
      type: [String],
    },
    experience: {
      type: Number,
    },
    bio: {
      type: String,
    },
    consultationFee: {
      type: Number,
    },
    commissionRate: {
      type: Number,
      default: 10, // Default 10% commission
    },
    isOnLeave: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    schedule: {
      type: Schema.Types.Mixed, // For flexible schedule structure
      default: {}, // Empty object as default
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDoctor>('Doctor', doctorSchema);