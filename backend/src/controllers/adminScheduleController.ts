// controllers/adminScheduleController.ts
import User from '../models/user.model.js'; // Added .js extension
import Appointment from '../models/appointment.model.js'; // Added .js extension
import mongoose, { ObjectId } from 'mongoose';
import { Request, Response } from 'express';

// Interfaces for the doctorInfo structure
interface WorkScheduleItem {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  isWorking: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

interface Rating {
  patientId: ObjectId;
  rating: number;
  review?: string;
  date: Date;
}

interface DoctorInfo {
  specialization?: string;
  qualifications: string[];
  experience?: number;
  workSchedule: WorkScheduleItem[];
  commission: number;
  department?: string;
  isAvailable: boolean;
  ratings: Rating[];
  averageRating: number;
}

// Helper function to handle async errors
const catchAsync = (fn: Function) => {
  return (req: Request, res: Response) => {
    Promise.resolve(fn(req, res)).catch((err) => {
      console.error('Error in async controller function:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
      });
    });
  };
};

/**
 * Get all schedule-related data (doctors, appointments)
 */
export const getScheduleData = catchAsync(async (req: Request, res: Response) => {
  // Get all doctors with work schedules
  const doctors = await User.find(
    { userType: 'Doctor' },
    'firstName lastName doctorInfo.workSchedule doctorInfo.specialization doctorInfo.department doctorInfo.isAvailable'
  );
  
  // Get all appointments
  const appointments = await Appointment.find({})
    .populate('patientId', 'firstName lastName')
    .populate('doctorId', 'firstName lastName');
    
  res.status(200).json({
    success: true,
    data: {
      doctors,
      appointments
    }
  });
});

/**
 * Get all doctors with their schedules
 */
export const getAllDoctorsWithSchedules = catchAsync(async (req: Request, res: Response) => {
  const doctors = await User.find(
    { userType: 'Doctor' },
    'firstName lastName doctorInfo.workSchedule doctorInfo.specialization doctorInfo.department doctorInfo.isAvailable'
  );
  
  res.status(200).json({
    success: true,
    data: doctors
  });
});

/**
 * Get all appointments
 */
export const getAllAppointments = catchAsync(async (req: Request, res: Response) => {
  const appointments = await Appointment.find({})
    .populate('patientId', 'firstName lastName')
    .populate('doctorId', 'firstName lastName');
    
  res.status(200).json({
    success: true,
    data: appointments
  });
});

/**
 * Update an appointment status or details
 */
export const updateAppointment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, description } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid appointment ID'
    });
  }
  
  const appointment = await Appointment.findById(id);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }
  
  // Update only provided fields
  if (status) appointment.status = status;
  if (description) appointment.description = description;
  
  // Save the updated appointment
  await appointment.save();
  
  res.status(200).json({
    success: true,
    data: appointment
  });
});

/**
 * Update a doctor's work schedule
 */
export const updateDoctorWorkSchedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { workSchedule } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid doctor ID'
    });
  }
  
  const doctor = await User.findOne({ _id: id, userType: 'Doctor' });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }
  
  // Validate work schedule
  if (!Array.isArray(workSchedule)) {
    return res.status(400).json({
      success: false,
      message: 'Work schedule must be an array'
    });
  }
  
  // Using mongoose findOneAndUpdate to directly update the subdocument
  // This avoids type errors with doctorInfo property
  await User.findOneAndUpdate(
    { _id: id },
    { 
      $set: { 
        'doctorInfo.workSchedule': workSchedule 
      } 
    },
    { new: true }
  );
  
  // Get the updated doctor to return
  const updatedDoctor = await User.findById(id);
  
  res.status(200).json({
    success: true,
    data: updatedDoctor
  });
});