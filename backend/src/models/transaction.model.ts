import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment',
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['Appointment', 'Medicine', 'Lab Test'],
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Completed', 'Pending', 'Failed'],
    required: true 
  }
}, {
  timestamps: true
});

export default mongoose.model('Transaction', transactionSchema);