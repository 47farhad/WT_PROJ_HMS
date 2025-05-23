import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'type', 
    },
    type: {
      type: String,
      enum: ['Appointment', 'LabTest', 'Order'], 
      required: true,
    },
    amount: {
      type: Number,
      default: 50
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'failed'],
      default: 'unpaid',
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({userId: 1})

export default mongoose.model('Transaction', transactionSchema);