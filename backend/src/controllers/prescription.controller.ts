import Prescription from "../models/prescription.model.js";
import Appointment from "../models/appointment.model.js";
import OfferedMedicine from "../models/offeredMedicine.model.js";
import mongoose from "mongoose";

export const createPrescription = async (req: any, res: any) => {
    try {
        const { id: appointmentId } = req.params;
        const { items, expiryDate } = req.body;
        const doctorId = req.user._id;

        // Validate appointment exists and belongs to this doctor
        const appointment = await Appointment.findOne({
            _id: mongoose.Types.ObjectId.createFromHexString(appointmentId),
            doctor: doctorId,
            status: 'confirmed'
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }
        // Validate expiry date is in the future
        if (new Date(expiryDate) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Expiry date must be in the future"
            });
        }
        // Validate that all medicines require prescription
        const medicineIds = items.map((item: any ) => item.medicineId);
        const medicines = await OfferedMedicine.find({
            _id: { $in: medicineIds }
        });

        // Check if all medicines exist
        if (medicines.length !== items.length) {
            return res.status(400).json({
                success: false,
                message: "One or more medicines not found"
            });
        }

        // Check if all medicines require prescription
        const nonPrescriptionMedicines = medicines.filter(
            medicine => !medicine.requiresPrescription
        );

        if (nonPrescriptionMedicines.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot prescribe medicines that don't require prescription",
                nonPrescriptionMedicines: nonPrescriptionMedicines.map(m => ({
                    _id: m._id,
                    name: m.name
                }))
            });
        }

        // Create new prescription
        const newPrescription = new Prescription({
            appointmentId,
            items,
            expiryDate
        });

        await newPrescription.save();

        res.status(201).json({
            success: true,
            message: "Prescription created successfully",
            prescription: newPrescription
        });

    }  
    catch (error) {
    console.log("Error in controller: createPrescription", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getPrescription = async (req: any, res: any) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user._id;

        // Find the appointment to verify patient ownership
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            patient: userId
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found or you don't have access to it"
            });
        }

        // Find the prescription for this appointment
        const prescription = await Prescription.findOne({ appointmentId })
            .populate({
                path: 'items.medicineId',
                select: 'name description price requiresPrescription'
            })
            .populate({
                path: 'appointmentId',
                select: 'date time status'
            });

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "No prescription found for this appointment"
            });
        }

        res.status(200).json({
            success: true,
            prescription: {
                ...prescription.toObject(),
                isValid: new Date(prescription.expiryDate) >= new Date()
            }
        });

    } catch (error) {
    console.log("Error in controller: getPrescription", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
  
};