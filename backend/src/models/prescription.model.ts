import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: true
        },
        items: [
            {
                medicineId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'OfferedMedicine',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                
                }
            }
        ],
        expiryDate: {
            type: Date,
            required:true
        },
    },
    {
        timestamps: true
    }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;