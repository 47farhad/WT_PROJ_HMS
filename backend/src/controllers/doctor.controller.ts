// controllers/doctor.controller.ts
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import { Request, Response } from 'express';

// Type for doctorInfo interfaces
interface IDoctorInfo {
  specialization?: string;
  qualifications?: string[];
  experience?: number;
  workSchedule?: Array<{
    day: string;
    isWorking: boolean;
    startTime: string;
    endTime: string;
    slotDuration: number;
  }>;
  commission?: number;
  department?: string;
  isAvailable?: boolean;
  ratings?: Array<{
    patientId: mongoose.Types.ObjectId;
    rating: number;
    review?: string;
    date: Date;
  }>;
  averageRating?: number;
}

// Custom interface for authenticated requests
interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
    [key: string]: any;
  };
}

// Add this before the function to extend the global type
declare global {
  // eslint-disable-next-line no-var
  var _fixedUserModel: typeof mongoose.Model | undefined;
}

/**
 * Get all doctors
 */
export const getAllDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctors = await User.find(
      { userType: 'Doctor' },
      {
        firstName: 1,
        lastName: 1,
        email: 1,
        phone: 1,
        profilePic: 1,
        doctorInfo: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1
      }
    );
    
    // If no doctors found with exact match, try case-insensitive search
    let finalDoctors = doctors;
    if (doctors.length === 0) {
      const doctorsInsensitive = await User.find(
        { userType: { $regex: new RegExp('doctor', 'i') } }
      );
      
      if (doctorsInsensitive.length > 0) {
        finalDoctors = doctorsInsensitive;
      } else {
        // If still no doctors, look for users with doctorInfo field
        const usersWithDoctorInfo = await User.find(
          { 'doctorInfo.specialization': { $exists: true } }
        );
        
        if (usersWithDoctorInfo.length > 0) {
          finalDoctors = usersWithDoctorInfo;
        }
      }
    }
    
    // Format doctors for frontend
    const formattedDoctors = finalDoctors.map(doctor => ({
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone || '',
      profilePic: doctor.profilePic || '',
      doctorInfo: doctor.doctorInfo || {},
      isActive: doctor.isActive || false,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    }));
    
    res.status(200).json({
      success: true,
      count: formattedDoctors.length,
      data: formattedDoctors
    });
  } catch (error: unknown) {
    console.error('[DOCTOR CONTROLLER] Error in getAllDoctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get single doctor by ID
 */
export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
      return;
    }
    
    // Find doctor using User model with userType filter
    const doctor = await User.findOne(
      { _id: id, userType: 'Doctor' }
    );
    
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
      return;
    }
    
    // Format response
    const formattedDoctor = {
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone || '',
      profilePic: doctor.profilePic || '',
      doctorInfo: doctor.doctorInfo || {},
      isActive: doctor.isActive || false,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    };
    
    res.status(200).json({
      success: true,
      data: formattedDoctor
    });
  } catch (error: unknown) {
    console.error('[DOCTOR CONTROLLER] Error in getDoctorById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Update doctor
 */
export const updateDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, specialty, department, isActive } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
      return;
    }
    
    // Find doctor using User model
    const doctor = await User.findOne({ _id: id, userType: 'Doctor' });
    
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
      return;
    }
    
    // Update basic fields
    if (firstName) doctor.firstName = firstName;
    if (lastName) doctor.lastName = lastName;
    if (email) doctor.email = email;
    if (phone) doctor.phone = phone;
    if (isActive !== undefined) doctor.isActive = isActive;
    
    // Initialize doctorInfo if it doesn't exist
    if (!doctor.doctorInfo) {
      // Using the set method to avoid TypeScript errors
      doctor.set('doctorInfo', {
        specialization: '',
        qualifications: [],
        experience: 0,
        workSchedule: [],
        commission: 0,
        department: '',
        isAvailable: true,
        ratings: [],
        averageRating: 0
      });
    }
    
    // Update doctor-specific fields
    if (specialty && doctor.doctorInfo) {
      doctor.doctorInfo.specialization = specialty;
    }
    
    if (department && doctor.doctorInfo) {
      doctor.doctorInfo.department = department;
    }
    
    await doctor.save();
    
    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor
    });
  } catch (error: unknown) {
    console.error('[DOCTOR CONTROLLER] Error in updateDoctor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get doctor's schedule
 */
export const getDoctorSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid doctor ID format'
      });
      return;
    }
    
    // Find doctor using User model
    const doctor = await User.findOne(
      { _id: id, userType: 'Doctor' },
      { firstName: 1, lastName: 1, 'doctorInfo.workSchedule': 1 }
    );
    
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
      return;
    }
    
    const workSchedule = doctor.doctorInfo?.workSchedule || [];
    
    res.status(200).json({
      success: true,
      data: {
        _id: doctor._id,
        firstName: doctor.firstName,
        lastName: doctor.lastName,
        workSchedule
      }
    });
  } catch (error: unknown) {
    console.error('[DOCTOR CONTROLLER] Error in getDoctorSchedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor schedule',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};