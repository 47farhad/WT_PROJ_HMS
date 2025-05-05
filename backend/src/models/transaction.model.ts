import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    cardNumber: {
      type: Number,
      required: true,
    },
    cardName: {
      type: String,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    cvv: {
      type: Number,
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['Appointment', 'Lab Test', 'Medication'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'failed'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      default: 'card',
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Transaction', transactionSchema);