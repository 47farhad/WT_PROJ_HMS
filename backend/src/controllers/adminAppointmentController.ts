import { Request, Response } from 'express';
import User from '../models/user.model';
import Appointment from '../models/appointment.model';
import mongoose from 'mongoose';

// Get all appointments with pagination and filtering
export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        
        // Build filter object
        const filter: any = {};
        
        // Date range filter
        if (req.query.startDate && req.query.endDate) {
            filter.date = {
                $gte: new Date(req.query.startDate as string),
                $lte: new Date(req.query.endDate as string)
            };
        }
        
        // Doctor filter
        if (req.query.doctorId) {
            filter.doctorId = req.query.doctorId;
        }
        
        // Status filter
        if (req.query.status) {
            filter.status = req.query.status;
        }
        
        // Get appointments
        const appointments = await Appointment.find(filter)
            .sort({ datetime: -1 })
            .skip(skip)
            .limit(limit)
            .populate('doctorId', 'firstName lastName email profilePic userType doctorInfo')
            .populate('patientId', 'firstName lastName email profilePic');
        
        // Get total count for pagination
        const total = await Appointment.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            data: appointments,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                hasMore: page < Math.ceil(total / limit),
                isPageLoading: false,
                currentPage: page
            }
        });
    } catch (error) {
        console.error('Error getting appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Could not retrieve appointments',
            error: (error as Error).message
        });
    }
};

// Get doctor schedules with their appointments
export const getDoctorSchedules = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
            return;
        }
        
        // Get all doctors with their work schedules
        const doctors = await User.find({ 
            userType: 'Doctor',
            'doctorInfo.workSchedule': { $exists: true }
        }).select('firstName lastName profilePic doctorInfo');
        
        // Get appointments within date range
        const appointments = await Appointment.find({
            datetime: {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            }
        }).populate('patientId', 'firstName lastName profilePic');
        
        // Group appointments by doctor
        const doctorAppointments: { [key: string]: any[] } = {};
        appointments.forEach(appointment => {
            const doctorId = appointment.doctorId.toString();
            if (!doctorAppointments[doctorId]) {
                doctorAppointments[doctorId] = [];
            }
            doctorAppointments[doctorId].push(appointment);
        });
        
        // Create response object with doctors and their appointments
        const response = doctors.map(doctor => {
            const doctorId = doctor._id.toString();
            return {
                doctor: {
                    _id: doctorId,
                    name: `${doctor.firstName} ${doctor.lastName}`,
                    specialization: doctor.doctorInfo?.specialization,
                    department: doctor.doctorInfo?.department,
                    profilePic: doctor.profilePic,
                    workSchedule: doctor.doctorInfo?.workSchedule || []
                },
                appointments: doctorAppointments[doctorId] || []
            };
        });
        
        res.status(200).json({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error getting doctor schedules:', error);
        res.status(500).json({
            success: false,
            message: 'Could not retrieve doctor schedules',
            error: (error as Error).message
        });
    }
};

// Update appointment status, time, etc.
export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, startTime, endTime, datetime, description, notes } = req.body;
        
        // Find and update the appointment
        const appointment = await Appointment.findById(id);
        
        if (!appointment) {
            res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
            return;
        }
        
        // Update fields if provided
        if (status) appointment.status = status;
        if (startTime) appointment.startTime = startTime;
        if (endTime) appointment.endTime = endTime;
        if (datetime) appointment.datetime = new Date(datetime);
        if (description) appointment.description = description;
        if (notes) appointment.notes = notes;
        
        await appointment.save();
        
        res.status(200).json({
            success: true,
            message: 'Appointment updated successfully',
            data: appointment
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Could not update appointment',
            error: (error as Error).message
        });
    }
};

// Update doctor work schedule
// Update doctor work schedule
export const updateDoctorSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { workSchedule } = req.body;
        
        if (!workSchedule || !Array.isArray(workSchedule)) {
            res.status(400).json({
                success: false,
                message: 'Valid work schedule array is required'
            });
            return;
        }
        
        // Find the doctor
        const doctor = await User.findById(id);
        
        if (!doctor) {
            res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
            return;
        }

        // Use a more direct approach to update the doctor's schedule
        if (!doctor.doctorInfo) {
            // If doctorInfo doesn't exist, create the whole object
            doctor.doctorInfo = {
                specialization: '',
                qualifications: [],
                experience: 0,
                workSchedule: new mongoose.Types.DocumentArray([]),
                commission: 0,
                department: '',
                isAvailable: true,
                ratings: new mongoose.Types.DocumentArray([]),
                averageRating: 0
            };
        }
        
    
        if (doctor.doctorInfo) {
            doctor.doctorInfo.workSchedule = workSchedule as any;
        }
        
        await doctor.save();
        
        res.status(200).json({
            success: true,
            message: 'Doctor schedule updated successfully',
            data: doctor
        });
    } catch (error) {
        console.error('Error updating doctor schedule:', error);
        res.status(500).json({
            success: false,
            message: 'Could not update doctor schedule',
            error: (error as Error).message
        });
    }
};