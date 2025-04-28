import { Request, Response, NextFunction } from 'express';

export const validateAppointment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, email, doctor, date, time, reason } = req.body;

    if (!fullName || !email || !doctor || !date || !time || !reason) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Validation error occurred' });
    return;
  }
};