// models/doctor.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IEducation {
  degree: string;
  institution: string;
  year: number;
}

export interface ICertification {
  name: string;
  issuingBody: string;
  year: number;
  expiryYear?: number;
}

export interface ISchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  isAvailable: boolean;
}

export interface IReview {
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface IDoctor extends Document {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  profileImage?: string;
  bio?: string;
  gender: 'male' | 'female' | 'other';
  
  // Professional details
  experience: number; // in years
  education: IEducation[];
  certifications: ICertification[];
  languages: string[];
  
  // Hospital details
  department: string;
  roomNumber?: string;
  schedule: ISchedule[];
  
  // Financial information
  commissionRate: number; // percentage
  accountDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  
  // Performance metrics
  averageRating: number;
  totalReviews: number;
  totalAppointments: number;
  reviews: IReview[];
  
  // Status
  isActive: boolean;
  isOnLeave: boolean;
  joinedAt: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new Schema<IDoctor>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  profileImage: {
    type: String
  },
  bio: {
    type: String
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  
  // Professional details
  experience: {
    type: Number,
    required: true
  },
  education: [{
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    year: { type: Number, required: true }
  }],
  certifications: [{
    name: { type: String, required: true },
    issuingBody: { type: String, required: true },
    year: { type: Number, required: true },
    expiryYear: { type: Number }
  }],
  languages: [{
    type: String
  }],
  
  // Hospital details
  department: {
    type: String,
    required: true
  },
  roomNumber: {
    type: String
  },
  schedule: [{
    day: { 
      type: String, 
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true 
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isAvailable: { type: Boolean, default: true }
  }],
  
  // Financial information
  commissionRate: {
    type: Number,
    required: true,
    default: 15
  },
  accountDetails: {
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String }
  },
  
  // Performance metrics
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalAppointments: {
    type: Number,
    default: 0
  },
  reviews: [{
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isOnLeave: {
    type: Boolean,
    default: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate average rating when adding a new review
DoctorSchema.pre('save', function(next) {
  if (this.isModified('reviews')) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = this.reviews.length > 0 ? totalRating / this.reviews.length : 0;
    this.totalReviews = this.reviews.length;
  }
  next();
});

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);