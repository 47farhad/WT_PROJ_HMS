import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  datetime: {
    type: Date,
    required: true
  },
  // Adding separate date field for easier querying
  date: {
    type: Date,
    required: true
  },
  // Adding time fields for more flexibility
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming doctors are in the User collection with role='doctor'
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming patients are in the User collection with role='patient'
    required: true
  },
  description: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  followUp: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    default: 0
  }
},
{
  timestamps: true
});

// Create indexes for efficient querying
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ patientId: 1, date: 1 });

// Pre-save hook to set date from datetime
appointmentSchema.pre('save', function(next) {
  if (this.datetime) {
    const date = new Date(this.datetime);
    this.date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    // Set startTime and endTime if not already set
    if (!this.startTime) {
      this.startTime = date.toTimeString().slice(0, 5); // Format: HH:MM
    }
    
    // Default appointment duration: 30 minutes
    if (!this.endTime) {
      const endDate = new Date(date);
      endDate.setMinutes(endDate.getMinutes() + 30);
      this.endTime = endDate.toTimeString().slice(0, 5); // Format: HH:MM
    }
  }
  next();
});

export default mongoose.model('Appointment', appointmentSchema);