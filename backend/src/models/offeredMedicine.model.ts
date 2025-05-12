import mongoose from "mongoose";

const offeredMedicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: 'New Medicine',
            required: true
        },
        description: {
            type: String,
            default: 'Description',
            required: true,
        },
        picture: {
            type: String,
            default: ''
        },
        price: {
            type: Number,
            default: 0,
            required: true
        },
        dosage: {
            type: Number,
            default: 0,
            required: true
        },
        status: {
            type: String,
            enum: ['available', 'unavailable'],
            default: 'unavailable'
        },
        requiresPrescription: {
            type: Boolean,
            default: false
        },
        stock: {
            type: Number,
            default: 0
        }
    },

    {
        timestamps: true
    }
);

const OfferedMedicine = mongoose.model("OfferedMedicine", offeredMedicineSchema);

export default OfferedMedicine;