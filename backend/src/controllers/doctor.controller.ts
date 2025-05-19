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

async function ensureUserModel() {
  try {
    console.log('[EMERGENCY PATCH] Checking User model...');
    
    // If User model is undefined or not working, get it directly from mongoose
    let User;
    
    try {
      // First try the imported model
      User = mongoose.model('User');
      console.log('[EMERGENCY PATCH] Successfully retrieved existing User model');
    } catch (err) {
      console.error('[EMERGENCY PATCH] Error getting User model:', (err instanceof Error ? err.message : String(err)));
      
      // If the model doesn't exist yet, define it
      console.log('[EMERGENCY PATCH] Defining User model schema');
      
      // Define a minimal User schema that matches your actual schema structure
      const UserSchema = new mongoose.Schema({
        email: String,
        firstName: String,
        lastName: String,
        userType: String,
        password: String,
        phone: String,
        profilePic: String,
        doctorInfo: {
          specialization: String,
          qualifications: [String],
          experience: Number,
          workSchedule: [Object],
          commission: Number,
          department: String,
          isAvailable: Boolean,
          ratings: [Object],
          averageRating: Number
        },
        isActive: Boolean,
        createdAt: Date,
        updatedAt: Date
      }, { 
        strict: false,
        collection: 'users' // Force the collection name to match your existing collection
      });
      
      User = mongoose.model('User', UserSchema);
      console.log('[EMERGENCY PATCH] Created new User model');
    }
    
    // Test the model with a simple query
    const count = await User.countDocuments();
    console.log(`[EMERGENCY PATCH] Successfully queried User model. Found ${count} users`);
    
    // Apply a global fix - redefine the exported User model
    global._fixedUserModel = User;
    
    return User;
  } catch (error) {
    console.error('[EMERGENCY PATCH] Critical error:', error);
    throw error;
  }
}

// Logging helper with proper types
const logDebug = (message: string, data: any = null): void => {
  console.log(`[DOCTOR CONTROLLER] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

/**
 * Get all doctors
 */
export const getAllDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    logDebug('getAllDoctors called');

    // First, check if any users exist in the database
    const totalUsers = await User.countDocuments();
    logDebug(`Total users in database: ${totalUsers}`);

    // Check what user types exist in the database
    const userTypes = await User.distinct('userType');
    logDebug(`User types found in database: ${userTypes.join(', ')}`);

    // Query for doctors with User model
    logDebug('Querying for doctors with userType: Doctor');
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
    
    logDebug(`Found ${doctors.length} doctors with exact userType match`);
    
    // If no doctors found with exact match, try case-insensitive search
    let finalDoctors = doctors;
    if (doctors.length === 0) {
      logDebug('No doctors found with exact match, trying case-insensitive search');
      
      const doctorsInsensitive = await User.find(
        { userType: { $regex: new RegExp('doctor', 'i') } }
      );
      
      logDebug(`Found ${doctorsInsensitive.length} doctors with case-insensitive search`);
      
      if (doctorsInsensitive.length > 0) {
        finalDoctors = doctorsInsensitive;
      } else {
        // If still no doctors, look for users with doctorInfo field
        logDebug('Trying to find users with doctorInfo field');
        const usersWithDoctorInfo = await User.find(
          { 'doctorInfo.specialization': { $exists: true } }
        );
        
        logDebug(`Found ${usersWithDoctorInfo.length} users with doctorInfo field`);
        
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
    
    logDebug(`Returning ${formattedDoctors.length} formatted doctors`);
    
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
    logDebug(`getDoctorById called with ID: ${id}`);
    
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
      logDebug(`No doctor found with ID: ${id}`);
      res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
      return;
    }
    
    logDebug(`Found doctor: ${doctor.firstName} ${doctor.lastName}`);
    
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
    
    logDebug(`updateDoctor called with ID: ${id}`, req.body);
    
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
      logDebug(`No doctor found with ID: ${id}`);
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
    logDebug(`Doctor updated successfully: ${doctor.firstName} ${doctor.lastName}`);
    
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
    logDebug(`getDoctorSchedule called with ID: ${id}`);
    
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
      logDebug(`No doctor found with ID: ${id}`);
      res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
      return;
    }
    
    const workSchedule = doctor.doctorInfo?.workSchedule || [];
    logDebug(`Found doctor schedule with ${workSchedule.length} entries`);
    
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