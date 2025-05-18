import Notes from "../models/notes.model";
import Appointment from '../models/appointment.model.js';
import mongoose from "mongoose";

export const createNote = async (req: any, res: any) => {
    try {
        const { appointmentId } = req.params;
        const { header, text } = req.body;

        // Validate input
        if (!appointmentId) {
            return res.status(400).json({
                message: "appointmentId parameter is required in URL"
            });
        }

        if (!header || !text) {
            return res.status(400).json({
                message: "header and text are required in request body"
            });
        }

        // Verify the user is the doctor for this appointment
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (appointment.doctorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Only the assigned doctor can create notes for this appointment"
            });
        }

        // Check if a note already exists for this appointment
        const existingNote = await Notes.findOne({ appointmentId });
        if (existingNote) {
            return res.status(400).json({
                message: "A note already exists for this appointment"
            });
        }

        // Create and save new note
        const note = new Notes({
            appointmentId,
            header,
            text
        });

        const savedNote = await note.save();

        res.status(201).json(savedNote);

    } catch (error: any) {
        console.error("Error creating note:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const getNoteByAppointmentId = async (req: any, res: any) => {
    try {
        const { appointmentId } = req.params;

        // Validate input
        if (!appointmentId) {
            return res.status(400).json({
                message: "appointmentId parameter is required"
            });
        }

        // Find the appointment first to verify access
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Check access rights
        if (req.user.userType !== 'admin') {
            if (req.user.userType === 'doctor' &&
                appointment.doctorId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    message: "You are not authorized to view this note"
                });
            }
            if (req.user.userType === 'patient' &&
                appointment.patientId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    message: "You are not authorized to view this note"
                });
            }
        }

        // Find note by appointmentId
        const note = await Notes.findOne({ appointmentId });

        if (!note) {
            return res.status(404).json({
                message: "Note not found for this appointment"
            });
        }

        res.status(200).json(note);
    }
    catch (error: any) {
        console.error("Error getting note:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getNotesByPatientId = async (req: any, res: any) => {
    try {
        const reqUser = req.user;
        const { patientId } = req.params;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        // Validate patientId
        if (!mongoose.Types.ObjectId.isValid(patientId)) {
            return res.status(400).json({ message: "Invalid patient ID" });
        }

        // RBAC checks
        if (reqUser.userType === 'patient' && reqUser._id.toString() !== patientId) {
            return res.status(403).json({ message: "You can only view your own notes" });
        }

        if (reqUser.userType === 'doctor') {
            // Check if doctor has any appointments with this patient
            const hasAppointments = await Appointment.exists({
                doctorId: reqUser._id,
                patientId: patientId
            });
            if (!hasAppointments) {
                return res.status(403).json({
                    message: "You can only view notes for your patients"
                });
            }
        }

        // Main query with pagination
        const notesList = await Notes.aggregate([
            {
                $lookup: {
                    from: "appointments",
                    localField: "appointmentId",
                    foreignField: "_id",
                    as: "appointment"
                }
            },
            { $unwind: "$appointment" },
            { $match: { "appointment.patientId": new mongoose.Types.ObjectId(patientId) } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    header: 1,
                    text: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    appointmentId: 1,
                    doctorId: "$appointment.doctorId"
                }
            }
        ]);

        // Count total notes for pagination
        const total = await Notes.aggregate([
            {
                $lookup: {
                    from: "appointments",
                    localField: "appointmentId",
                    foreignField: "_id",
                    as: "appointment"
                }
            },
            { $unwind: "$appointment" },
            { $match: { "appointment.patientId": new mongoose.Types.ObjectId(patientId) } },
            { $count: "total" }
        ]);

        const totalCount = total[0]?.total || 0;
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            notesData: notesList,
            pagination: {
                currentPage: page,
                totalPages,
                hasMore: page < totalPages
            }
        });

    } catch (error: any) {
        console.error("Error in getNotesByPatientId:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};