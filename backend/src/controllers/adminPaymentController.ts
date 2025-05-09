// controllers/paymentController.ts
import { Request, Response } from 'express';
import Payment, { IPayment } from '../models/adminPayment.model';
import mongoose from 'mongoose';

// Create a custom request type that includes the user property
interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
    [key: string]: any;
  };
}

interface PaymentFilters {
  category?: string;
  status?: string;
  patientId?: string;
  doctorId?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  amount?: {
    $gte?: number;
    $lte?: number;
  };
}

// Get all payments with filtering options
export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      category, 
      status, 
      patientId, 
      doctorId,
      startDate,
      endDate,
      minAmount,
      maxAmount
    } = req.query;
    
    const query: PaymentFilters = {};
    
    // Apply filters if provided
    if (category) query.category = category as string;
    if (status) query.status = status as string;
    if (patientId) query.patientId = patientId as string;
    if (doctorId) query.doctorId = doctorId as string;
    
    // Handle date range
    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate as string);
      if (endDate) dateFilter.$lte = new Date(endDate as string);
      query.createdAt = dateFilter;
    }
    
    // Handle amount range
    if (minAmount || maxAmount) {
      const amountFilter: any = {};
      if (minAmount) amountFilter.$gte = Number(minAmount);
      if (maxAmount) amountFilter.$lte = Number(maxAmount);
      query.amount = amountFilter;
    }
    
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 }) // Sort by most recent first
      .exec();
    
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: (error as Error).message
    });
  }
};

// Get payment summary statistics
export const getPaymentsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get total amounts by category
    const categoryTotals = await Payment.aggregate([
      { $match: { status: 'approved' } },
      { $group: { 
        _id: '$category', 
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { total: -1 } }
    ]);
    
    // Get counts by status
    const statusCounts = await Payment.aggregate([
      { $group: { 
        _id: '$status', 
        count: { $sum: 1 },
        amount: { $sum: '$amount' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Get overall totals
    const overall = await Payment.aggregate([
      { $group: { 
        _id: null, 
        totalAmount: { $sum: '$amount' },
        totalCount: { $sum: 1 },
        approvedAmount: { 
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$amount', 0] }
        },
        pendingAmount: { 
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] }
        }
      }}
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        categoryTotals,
        statusCounts,
        overall: overall[0] || {
          totalAmount: 0,
          totalCount: 0,
          approvedAmount: 0,
          pendingAmount: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment summary',
      error: (error as Error).message
    });
  }
};

// Get single payment by ID
export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: (error as Error).message
    });
  }
};

// Update payment status (approve, reject, refund)
export const updatePaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const adminId = req.user?.id; // Now TypeScript recognizes this property
    
    if (!['pending', 'approved', 'rejected', 'refunded'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
      return;
    }
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }
    
    // Update payment
    payment.status = status as IPayment['status'];
    if (status === 'approved') {
      payment.approvedBy = adminId as unknown as mongoose.Types.ObjectId;
      payment.approvedAt = new Date();
    }
    
    await payment.save();
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: (error as Error).message
    });
  }
};

// Create a new payment
export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const payment = await Payment.create(req.body);
    
    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create payment',
      error: (error as Error).message
    });
  }
};