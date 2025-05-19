import mongoose from 'mongoose';
import PatientLabTest from '../models/patientLabTest.model.js';
import Transaction from '../models/transaction.model.js'
import OfferedTest from '../models/offeredTest.model.js';

import { createTransaction } from './transaction.controller.js';

import cloudinary from '../lib/cloudinary.js';
import fs from 'fs';

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

        // Check if someone else has already booked and paid
        const existingLabTest = await PatientLabTest.findOne({
            offeredTestId,
            datetime: new Date(datetime),
            status: "confirmed"
        }).session(session);

        if (existingLabTest) {
            await session.abortTransaction();
            return res.status(409).json({ message: 'PatientLabTest already confirmed and paid for by another user' });

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
            amount: offeredTest.price
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

        // Base match condition - only filter by patient if not admin
        const baseMatch = reqUser.userType === 'Admin'
            ? { status: 'confirmed' }  // Only confirmed tests for admin
            : { patientId: reqUser._id };

        const aggregationPipeline: any[] = [
            // Conditional matching
            { $match: baseMatch },

            // Sort by creation date
            { $sort: { createdAt: -1 } },

            // Pagination
            { $skip: skip },
            { $limit: limit },

            // Join with offered tests
            {
                $lookup: {
                    from: "offeredtests",
                    localField: "offeredTestId",
                    foreignField: "_id",
                    as: "testDetails"
                }
            },
            { $unwind: "$testDetails" }
        ];

        // For admin, join with User collection to get patient details
        if (reqUser.userType === 'Admin') {
            aggregationPipeline.push(
                {
                    $lookup: {
                        from: "users",
                        localField: "patientId",
                        foreignField: "_id",
                        as: "patientDetails"
                    }
                },
                { $unwind: "$patientDetails" }
            );
        }

        // Common projection for both user types
        const commonProjection = {
            datetime: 1,
            result: 1,
            "testName": "$testDetails.name",
            "testPrice": "$testDetails.price"
        };

        // Admin-specific projection
        const adminProjection = {
            ...commonProjection,
            "patientId": 1,
            "patientFirstName": "$patientDetails.firstName",
            "patientLastName": "$patientDetails.lastName",
            "patientProfilePicture": "$patientDetails.profilePic"
        };

        // Regular user projection
        const userProjection = {
            ...commonProjection,
            status: 1
        };

        aggregationPipeline.push({
            $project: reqUser.userType === 'Admin' ? adminProjection : userProjection
        });

        const labTestsList = await PatientLabTest.aggregate(aggregationPipeline);

        // Count documents with same condition
        const total = await PatientLabTest.countDocuments(baseMatch);
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

export const uploadResult = async (req: any, res: any) => {
    try {
        const { testId } = req.params;

        // Validate file exists
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Validate file type
        if (req.file.mimetype !== 'application/pdf') {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Only PDF files are allowed" });
        }

        const uploadOptions: any = {
            resource_type: 'raw',
            public_id: `test_${testId}`,
            type: 'upload',
            access_mode: 'public',
            flags: 'attachment',
            filename_override: `test-result-${testId}.pdf`,
            context: `filename=test-result-${testId}`
        };

        const result = await cloudinary.uploader.upload(req.file.path, uploadOptions);

        // Clean up temp file
        fs.unlinkSync(req.file.path);

        // Update the lab test document with the result URL
        const updatedTest = await PatientLabTest.findByIdAndUpdate(
            testId,
            {
                $set: {
                    result: result.secure_url,
                }
            },
            { new: true }
        );

        if (!updatedTest) {
            return res.status(404).json({ message: "Test not found" });
        }

        // Return response with download link
        return res.status(200).json({ result: result.secure_url });

    }
    catch (error: any) {
        console.error("Error uploading test result:", error);

        // Clean up temp file if it exists
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({ message: "Failed to upload test result" });
    }
};

export const getPatientDetailsLabReports = async (req: any, res: any) => {
    try {
        const { patientId } = req.params;

        const labReports = await PatientLabTest.aggregate([
            {
                $match: {
                    patientId: new mongoose.Types.ObjectId(patientId),
                    result: { $exists: true, $ne: "" }
                }
            },
            {
                $sort: { datetime: -1 }
            },
            {
                $limit: 3
            },
            {
                $lookup: {
                    from: "offeredtests", // Collection name (usually lowercase plural)
                    localField: "offeredTestId",
                    foreignField: "_id",
                    as: "offeredTest"
                }
            },
            {
                $unwind: "$offeredTest" // Convert array to object
            },
            {
                $project: {
                    date: "$datetime",
                    testName: "$offeredTest.name",
                    resultUrl: "$result",
                    _id: 1
                }
            }
        ]);

        // Format empty test names
        const formattedReports = labReports.map(report => ({
            ...report,
            testName: report.testName || 'Unknown Test'
        }));

        res.status(200).json(formattedReports);

    } catch (error) {
        console.error('Error fetching lab reports:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};