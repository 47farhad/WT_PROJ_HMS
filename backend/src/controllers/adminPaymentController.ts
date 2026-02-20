import { Request, Response } from 'express';
import Transaction from '../models/transaction.model.js'; // Make sure to import Transaction
import User from '../models/user.model.js';
import mongoose from 'mongoose';

// Get all transactions for admin view
export const getAllPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    // Handle pagination with proper type casting
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '20');
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const totalCount = await Transaction.countDocuments();
    
    // Get all transactions with pagination
    const transactions = await Transaction.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    
    if (transactions.length === 0) {
      res.status(200).json({
        success: true,
        count: 0,
        data: [],
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: false
        }
      });
      return;
    }
    
    // Prepare data for admin panel
    const paymentsData = await Promise.all(transactions.map(async (transaction: any) => {
      // Get patient name
      let patientName = 'Unknown Patient';
      try {
        const patient = await User.findById(transaction.userId);
        if (patient) {
          // Handle different user model structures
          if (patient.firstName && patient.lastName) {
            patientName = `${patient.firstName} ${patient.lastName}`.trim();
          } else {
            // Your User model doesn't have 'name' property
            patientName = `Patient ${patient._id.toString().slice(-4)}`;
          }
        }
      } catch (err) {
        console.error('Error fetching patient:', err);
      }
      
      // Format date
      const date = new Date(transaction.createdAt);
      const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      
      // Map transaction status to display status - case insensitive
      const status = (transaction.status || '').toLowerCase();
      const statusMap: Record<string, string> = {
        'unpaid': 'Pending',
        'paid': 'Paid',
        'failed': 'Failed'
      };
      
      // Get original type from transaction - don't modify it for backend
      const originalType = transaction.type;
      
      // For display only - create a formatted treatment name
      let displayTreatment = originalType;
      if (originalType === 'LabTest') {
        displayTreatment = 'LabTest';
      } else if (originalType === 'Order') {
        displayTreatment = 'Order';
      }
      
      // Log each formatted payment
      const payment = {
        _id: transaction._id,
        invoiceId: `INV-${transaction._id.toString().slice(-4).toUpperCase()}`,
        patientId: transaction.userId,
        patientName,
        treatment: originalType, // Keep original type for database consistency
        displayTreatment, // Add a display version for the frontend
        date: formattedDate,
        amount: transaction.amount || 0,
        status: statusMap[status] || 'Pending',
        createdAt: transaction.createdAt
      };
      
      return payment;
    }));
    
    res.status(200).json({
      success: true,
      count: paymentsData.length,
      data: paymentsData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page < Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllPayments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: (error as Error).message
    });
  }
};

// Get summary statistics (total amounts, counts by status)
export const getPaymentsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get overall totals
    const overall = await Transaction.aggregate([
      { $group: { 
        _id: null, 
        totalAmount: { $sum: '$amount' },
        totalCount: { $sum: 1 },
        approvedAmount: { 
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] }
        },
        pendingAmount: { 
          $sum: { $cond: [{ $eq: ['$status', 'unpaid'] }, '$amount', 0] }
        }
      }}
    ]);
    
    // Get counts by status
    const statusCounts = await Transaction.aggregate([
      { $group: { 
        _id: '$status', 
        count: { $sum: 1 },
        amount: { $sum: '$amount' }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Get totals by type
    const typeTotals = await Transaction.aggregate([
      { $group: { 
        _id: '$type', 
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { total: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        categoryTotals: typeTotals,
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
    console.error('Error in getPaymentsSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment summary',
      error: (error as Error).message
    });
  }
};

// Get a single transaction by ID
export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }
    
    // Get patient info
    let patientName = 'Unknown Patient';
    try {
      const patient = await User.findById(transaction.userId);
      if (patient) {
        patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient';
      }
    } catch (err) {
      console.error('Error fetching patient:', err);
    }
    
    // Format date
    const date = new Date(transaction.createdAt);
    const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    
    // Map status
    const statusMap: Record<string, string> = {
      'unpaid': 'Pending',
      'paid': 'Paid',
      'failed': 'Failed'
    };
    
    // Format response
    const paymentData = {
      _id: transaction._id,
      invoiceId: `INV-${transaction._id.toString().slice(-4).toUpperCase()}`,
      patientId: transaction.userId,
      patientName,
      treatment: transaction.type,
      date: formattedDate,
      amount: transaction.amount,
      status: statusMap[transaction.status] || transaction.status,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    };
    
    res.status(200).json({
      success: true,
      data: paymentData
    });
  } catch (error) {
    console.error('Error in getPaymentById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: (error as Error).message
    });
  }
};

// Update transaction status
export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!['unpaid', 'paid', 'failed'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be one of: unpaid, paid, failed'
      });
      return;
    }
    
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
      return;
    }
    
    // Update transaction
    transaction.status = status;
    await transaction.save();
    
    // Format response
    const date = new Date(transaction.createdAt);
    const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    
    const statusMap: Record<string, string> = {
      'unpaid': 'Pending',
      'paid': 'Paid',
      'failed': 'Failed'
    };
    
    // Get patient name
    let patientName = 'Unknown Patient';
    try {
      const patient = await User.findById(transaction.userId);
      if (patient) {
        patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown Patient';
      }
    } catch (err) {
      console.error('Error fetching patient:', err);
    }
    
    const paymentData = {
      _id: transaction._id,
      invoiceId: `INV-${transaction._id.toString().slice(-4).toUpperCase()}`,
      patientId: transaction.userId,
      patientName,
      treatment: transaction.type,
      date: formattedDate,
      amount: transaction.amount,
      status: statusMap[transaction.status] || transaction.status
    };
    
    
    res.status(200).json({
      success: true,
      data: paymentData
    });
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: (error as Error).message
    });
  }
};