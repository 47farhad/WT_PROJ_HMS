import mongoose from "mongoose";

const notesSchema = new mongoose.Schema(
    {
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment',
            required: true
        },

        header: {
            type: String,
            required: true
        },

        text: {
            type: String,
            requried: true
        }

    },
    {
        timestamps: true
    }
)

notesSchema.index({ appointmentId: 1 })

const Notes = mongoose.model("Notes", notesSchema);

export default Notes;