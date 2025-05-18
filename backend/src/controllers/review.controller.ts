import Appointment from "../models/appointment.model"
import Reviews from "../models/reviews.model";

export const createReview = async (req: any, res: any) => {
    try {
        const { appointmentId } = req.params;
        const { rating, reviewText } = req.body;
        const userId = req.user._id;

        if (!rating) {
            return res.status(400).json({ message: 'Rating is required' });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.patientId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You can only review your own appointment' });
        }

        // Prevent duplicate reviews for the same appointment
        const existingReview = await Reviews.findOne({ appointmentId });
        if (existingReview) {
            return res.status(400).json({ message: 'Review already submitted for this appointment' });
        }

        const review = await Reviews.create({
            appointmentId,
            rating,
            reviewText
        });

        res.status(201).json(review);
    }
    catch (error: any) {
        console.log("Error in create review", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const readReview = async (req: any, res: any) => {
    try {
        const { appointmentId } = req.params;

        const review = await Reviews.findOne({ appointmentId });
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json(review);
    }
    catch (error: any) {
        console.log("Error in read review", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};