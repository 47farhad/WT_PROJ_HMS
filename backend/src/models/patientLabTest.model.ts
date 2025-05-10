import mongoose from "mongoose";

const labTestSchema = new mongoose.Schema({
    name:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'offeredTest',
        required: true
    },
    offeredTestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OfferedTest',  
    },
    result: {
        type: String,
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
