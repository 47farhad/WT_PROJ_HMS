// controllers/adminDoctorController.ts
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import { Request, Response } from 'express';

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
 * Get all doctors with their details
 */
export const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
  const doctors = await User.find(
    { userType: 'Doctor' },
    {
      firstName: 1,
      lastName: 1,
      email: 1,
      phone: 1,
      profilePic: 1,
      lastOnline: 1,
      doctorInfo: 1,
      isActive: 1,
      verified: 1,
      createdAt: 1
    }
  );
  
  // Transform the data to match the frontend expected format
  const formattedDoctors = doctors.map(doctor => {
    return {
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone || '',
      specialty: doctor.doctorInfo?.specialization || '',
      profilePic: doctor.profilePic || '',
      bio: '', // Add this field if available
      gender: '', // Add this field if available
      experience: doctor.doctorInfo?.experience || 0,
      department: doctor.doctorInfo?.department || '',
      commissionRate: doctor.doctorInfo?.commission || 0,
      averageRating: doctor.doctorInfo?.averageRating || 0,
      totalReviews: doctor.doctorInfo?.ratings?.length || 0,
      totalAppointments: 0, // You may need to calculate this from appointments
      isActive: doctor.isActive || false,
      isOnLeave: !(doctor.doctorInfo?.isAvailable || false),
      joinedAt: doctor.createdAt,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt
    };
  });
    
  res.status(200).json({
    success: true,
    data: formattedDoctors
  });
});

/**
 * Get a specific doctor's details
 */
export const getDoctorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid doctor ID'
    });
  }
  
  const doctor = await User.findOne(
    { _id: id, userType: 'Doctor' },
    {
      firstName: 1,
      lastName: 1,
      email: 1,
      phone: 1,
      profilePic: 1,
      lastOnline: 1,
      doctorInfo: 1,
      isActive: 1,
      verified: 1,
      createdAt: 1
    }
  );
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }
  
  // Handle the case where doctorInfo might be undefined
  const workScheduleArray = doctor.doctorInfo?.workSchedule || [];
  const schedule = workScheduleArray.map(schedule => {
    return {
      day: schedule.day ? schedule.day.toLowerCase() : '',
      isAvailable: schedule.isWorking || false,
      startTime: schedule.startTime || '',
      endTime: schedule.endTime || ''
    };
  });
  
  // Format doctor data for frontend
  const formattedDoctor = {
    _id: doctor._id,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    email: doctor.email,
    phone: doctor.phone || '',
    specialty: doctor.doctorInfo?.specialization || '',
    profilePic: doctor.profilePic || '',
    bio: '', // Add this field if available
    gender: '', // Add this field if available
    experience: doctor.doctorInfo?.experience || 0,
    department: doctor.doctorInfo?.department || '',
    commissionRate: doctor.doctorInfo?.commission || 0,
    averageRating: doctor.doctorInfo?.averageRating || 0,
    totalReviews: doctor.doctorInfo?.ratings?.length || 0,
    totalAppointments: 0, // You may need to calculate this from appointments
    isActive: doctor.isActive || false,
    isOnLeave: !(doctor.doctorInfo?.isAvailable || false),
    joinedAt: doctor.createdAt,
    createdAt: doctor.createdAt,
    updatedAt: doctor.updatedAt,
    doctorInfo: {
      // Use a simpler approach to avoid toObject() issues
      specialization: doctor.doctorInfo?.specialization || '',
      department: doctor.doctorInfo?.department || '',
      experience: doctor.doctorInfo?.experience || 0,
      commission: doctor.doctorInfo?.commission || 0,
      isAvailable: doctor.doctorInfo?.isAvailable || false,
      workSchedule: workScheduleArray,
      averageRating: doctor.doctorInfo?.averageRating || 0
    }
  };
    
  res.status(200).json({
    success: true,
    data: formattedDoctor
  });
});

/**
 * Update a doctor's details
 */
export const updateDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    specialty, 
    department, 
    experience, 
    commission, 
    isActive, 
    isAvailable 
  } = req.body;
  
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
  
  // Update doctorInfo fields - Using set method to avoid TypeScript errors
  if (specialty) doctor.set('doctorInfo.specialization', specialty);
  if (department) doctor.set('doctorInfo.department', department);
  if (experience) doctor.set('doctorInfo.experience', experience);
  if (commission !== undefined) doctor.set('doctorInfo.commission', commission);
  if (isAvailable !== undefined) doctor.set('doctorInfo.isAvailable', isAvailable);
  
  await doctor.save();
  
  res.status(200).json({
    success: true,
    message: 'Doctor updated successfully',
    data: doctor
  });
});

/**
 * Get doctor's schedule
 */
export const getDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid doctor ID'
    });
  }
  
  const doctor = await User.findOne(
    { _id: id, userType: 'Doctor' },
    {
      firstName: 1,
      lastName: 1,
      'doctorInfo.workSchedule': 1
    }
  );
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: {
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      workSchedule: doctor.doctorInfo?.workSchedule || []
    }
  });
});

/**
 * Update doctor's work schedule
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
  
  if (!Array.isArray(workSchedule)) {
    return res.status(400).json({
      success: false,
      message: 'Work schedule must be an array'
    });
  }
  
  const doctor = await User.findOne({ _id: id, userType: 'Doctor' });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor not found'
    });
  }
  
  // Initialize doctorInfo if it doesn't exist
  if (!doctor.doctorInfo) {
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
  
  // Update the work schedule - using the set method to avoid TypeScript errors
  doctor.set('doctorInfo.workSchedule', workSchedule);
  
  await doctor.save();
  
  // Fix for the second TypeScript error - ensure doctorInfo isn't null when we access it
  const savedWorkSchedule = doctor.doctorInfo ? doctor.doctorInfo.workSchedule : [];
  
  res.status(200).json({
    success: true,
    message: 'Work schedule updated successfully',
    data: {
      _id: doctor._id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      workSchedule: savedWorkSchedule
    }
  });
});