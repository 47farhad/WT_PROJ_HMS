import { Request, Response } from 'express';
import Appointment from '../models/appointment.model.js';

export const createAppointment = async (req: any, res: any) => {
  const { datetime, doctorId, description } = req.body;
  const reqUser = req.user;

  try {
    if (!datetime || !doctorId || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newAppointment = new Appointment({
      datetime,
      doctorId,
      patientId: reqUser._id,
      description
    });

    if (newAppointment) {
      await newAppointment.save();
      return res.status(201).json({ message: 'Appointment created successfully', appointment: newAppointment });
    }
    else {
      return res.status(400).json({ message: 'Failed to create appointment' });
    }

  }
  catch (error) {
    console.log("Error in controller: createAppointment");
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const deleteAppointment = async (req: any, res: any) => {
  const reqUser = req.user;

  try {
    const apppointmentId = req.params.id;

    if (!apppointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    if (apppointmentId.length !== 24) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = await Appointment.findById(apppointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (reqUser.userType === "Doctor") {
      return res.status(403).json({ message: 'Forbidden - Not Authorized' });
    }

    if (reqUser.userType === "Patient" && (appointment.patientId.toString() !== reqUser._id.toString())) {
      return res.status(403).json({ message: 'Forbidden - Not Authorized' });
    }

    await Appointment.findByIdAndDelete(apppointmentId);
    return res.status(200).json({ message: 'Appointment deleted successfully' });
  }
  catch (error) {
    console.log("Error in controller: deleteAppointment", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
export const getAppointmentDetails = async (req: any, res: any) => {
  const reqUser = req.user;
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (reqUser.userType === "Doctor") {
      if (appointment.doctorId.toString() !== reqUser._id.toString()) {
        return res.status(403).json({ message: 'Forbidden - Not Authorized' });
      }
    }
    else if (reqUser.userType === "Patient") {
      if (appointment.patientId.toString() !== reqUser._id.toString()) {
        return res.status(403).json({ message: 'Forbidden - Not Authorized' });
      }
    }

    return res.status(200).json({ appointment });
  }
  catch (error) {
    console.log("Error in controller: getAppointmentDetails");
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getAllAppointments = async (req: any, res: any) => {
  try {
    const reqUser = req.user;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const appointmentsList = await Appointment
      .find({ patientId: reqUser._id }) 
      .sort({ createdAt: -1 })         
      .skip(skip)
      .limit(limit)
      .select("doctorId appointmentDate status createdAt"); 

    const total = await Appointment.countDocuments({ patientId: reqUser._id });
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      appointments: appointmentsList,
      
      pagination: {
        currentPage: page,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error: any) {
    console.error("Error in getPatientAppointments:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
