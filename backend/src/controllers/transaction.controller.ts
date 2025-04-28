import { Request, Response } from 'express';
import Transaction from '../models/transaction.model';
import Appointment from '../models/appointment.model';

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();

    // Update appointment payment status
    if (req.body.appointmentId) {
      await Appointment.findByIdAndUpdate(req.body.appointmentId, {
        paymentStatus: 'Completed',
        status: 'Confirmed'
      });
    }

    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find()
      .populate('appointmentId', 'fullName email date time')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactionById = async (req: Request, res: Response) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('appointmentId');
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};