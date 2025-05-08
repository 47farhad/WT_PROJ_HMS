import mongoose from "mongoose";

const offeredTestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: 'New Test',
            required: true
        },
        description: {
            type: String,
            default: 'Description',
            required: true,
        },
        price: {
            type: Number,
            default: 0,
            required: true
        },
        requirements: {
            type: [String],
            default: [],
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