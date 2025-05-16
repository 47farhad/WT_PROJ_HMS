import mongoose from "mongoose";

const labTestSchema = new mongoose.Schema({
  offeredTestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OfferedTest',
  },
  result: {
    type: String,
    default: ""
  },
  datetime: {
    type: Date,
    required: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
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
export default mongoose.model('PatientLabTest', labTestSchema);
