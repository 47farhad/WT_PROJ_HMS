import mongoose from 'mongoose';
import Appointment from '../models/appointment.model.js';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js'


import { createTransaction } from './transaction.controller.js';

export const createAppointment = async (req: any, res: any) => {
  const { datetime, doctorId, description } = req.body;
  const reqUser = req.user;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!datetime || !doctorId || !description) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Prevent booking the same doctor and time
    const duplicateBySameUser = await Appointment.findOne({
      doctorId,
      datetime: new Date(datetime),
      patientId: reqUser._id,
    }).session(session);

    if (duplicateBySameUser) {
      await session.abortTransaction();
      return res.status(409).json({ message: 'You have already booked this appointment' });
    }

    // Prevent double booking with ANY doctor at the same time
    const userConflictAtSameTime = await Appointment.findOne({
      datetime: new Date(datetime),
      patientId: reqUser._id,
    }).session(session);

    if (userConflictAtSameTime) {
      await session.abortTransaction();
      return res.status(409).json({ message: 'You already have an appointment at this time with another doctor' });
    }

    // Check if someone else has already booked and paid
    const existingAppointment = await Appointment.findOne({
      doctorId,
      datetime: new Date(datetime),
    }).session(session);

    if (existingAppointment) {
      const existingPaidTransaction = await Transaction.findOne({
        referenceId: existingAppointment._id,
        type: 'Appointment',
        status: 'paid',
      }).session(session);

      if (existingPaidTransaction) {
        await session.abortTransaction();
        return res.status(409).json({ message: 'Appointment already confirmed and paid for by another user' });
      }
    }

    // Create new appointment
    const newAppointment = new Appointment({
      datetime,
      doctorId,
      patientId: reqUser._id,
      description,
    });

    await newAppointment.save({ session });

    
    await createTransaction({
      userId: reqUser._id,
      referenceId: newAppointment._id,
      type: 'Appointment',
    }, session);

    await session.commitTransaction();

    return res.status(201).json({
      message: 'Appointment created successfully',
      appointment: newAppointment,
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Error in createAppointment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    session.endSession();
  }
};


export const updateAppointment = async (req: any, res: any) => {
  const reqUser = req.user;
  const appointmentId = req.params.id;

  try {
    if (!appointmentId) {
      return res.status(400).json({ message: 'Appointment ID is required' });
    }

    if (appointmentId.length !== 24) {
      return res.status(404).json({ message: 'Invalid Appointment ID' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Authorization checks
    if (reqUser.userType === "Doctor") {
      return res.status(403).json({ message: 'Forbidden - Not Authorized' });
    }

    if (reqUser.userType === "Patient" && appointment.patientId.toString() !== reqUser._id.toString()) {
      return res.status(403).json({ message: 'Forbidden - Not Authorized' });
    }

    // Update only the status
    appointment.status = "cancelled";
    await appointment.save();

    // If status is 'cancelled', delete related transaction
    if (appointment.status === 'cancelled') {
      await Transaction.deleteMany({
        type: 'Appointment',
        status: 'unpaid',
        referenceId: appointmentId
      });
    }

    return res.status(200).json({
      message: 'Appointment cancelled successfully',
      updatedAppointment: appointment,
    });
  } catch (error) {
    console.error("Error in controller: updateAppointment", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

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
    console.log("Error in controller: getAppointmentDetails", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getAllAppointments = async (req: any, res: any) => {
  try {
    const reqUser = req.user;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const appointmentsList = await Appointment.aggregate([
      // Match appointments for the specific patient
      { $match: (reqUser.userType === 'Patient' ? {patientId: reqUser._id} : {doctorId: reqUser._id}) },

      // Sort by createdAt in descending order
      { $sort: { createdAt: -1 } },

      // Skip and limit for pagination
      { $skip: skip },
      { $limit: limit },

      // Lookup to join with Users collection to get doctor details
      {
        $lookup: {
          from: "users", // assuming your User model uses "users" collection
          localField: "doctorId",
          foreignField: "_id",
          as: "doctor"
        }
      },

      // Unwind the doctor array (since lookup returns an array)
      { $unwind: "$doctor" },

      // Project the fields you want
      {
        $project: {
          doctorId: 1,
          appointmentDate: 1,
          status: 1,
          datetime: 1,
          description: 1,
          "doctorFirstName": "$doctor.firstName",
          "doctorLastName": "$doctor.lastName"
        }
      }
    ]);

    const total = await Appointment.countDocuments({ patientId: reqUser._id });
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      appointmentsData: appointmentsList,

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
export const getDoctors = async (req: any, res: any) => {
  try {
    const doctors = await User.find({ userType: "Doctor" }).select("doctorId firstName lastName");
    res.status(200).json(doctors)
  }
  catch (error: any) {
    console.error("Error in getDoctors:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getDoctor = async (req: any, res: any) => {
  try {
    const doctorId = req.params.id;
    const doctor = await User.findById(doctorId, { password: 0 });

    if ((doctor !== null) && doctor.userType !== 'Doctor') {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor)
  }
  catch (error: any) {
    console.error("Error in getDoctor:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
