import { Request, Response } from 'express';
import Appointment from '../models/appointment.model.js';

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};