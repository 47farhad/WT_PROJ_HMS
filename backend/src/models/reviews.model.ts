import mongoose from "mongoose";

const reviewsSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        reviewText: {
            type: String,
            requried: true
        },
    },
    {
        timestamps: true

    }
)

const Reviews = mongoose.model("Reviews", reviewsSchema);

export default Reviews;