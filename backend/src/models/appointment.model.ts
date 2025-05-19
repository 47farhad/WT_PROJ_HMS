// appointment.model.ts
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  datetime: {
    type: Date,
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ datetime: -1 });

export default mongoose.model('Appointment', appointmentSchema);