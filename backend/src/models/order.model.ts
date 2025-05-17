import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed'],
            default: 'pending',
        },
        items: [
            {
                medicineId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Medicine',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                }
            }
        ]
    },
    {
        timestamps: true
    }
);


orderSchema.index({status: 1})
orderSchema.index({patientId: 1})

const Order = mongoose.model("Order", orderSchema);

export default Order;