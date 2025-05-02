import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  datetime: {
    type: Date,
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled'],
    default: 'pending'
  }
},
  {
    timestamps: true
  }
);

export default mongoose.model('Appointment', appointmentSchema);