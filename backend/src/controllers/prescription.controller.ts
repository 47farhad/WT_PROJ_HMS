import Prescription from "../models/prescription.model.js";
import Appointment from "../models/appointment.model.js";
import OfferedMedicine from "../models/offeredMedicine.model.js";
import mongoose from "mongoose";
import Order from "../models/order.model.js";

export const createPrescription = async (req: any, res: any) => {
    try {
        const { appointmentId } = req.params;
        const { items, expiryDate } = req.body;
        const doctorId = req.user._id.toString();


        const [appointmentExists, prescriptionExists] = await Promise.all([
            Appointment.exists({
                _id: appointmentId,
                doctorId: doctorId,
                status: 'confirmed'
            }),
            Prescription.exists({ appointmentId })
        ]);

        if (!appointmentExists) {
            return res.status(404).json({ message: "Appointment not found or not confirmed" });
        }

        if (prescriptionExists) {
            return res.status(400).json({ message: "Prescription already exists" });
        }

        // Validate expiry date is in the future
        if (new Date(expiryDate) <= new Date()) {
            return res.status(400).json({
                message: "Expiry date must be in the future"
            });
        }

        // Validate that all medicines require prescription
        const medicineIds = items.map((item: any) => item.medicineId);
        const medicines = await OfferedMedicine.find({
            _id: { $in: medicineIds }
        });

        // Check if all medicines exist
        if (medicines.length !== items.length) {
            return res.status(400).json({
                message: "One or more medicines not found"
            });
        }

        // Check if all medicines require prescription
        const nonPrescriptionMedicines = medicines.filter(
            medicine => !medicine.requiresPrescription
        );

        if (nonPrescriptionMedicines.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot prescribe medicines that don't require prescription",
                nonPrescriptionMedicines: nonPrescriptionMedicines.map(m => ({
                    _id: m._id,
                    name: m.name
                }))
            });
        }

        // Create new prescription
        const newPrescription = new Prescription({
            appointmentId,
            items,
            expiryDate
        });

        await newPrescription.save();

        res.status(201).json({ newPrescription });

    }
    catch (error) {
        console.log("Error in controller: createPrescription", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getPrescription = async (req: any, res: any) => {
    try {
        const { appointmentId } = req.params;
        const userId = req.user._id;

        // Find the appointment to verify patient ownership
        const appointment = await Appointment.findOne({
            _id: appointmentId,
            patient: userId
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found or you don't have access to it"
            });
        }

        // Find the prescription for this appointment
        const prescription = await Prescription.findOne({ appointmentId })
            .populate({
                path: 'items.medicineId',
                select: 'name description price requiresPrescription'
            })
            .populate({
                path: 'appointmentId',
                select: 'date time status'
            });

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "No prescription found for this appointment"
            });
        }

        res.status(200).json({
            success: true,
            prescription: {
                ...prescription.toObject(),
                isValid: new Date(prescription.expiryDate) >= new Date()
            }
        });

    } catch (error) {
        console.log("Error in controller: getPrescription", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

interface ActivePrescriptionData {
    prescriptionId: mongoose.Types.ObjectId;
    createdAt: Date;
    expiryDate: Date;
    isActive: boolean; // New field to show if prescription is still valid
    medicines: {
        medicineId: mongoose.Types.ObjectId;
        prescribedQuantity: number;
        orderedQuantity: number;
        remainingQuantity: number;
        isUsedUp: boolean;
    }[];
    overallStatus: {
        totalPrescribed: number;
        totalOrdered: number;
        remainingTotal: number; // New field
        isFullyUsed: boolean;
        isExpired: boolean; // New field
    };
}

export async function calculateActivePrescription(
    prescriptionId: string,
    patientId: string
): Promise<ActivePrescriptionData> {
    // 1. Get the prescription with appointment validation
    const prescription = await Prescription.findOne({
        _id: prescriptionId,
    }).populate({
        path: 'appointmentId',
        match: { patientId: patientId }
    });

    if (!prescription || !prescription.appointmentId) {
        throw new Error('Prescription not found or does not belong to patient');
    }

    // 2. Check if prescription is expired
    const currentDate = new Date();
    const isExpired = currentDate >= prescription.expiryDate;

    // 3. If expired, return immediately with zero remaining quantities
    if (isExpired) {
        return {
            prescriptionId: prescription._id,
            createdAt: prescription.createdAt,
            expiryDate: prescription.expiryDate,
            isActive: false,
            medicines: prescription.items.map(item => ({
                medicineId: item.medicineId,
                prescribedQuantity: item.quantity,
                orderedQuantity: 0,
                remainingQuantity: 0,
                isUsedUp: true
            })),
            overallStatus: {
                totalPrescribed: prescription.items.reduce((sum, item) => sum + item.quantity, 0),
                totalOrdered: 0,
                remainingTotal: 0,
                isFullyUsed: true,
                isExpired: true
            }
        };
    }

    // 4. Get all orders during prescription validity period (only if not expired)
    const orders = await Order.find({
        patientId: patientId,
        createdAt: {
            $gte: prescription.createdAt,
            $lte: prescription.expiryDate
        },
        status: { $ne: 'cancelled' }
    });

    // 5. Calculate medicine usage
    const prescriptionMap = new Map<string, number>();
    const orderedMap = new Map<string, number>();

    prescription.items.forEach(item => {
        prescriptionMap.set(item.medicineId.toString(), item.quantity);
    });

    orders.forEach(order => {
        order.items.forEach(item => {
            const medId = item.medicineId.toString();
            if (prescriptionMap.has(medId)) {
                orderedMap.set(medId, (orderedMap.get(medId) || 0) + item.quantity);
            }
        });
    });

    // 6. Prepare the result
    const medicines = prescription.items.map(item => {
        const medId = item.medicineId.toString();
        const orderedQty = orderedMap.get(medId) || 0;
        const remainingQty = Math.max(0, item.quantity - orderedQty);

        return {
            medicineId: item.medicineId,
            prescribedQuantity: item.quantity,
            orderedQuantity: orderedQty,
            remainingQuantity: remainingQty,
            isUsedUp: remainingQty <= 0
        };
    });

    const totalPrescribed = Array.from(prescriptionMap.values()).reduce((sum, qty) => sum + qty, 0);
    const totalOrdered = Array.from(orderedMap.values()).reduce((sum, qty) => sum + qty, 0);
    const remainingTotal = Math.max(0, totalPrescribed - totalOrdered);

    return {
        prescriptionId: prescription._id,
        createdAt: prescription.createdAt,
        expiryDate: prescription.expiryDate,
        isActive: true,
        medicines,
        overallStatus: {
            totalPrescribed,
            totalOrdered,
            remainingTotal,
            isFullyUsed: medicines.every(med => med.isUsedUp),
            isExpired: false
        }
    };
}

export const getPrescriptions = async (req: any, res: any) => {
    try {
        const reqUser = req.user;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        // Single Promise.all for all async operations
        const [
            prescriptionsList,
            totalCount,
            activeDataResults
        ] = await Promise.all([
            // 1. Get paginated prescriptions with doctor info
            Prescription.aggregate([
                {
                    $lookup: {
                        from: "appointments",
                        localField: "appointmentId",
                        foreignField: "_id",
                        as: "appointment"
                    }
                },
                { $unwind: "$appointment" },
                { $match: { "appointment.patientId": reqUser._id } },
                {
                    $lookup: {
                        from: "users",
                        localField: "appointment.doctorId",
                        foreignField: "_id",
                        as: "doctor"
                    }
                },
                { $unwind: "$doctor" },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        _id: 1,
                        createdAt: 1,
                        expiryDate: 1,
                        items: 1,
                        appointmentId: 1,
                        doctorName: {
                            $concat: ["$doctor.firstName", " ", "$doctor.lastName"]
                        }
                    }
                }
            ]),

            // 2. Get total count (parallel)
            Prescription.aggregate([
                {
                    $lookup: {
                        from: "appointments",
                        localField: "appointmentId",
                        foreignField: "_id",
                        as: "appointment"
                    }
                },
                { $unwind: "$appointment" },
                { $match: { "appointment.patientId": reqUser._id } },
                { $count: "total" }
            ]),

            // 3. Get all active data in parallel
            (async () => {
                const allPrescriptions = await Prescription.aggregate([
                    {
                        $lookup: {
                            from: "appointments",
                            localField: "appointmentId",
                            foreignField: "_id",
                            as: "appointment"
                        }
                    },
                    { $unwind: "$appointment" },
                    { $match: { "appointment.patientId": reqUser._id } },
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ]);

                return Promise.all(
                    allPrescriptions.map(prescription =>
                        calculateActivePrescription(prescription._id, reqUser._id)
                    )
                );
            })()
        ]);

        // Combine results
        const prescriptionsWithActiveData = prescriptionsList.map((prescription, index) => ({
            ...prescription,
            activeData: activeDataResults[index]
        }));

        const totalPages = Math.ceil((totalCount[0]?.total || 0) / limit);

        res.status(200).json({
            data: prescriptionsWithActiveData,
            pagination: {
                currentPage: page,
                totalPages,
                hasMore: page < totalPages
            }
        });

    } catch (error: any) {
        console.error("Error in getPrescriptions:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getPrescriptionDetails = async (req: any, res: any) => {
    try {
        const { prescriptionId } = req.params;
        const reqUser = req.user;

        // Parallelize main operations
        const [prescriptionResult, activeData] = await Promise.all([
            // 1. Get prescription with doctor and medicine details
            Prescription.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(prescriptionId)
                    }
                },
                {
                    $lookup: {
                        from: "appointments",
                        localField: "appointmentId",
                        foreignField: "_id",
                        as: "appointment"
                    }
                },
                { $unwind: "$appointment" },
                {
                    $match: {
                        "appointment.patientId": reqUser._id
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "appointment.doctorId",
                        foreignField: "_id",
                        as: "doctor"
                    }
                },
                { $unwind: "$doctor" },
                {
                    $lookup: {
                        from: "offeredmedicines",
                        localField: "items.medicineId",
                        foreignField: "_id",
                        as: "medicineDetails"
                    }
                },
                {
                    $project: {
                        _id: 1,
                        createdAt: 1,
                        expiryDate: 1,
                        appointmentId: 1,
                        doctorDetails: {
                            firstName: "$doctor.firstName",
                            lastName: "$doctor.lastName",
                            specialization: "$doctor.specialization"
                        },
                        items: {
                            $map: {
                                input: "$items",
                                as: "item",
                                in: {
                                    $mergeObjects: [
                                        "$$item",
                                        {
                                            $let: {
                                                vars: {
                                                    med: {
                                                        $arrayElemAt: [
                                                            {
                                                                $filter: {
                                                                    input: "$medicineDetails",
                                                                    as: "med",
                                                                    cond: {
                                                                        $eq: ["$$med._id", "$$item.medicineId"]
                                                                    }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    }
                                                },
                                                in: {
                                                    medicineName: "$$med.name",
                                                    medicineDescription: "$$med.description",
                                                    dosage: "$$med.dosage"
                                                }
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            ]),
            // 2. Get active data in parallel
            calculateActivePrescription(
                prescriptionId,
                reqUser._id
            )
        ]);

        if (prescriptionResult.length === 0) {
            return res.status(404).json({ message: "Prescription not found" });
        }

        const prescriptionData = prescriptionResult[0];

        res.status(200).json({
            ...prescriptionData,
            activeData,
            status: activeData.overallStatus.isExpired
                ? 'expired'
                : activeData.overallStatus.isFullyUsed
                    ? 'used'
                    : 'available'
        });

    } catch (error: any) {
        console.error("Error in getPrescriptionDetails:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};