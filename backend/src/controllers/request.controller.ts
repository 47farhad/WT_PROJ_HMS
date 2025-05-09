// controllers/request.controller.ts
import { Request, Response } from 'express';
import DoctorRequest, { IRequest } from '../models/request.model';
import Doctor from '../models/doctor.model';
import mongoose from 'mongoose';

// Custom interface for authenticated requests
interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
    [key: string]: any;
  };
}

// Get all requests (for admin)
export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, status, sortBy, sortOrder } = req.query;
    
    const filter: any = {};
    
    // Apply filters if provided
    if (type) filter.type = type;
    if (status) filter.status = status;
    
    // Set up sorting options
    const sort: any = {};
    if (sortBy) {
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1; // Default sort by creation date descending (newest first)
    }
    
    const requests = await DoctorRequest.find(filter)
      .sort(sort)
      .exec();
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
      error: (error as Error).message
    });
  }
};

// Get requests for a specific doctor
export const getDoctorRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctorId = req.params.doctorId;
    
    const requests = await DoctorRequest.find({ doctorId })
      .sort({ createdAt: -1 })
      .exec();
    
    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor requests',
      error: (error as Error).message
    });
  }
};

// Update request status (approve/reject)
export const updateRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, adminNotes } = req.body;
    const requestId = req.params.requestId;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
      return;
    }
    
    const doctorRequest = await DoctorRequest.findById(requestId);
    
    if (!doctorRequest) {
      res.status(404).json({
        success: false,
        message: 'Request not found'
      });
      return;
    }
    
    // Update request status
    doctorRequest.status = status as IRequest['status'];
    doctorRequest.adminNotes = adminNotes || doctorRequest.adminNotes;
    
    // If approved, update doctor record accordingly
    if (status === 'approved') {
      const doctor = await Doctor.findById(doctorRequest.doctorId);
      
      if (!doctor) {
        res.status(404).json({
          success: false,
          message: 'Doctor not found'
        });
        return;
      }
      
      // Handle leave requests
      if (doctorRequest.type === 'leave' && doctorRequest.leaveDetails) {
        doctor.isOnLeave = true;
        await doctor.save();
      }
      
      // Handle commission change requests
      if (doctorRequest.type === 'commission_change' && doctorRequest.commissionDetails) {
        doctor.commissionRate = doctorRequest.commissionDetails.requestedRate;
        await doctor.save();
      }
    }
    
    await doctorRequest.save();
    
    res.status(200).json({
      success: true,
      data: doctorRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update request status',
      error: (error as Error).message
    });
  }
};

// Create a new request (for doctors)
export const createRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, leaveDetails, commissionDetails } = req.body;
    const doctorId = req.params.doctorId || req.user?.id;
    
    if (!doctorId) {
      res.status(400).json({
        success: false,
        message: 'Doctor ID is required'
      });
      return;
    }
    
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
      return;
    }
    
    // Create new request
    const newRequest = await DoctorRequest.create({
      doctorId,
      doctorName: doctor.name,
      type,
      leaveDetails,
      commissionDetails: type === 'commission_change' ? {
        ...commissionDetails,
        currentRate: doctor.commissionRate
      } : undefined,
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      data: newRequest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create request',
      error: (error as Error).message
    });
  }
};