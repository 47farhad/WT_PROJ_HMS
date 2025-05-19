import User from "../models/user.model.js";
import Appointment from "../models/appointment.model.js"
import mongoose from "mongoose";
import { format } from "date-fns";
import { createLog } from "./logging.controller.js";


export const getPatients = async (req: any, res: any) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const matchCondition: any = {
            userType: 'Patient'
        };

        let projectionFields: any = {
            "profilePic": 1,
            "firstName": 1,
            "lastName": 1,
            "contact": 1,
            "gender": 1,
            "age": 1,
            "_id": 1,
            "medicalInfo.dateOfBirth": 1
        };

        if (req.user?.userType === 'Doctor') {
            matchCondition._id = {
                $in: await Appointment.distinct('patientId', { doctorId: req.user._id })
            };
            projectionFields = {
                ...projectionFields,
                "upcomingAppointment": 1,
                "latestPastAppointment": 1
            };
        } else if (req.user?.userType === 'Admin') {
            projectionFields = {
                ...projectionFields,
                "upcomingAppointment": 1,
                "latestPastAppointment": 1
            };
        }

        const aggregationPipeline: any[] = [
            {
                $match: matchCondition
            }
        ];

        // Admin-specific logic for appointments
        if (req.user?.userType === 'Admin' || req.user?.userType === 'Doctor') {
            const appointmentMatchConditions: any = {
                $expr: { $eq: ['$patientId', '$$patientId'] },
                status: 'confirmed'
            };

            // Add doctor filter if user is a doctor
            if (req.user?.userType === 'Doctor') {
                appointmentMatchConditions.doctorId = req.user._id;
            }

            aggregationPipeline.push(
                {
                    $lookup: {
                        from: 'appointments',
                        let: { patientId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    ...appointmentMatchConditions,
                                    datetime: { $gte: new Date() }
                                }
                            },
                            { $sort: { datetime: 1 } }
                        ],
                        as: 'upcomingAppointments'
                    }
                },
                {
                    $lookup: {
                        from: 'appointments',
                        let: { patientId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    ...appointmentMatchConditions,
                                    datetime: { $lt: new Date() }
                                }
                            },
                            { $sort: { datetime: -1 } },
                            { $limit: 1 }
                        ],
                        as: 'latestPastAppointment'
                    }
                },
                {
                    $addFields: {
                        upcomingAppointment: { $arrayElemAt: ['$upcomingAppointments', 0] },
                        latestPastAppointment: { $arrayElemAt: ['$latestPastAppointment', 0] }
                    }
                }
            );
        }

        aggregationPipeline.push(
            {
                $facet: {
                    patients: [
                        { $skip: skip },
                        { $limit: limit },
                        { $project: projectionFields },
                        { $sort: { createdAt: -1 } }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        );

        const aggregationResult = await User.aggregate(aggregationPipeline);
        let patients = aggregationResult[0].patients;

        // Post-processing for admin to include doctor info and formatted appointment details
        if (req.user?.userType === 'Admin' || req.user?.userType === 'Doctor') {
            patients = await Promise.all(patients.map(async (patient: any) => {
                const appointment = patient.upcomingAppointment || patient.latestPastAppointment;

                if (!appointment) {
                    return {
                        ...patient,
                        appointmentDate: null,
                        appointmentTime: null,
                        description: null,
                        doctor: null,
                        status: null
                    };
                }

                const doctor = await User.findById(appointment.doctorId, 'firstName lastName');
                const doctorName = doctor ? `${doctor.firstName} ${doctor.lastName}` : null;

                const appointmentDate = format(new Date(appointment.datetime), 'dd-MMM-yyyy');
                const appointmentTime = format(new Date(appointment.datetime), 'h:mm a');

                return {
                    ...patient,
                    appointmentDate,
                    appointmentTime,
                    description: appointment.description,
                    doctor: doctorName,
                    status: appointment.status
                };
            }));
        }

        const totalCount = aggregationResult[0].totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            patients,
            pagination: {
                currentPage: page,
                hasMore: page < totalPages
            }
        });

    } catch (error: any) {
        console.log("Error in getPatients controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getPatientDetails = async (req: any, res: any) => {
    try {
        const { id: patientId } = req.params;

        const patient = await User.findById(patientId)

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        if (patient.userType !== 'Patient') {
            return res.status(404).json({ message: "Patient not found" });
        }

        return res.status(200).json(patient);
    }
    catch (error: any) {
        console.log("Error in getPatientDetails controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const convertToDoctor = async (req: any, res: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const adminId = req.user._id;

        // 1. Convert user to doctor
        const updatedUser = await User.findOneAndUpdate(
            { _id: id, userType: 'Patient' },
            { $set: { userType: 'Doctor' }, $unset: { medicalInfo: 1 } },
            { new: true, runValidators: true, session }
        );

        if (!updatedUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Patient not found' });
        }

        // 2. Create log using the updated createLog function
        const newLog = await createLog(adminId, id, 'Doctor', session);

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: 'User successfully converted to Doctor',
            data: {
                user: updatedUser,
                log: newLog
            }
        });

    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
            message: 'Error converting user to Doctor',
            error: error.message
        });
    }
};

export const convertToAdmin = async (req: any, res: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const adminId = req.user._id; // Assuming the current admin's ID is in req.user

        // 1. Convert user to admin
        const updatedUser = await User.findOneAndUpdate(
            { _id: id, userType: 'Patient' },
            {
                $set: { userType: 'Admin' },
                $unset: { medicalInfo: 1 }
            },
            {
                new: true,
                runValidators: true,
                session
            }
        );

        if (!updatedUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Patient not found' });
        }

        // 2. Create log entry using the shared createLog function
        const newLog = await createLog(adminId, id, 'Admin', session);

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            message: 'User successfully converted to Admin',
            data: {
                user: updatedUser,
                log: newLog
            }
        });

    } catch (error: any) {
        // Abort transaction on error
        await session.abortTransaction();
        session.endSession();

        return res.status(500).json({
            message: 'Error converting user to Admin',
            error: error.message
        });
    }
};