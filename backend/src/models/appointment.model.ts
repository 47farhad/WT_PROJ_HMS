// appointment.model.ts
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  datetime: {
    type: Date,
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Changed from 'Doctor' to 'User'
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Changed from 'Patient' to 'User'
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'completed'],
    default: 'pending'
  }
},
{
  timestamps: true
}
);

// Check if the model is already registered to avoid duplicate model error
const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

export default Appointment;