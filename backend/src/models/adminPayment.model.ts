import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  transactionId: string;
  patientId: mongoose.Types.ObjectId;
  patientName: string;
  doctorId?: mongoose.Types.ObjectId;
  doctorName?: string;
  amount: number;
  category: 'appointment' | 'labtest' | 'medicine' | 'salary' | 'refund' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  paymentMethod: 'cash' | 'credit' | 'debit' | 'insurance' | 'bank_transfer' | 'other';
  notes?: string;
  originalTransactionId?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: function(this: IPayment) { return this.category === 'appointment'; }
  },
  doctorName: {
    type: String,
    required: function(this: IPayment) { return this.category === 'appointment'; }
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['appointment', 'labtest', 'medicine', 'salary', 'refund', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit', 'debit', 'insurance', 'bank_transfer', 'other'],
    required: true
  },
  notes: {
    type: String
  },
  originalTransactionId: {
    type: String,
    required: function(this: IPayment) { return this.category === 'refund'; }
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true // This adds createdAt and updatedAt fields automatically
});

export default mongoose.model<IPayment>('Payment', PaymentSchema);