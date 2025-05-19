// models/request.model.ts
//for doc basically, leave & commision change reqs k liyay
import mongoose, { Document, Schema } from 'mongoose';

export interface IRequest extends Document {
  doctorId: mongoose.Types.ObjectId;
  doctorName: string;
  type: 'leave' | 'commission_change';
  status: 'pending' | 'approved' | 'rejected';
  
  // For leave requests
  leaveDetails?: {
    startDate: Date;
    endDate: Date;
    reason: string;
  };
  
  // For commission change requests
  commissionDetails?: {
    currentRate: number;
    requestedRate: number;
    justification: string;
  };
  
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<IRequest>({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['leave', 'commission_change'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // For leave requests
  leaveDetails: {
    startDate: { type: Date },
    endDate: { type: Date },
    reason: { type: String }
  },
  
  // For commission change requests
  commissionDetails: {
    currentRate: { type: Number },
    requestedRate: { type: Number },
    justification: { type: String }
  },
  
  adminNotes: {
    type: String
  }
}, {
  timestamps: true
});

// Validate that either leaveDetails or commissionDetails is provided
RequestSchema.pre('validate', function(next) {
  if (this.type === 'leave' && !this.leaveDetails) {
    return next(new Error('Leave details are required for leave requests'));
  }
  
  if (this.type === 'commission_change' && !this.commissionDetails) {
    return next(new Error('Commission details are required for commission change requests'));
  }
  
  next();
});

export default mongoose.model<IRequest>('Request', RequestSchema);