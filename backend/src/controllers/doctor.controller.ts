// controllers/doctor.controller.ts

import { Request, Response } from 'express';
import Doctor, { IDoctor } from '../models/doctor.model';
import mongoose from 'mongoose'

// Custom interface for authenticated requests
interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
    [key: string]: any;
  };
}

// Get all doctors with filtering
export const getAllDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      specialty,
      department,
      name,
      minRating,
      isActive,
      isOnLeave,
      sortBy,
      sortOrder
    } = req.query;
    
    const filter: any = {};
    
    // Apply filters if provided
    if (specialty) filter.specialty = specialty;
    if (department) filter.department = department;
    if (name) filter.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    if (minRating) filter.averageRating = { $gte: Number(minRating) };
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isOnLeave !== undefined) filter.isOnLeave = isOnLeave === 'true';
    
    // Set up sorting options
    const sort: any = {};
    if (sortBy) {
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.name = 1; // Default sort by name ascending
    }
    
    const doctors = await Doctor.find(filter)
      .select('name specialty department experience averageRating commissionRate isActive isOnLeave profileImage totalAppointments')
      .sort(sort)
      .exec();
    
    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: (error as Error).message
    });
  }
};

// Get single doctor by ID
export const getDoctorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor',
      error: (error as Error).message
    });
  }
};

// Update doctor
export const updateDoctor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
      return;
    }
    
    // Update doctor fields
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedDoctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor',
      error: (error as Error).message
    });
  }
};

// Get doctor's schedule
export const getDoctorSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .select('schedule')
      .exec();
    
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: doctor.schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor schedule',
      error: (error as Error).message
    });
  }
};

// Update doctor's schedule
export const updateDoctorSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { schedule } = req.body;
    
    if (!schedule || !Array.isArray(schedule)) {
      res.status(400).json({
        success: false,
        message: 'Invalid schedule format'
      });
      return;
    }
    
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
      return;
    }
    
    doctor.schedule = schedule;
    await doctor.save();
    
    res.status(200).json({
      success: true,
      data: doctor.schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor schedule',
      error: (error as Error).message
    });
  }
};