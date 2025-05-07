import mongoose from "mongoose";

const offeredTestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true
        },
        requirements: {
            type: [String],
            required: true
        },
        status: {
            type: String,
            enum: ['available', 'unavailable'],
            default: 'unavailable'
        }
    },

    {
        timestamps: true
    }
);

const OfferedTest = mongoose.model("OfferedTest", offeredTestSchema);

export default OfferedTest;