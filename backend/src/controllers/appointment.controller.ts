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

    // Check if someone else has already booked and paid
    const existingAppointment = await Appointment.findOne({
      doctorId,
      datetime: new Date(datetime),
      status: 'confirmed'
    }).session(session);

    if (existingAppointment) {
      await session.abortTransaction();
      return res.status(409).json({ message: 'Appointment already confirmed and paid for by another user' });
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

export const getPatientDetailsAppointments = async (req: any, res: any) => {
  try {
    const { patientId } = req.params;
    const now = new Date();

    // Get next upcoming appointment with only required fields
    const upcomingAppointment = await Appointment.findOne({
      patientId,
      datetime: { $gte: now },
      status: { $ne: 'cancelled' }
    })
      .sort({ datetime: 1 })
      .populate({
        path: 'doctorId',
        select: 'firstName lastName'
      })
      .select('datetime description doctorId')
      .lean()
      .exec();

    // Get two most recent past appointments with only required fields
    const pastAppointments = await Appointment.find({
      patientId,
      datetime: { $lt: now },
      status: { $ne: 'cancelled' }
    })
      .sort({ datetime: -1 })
      .populate({
        path: 'doctorId',
        select: 'firstName lastName'
      })
      .select('datetime description doctorId')
      .limit(2)
      .lean()
      .exec();

    res.status(200).json({
      upcoming: upcomingAppointment,
      past: pastAppointments
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: "Internal Server Error" });
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

    let appointment;

    if (reqUser.userType === "Doctor") {
      // Doctor is requesting — populate patient name
      appointment = await Appointment.findById(appointmentId).populate({
        path: 'patientId',
        select: 'firstName lastName profilePic email',
      });

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      if (appointment.doctorId.toString() !== reqUser._id.toString()) {
        return res.status(403).json({ message: 'Forbidden - Not Authorized' });
      }

    } else if (reqUser.userType === "Patient") {
      // Patient is requesting — populate doctor name
      appointment = await Appointment.findById(appointmentId).populate({
        path: 'doctorId',
        select: 'firstName lastName email profilePic specialization',
      });

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      if (appointment.patientId.toString() !== reqUser._id.toString()) {
        return res.status(403).json({ message: 'Forbidden - Not Authorized' });
      }

    } else {
      return res.status(403).json({ message: 'Forbidden - Invalid User Type' });
    }

    return res.status(200).json({ appointment });

  } catch (error) {
    console.log("Error in controller: getAppointmentDetails", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllAppointments = async (req: any, res: any) => {
  try {
    const reqUser = req.user;
    const isPatient = reqUser.userType === 'Patient';

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const baseMatch = isPatient
      ? { patientId: reqUser._id } 
      : { 
          doctorId: reqUser._id,
          status: 'confirmed' 
        };

    const pipeline: any[] = [
      { $match: baseMatch },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ];

    // Add conditional $lookup and projection
    if (isPatient) {
      // Patient view: show doctor details
      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctor"
          }
        },
        { $unwind: "$doctor" },
        {
          $project: {
            doctorId: 1,
            appointmentDate: 1,
            status: 1,
            datetime: 1,
            description: 1,
            doctorProfilePic: "$doctor.profilePic",
            doctorFirstName: "$doctor.firstName",
            doctorLastName: "$doctor.lastName"
          }
        }
      );
    } else {
      // Doctor view: show patient details
      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "patientId",
            foreignField: "_id",
            as: "patient"
          }
        },
        { $unwind: "$patient" },
        {
          $project: {
            patientId: 1,
            appointmentDate: 1,
            status: 1,
            datetime: 1,
            description: 1,
            patientProfilePic: "$patient.profilePic",
            patientFirstName: "$patient.firstName",
            patientLastName: "$patient.lastName"
          }
        }
      );
    }

    const appointmentsList = await Appointment.aggregate(pipeline);

    // Count total - use the same match conditions
    const total = await Appointment.countDocuments(baseMatch);
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
    console.error("Error in getAllAppointments:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getDoctors = async (req: any, res: any) => {
  try {
    const doctors = await User.find({ userType: "Doctor" }).select("doctorId firstName lastName profilePic");
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

export const getDoctorAppointmentStats = async (req: any, res: any) => {
  try {
    const doctorId = req.params.doctorId;
    const currentDate = new Date();

    // Validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: 'Invalid doctor ID' });
    }

    // Check if doctor exists
    const doctorExists = await User.exists({ _id: doctorId, userType: 'Doctor' });
    if (!doctorExists) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get counts using aggregation for better performance
    const stats = await Appointment.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(doctorId)
        }
      },
      {
        $facet: {
          totalAppointments: [
            { 
              $match: { 
                status: 'confirmed' 
              } 
            },
            { $count: "count" }
          ],
          upcomingAppointments: [
            { 
              $match: { 
                datetime: { $gt: currentDate },
                status: 'confirmed' 
              } 
            },
            { $count: "count" }
          ],
        }
      },
      {
        $project: {
          totalAppointments: { $arrayElemAt: ["$totalAppointments.count", 0] },
          upcomingAppointments: { $arrayElemAt: ["$upcomingAppointments.count", 0] },
          
        }
      }
    ]);

    // Format response
    const result = {
      totalAppointments: stats[0]?.totalAppointments,
      upcomingAppointments: stats[0]?.upcomingAppointments,
     
    };

    return res.status(200).json(result);

  } catch (error) {
    console.error("Error in getDoctorAppointmentStats:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};