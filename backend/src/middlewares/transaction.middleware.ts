import { Request, Response, NextFunction } from 'express';

export const validateTransaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { amount, type, description } = req.body;

    if (!amount || !type || !description) {
      res.status(400).json({ message: 'Amount, type, and description are required' });
      return;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ message: 'Amount must be a positive number' });
      return;
    }

    const validTypes = ['Appointment', 'Medicine', 'Lab Test', 'Other'];
    if (!validTypes.includes(type)) {
      res.status(400).json({ message: 'Invalid transaction type' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Validation error occurred' });
    return;
  }
};