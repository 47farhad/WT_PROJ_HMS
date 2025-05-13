import mongoose from 'mongoose';
import PatientLabTest from '../models/patientLabTest.model.js';
import Transaction from '../models/transaction.model.js'
import OfferedTest from '../models/offeredTest.model.js';

import { createTransaction } from './transaction.controller.js';

export const bookLabTest = async (req: any, res: any) => {
    const { offeredTestId, datetime } = req.body;
    const reqUser = req.user;
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        if (!offeredTestId || !datetime) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Prevent booking the same test 
        const duplicateBySameUser = await PatientLabTest.findOne({
            offeredTestId,
            patientId: reqUser._id,
            status: { $ne: 'cancelled' }
        }).session(session);

        if (duplicateBySameUser) {
            await session.abortTransaction();
            return res.status(409).json({ message: 'You have already booked this LabTest' });
        }

        // Prevent double booking at the same time
        const userConflictAtSameTime = await PatientLabTest.findOne({
            datetime: new Date(datetime),
            patientId: reqUser._id,
            status: { $ne: 'cancelled' }
        }).session(session);

        if (userConflictAtSameTime) {
            await session.abortTransaction();
            return res.status(409).json({ message: 'You already have booked another Lab Test at this time' });
        }

        // Check if someone else has already booked and paid
        const existingLabTest = await PatientLabTest.findOne({
            offeredTestId,
            datetime: new Date(datetime),
        }).session(session);

        if (existingLabTest) {
            const existingPaidTransaction = await Transaction.findOne({
                referenceId: existingLabTest._id,
                type: 'LabTest',
                status: 'paid',
            }).session(session);

            if (existingPaidTransaction) {
                await session.abortTransaction();
                return res.status(409).json({ message: 'PatientLabTest already confirmed and paid for by another user' });
            }
        }
        const offeredTest = await OfferedTest.findById(offeredTestId).session(session);
        if (!offeredTest || offeredTest.status !== 'available') {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Selected lab test is not available' });
        }


        const newPatientLabTest = new PatientLabTest({
            offeredTestId,
            datetime,
            patientId: reqUser._id,
            name: offeredTest.name, 
        });

        await newPatientLabTest.save({ session });


        await createTransaction({
            userId: reqUser._id,
            referenceId: newPatientLabTest._id,
            type: 'LabTest',
        }, session);

        await session.commitTransaction();

        return res.status(201).json({
            message: 'LabTest booked successfully',
            patientLabTest: newPatientLabTest,
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Error in bookLabTest:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    } finally {
        session.endSession();
    }
};

export const getAllLabTests = async (req: any, res: any) => {
    try {
        const reqUser = req.user;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const labTestsList = await PatientLabTest.aggregate([
            // Match tests for the specific patient
            { $match: { patientId: reqUser._id } },

            // Sort by creation date
            { $sort: { createdAt: -1 } },

            // Skip and limit for pagination
            { $skip: skip },
            { $limit: limit },

            // Lookup to join with offeredtests collection
            {
                $lookup: {
                    from: "offeredtests",
                    localField: "offeredTestId",
                    foreignField: "_id",
                    as: "testDetails"
                }
            },

            // Unwind the testDetails array
            { $unwind: "$testDetails" },

            // Project desired fields
            {
                $project: {
                    datetime: 1,
                    result: 1,
                    status: 1,
                    "testName": "$testDetails.name",
                    "testPrice": "$testDetails.price"
                }
            }
        ]);

        const total = await PatientLabTest.countDocuments({ patientId: reqUser._id });
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            labTestsData: labTestsList,
            pagination: {
                currentPage: page,
                totalPages,
                hasMore: page < totalPages
            }
        });
    } catch (error: any) {
        console.error("Error in getAllLabTests:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const cancelLabTest = async (req: any, res: any) => {
    const reqUser = req.user;
    const patientLabTestId = req.params.id;

    try {
        if (!patientLabTestId) {
            return res.status(400).json({ message: 'LabTest ID is required' });
        }

        if (patientLabTestId.length !== 24) {
            return res.status(404).json({ message: 'Invalid PatientLabTest ID' });
        }

        const patientLabTest = await PatientLabTest.findById(patientLabTestId);
        if (!patientLabTest) {
            return res.status(404).json({ message: 'LabTest not found' });
        }

        // Authorization checks
        if (reqUser.userType === "Doctor") {
            return res.status(403).json({ message: 'Forbidden - Not Authorized' });
        }

        if (reqUser.userType === "Patient" && patientLabTest.patientId.toString() !== reqUser._id.toString()) {
            return res.status(403).json({ message: 'Forbidden - Not Authorized' });
        }

        // Update only the status
        patientLabTest.status = "cancelled";
        await patientLabTest.save();

        // If status is 'cancelled', delete related transaction
        if (patientLabTest.status === 'cancelled') {
            await Transaction.deleteMany({
                type: 'LabTest',
                status: 'unpaid',
                referenceId: patientLabTestId
            });
        }

        return res.status(200).json({
            message: 'LabTest cancelled successfully',
            cancelLabTest: patientLabTest,
        });
    } catch (error) {
        console.error("Error in controller: cancelLabTest", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getLabTestDetails = async (req: any, res: any) => {
    try {
        const labTestId = req.params.id;

        const offeredlabTest = await OfferedTest.findById(labTestId);

        if (!offeredlabTest) {
            return res.status(404).json({ message: 'OfferedLabTest not found' });
        }

        return res.status(200).json({ offeredlabTest });
    } catch (error) {
        console.log("Error in controller: getLabTestDetails", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
