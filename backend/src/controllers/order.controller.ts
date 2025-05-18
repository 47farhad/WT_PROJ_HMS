import Order from '../models/order.model.js';
import OfferedMedicine from '../models/offeredMedicine.model.js';
import mongoose from 'mongoose';
import { createTransaction } from './transaction.controller.js';
import { calculateActivePrescription } from './prescription.controller.js';
import Prescription from '../models/prescription.model.js';

export const createOrder = async (req: any, res: any) => {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const userId = req.user._id;
            const items = req.body;

            // Input validation
            if (!items || !Array.isArray(items) || items.length === 0) {
                throw new Error('Order items are required');
            }

            const invalidItems = items.some(item =>
                !item.medicine || !item.quantity || item.quantity < 1
            );

            if (invalidItems) {
                throw new Error('Each item must contain valid medicine and quantity (minimum 1)');
            }

            // Get all medicines
            const medicineIds = items.map(item => new mongoose.Types.ObjectId(item.medicine));
            const medicines = await OfferedMedicine.find({ _id: { $in: medicineIds } }).session(session);

            // Create medicine map
            const medicineMap = new Map(medicines.map(med => [med._id.toString(), med]));
            const prescriptionRequiredMedicines = medicines
                .filter(med => med.requiresPrescription)
                .map(med => med._id.toString());

            // Check prescription availability if needed
            if (prescriptionRequiredMedicines.length > 0) {
                const prescriptions = await Prescription.aggregate([
                    {
                        $match: {
                            expiryDate: { $gte: new Date() },
                            'items.medicineId': { $in: prescriptionRequiredMedicines.map(id => new mongoose.Types.ObjectId(id)) }
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
                            "appointment.patientId": new mongoose.Types.ObjectId(userId)
                        }
                    }
                ]).session(session);

                console.log(prescriptions)

                // Calculate available quantities
                const availableQuantityMap = new Map<string, number>();
                for (const prescription of prescriptions) {
                    const activeData = await calculateActivePrescription(
                        prescription._id.toString(),
                        userId.toString()
                    );

                    activeData.medicines.forEach(med => {
                        if (prescriptionRequiredMedicines.includes(med.medicineId.toString())) {
                            const current = availableQuantityMap.get(med.medicineId.toString()) || 0;
                            availableQuantityMap.set(med.medicineId.toString(), current + med.remainingQuantity);
                        }
                    });
                }

                // Validate against order quantities
                for (const item of items) {
                    if (prescriptionRequiredMedicines.includes(item.medicine.toString())) {
                        const available = availableQuantityMap.get(item.medicine) || 0;
                        if (available < item.quantity) {
                            const medicine = medicineMap.get(item.medicine);
                            throw new Error(
                                `Insufficient prescription for ${medicine?.name || 'medicine'}. ` +
                                `Available: ${available}, Requested: ${item.quantity}`
                            );
                        }
                    }
                }
            }

            // Calculate total price
            let totalPrice = 0;
            const orderItems = [];

            console.log(medicineMap)

            for (const item of items) {
                console.log(item)
                const medicine = medicineMap.get(item.medicine);
                if (!medicine) {
                    throw new Error(`Medicine ${item.medicine} not found`);
                }
                if (medicine.status !== 'available') {
                    throw new Error(`${medicine.name} is not available`);
                }

                totalPrice += medicine.price * item.quantity;
                orderItems.push({
                    medicineId: new mongoose.Types.ObjectId(item.medicine),
                    quantity: item.quantity
                });
            }

            // Create and save order
            const order = new Order({
                patientId: userId,
                items: orderItems,
                totalPrice,
                status: 'pending'
            });
            await order.save({ session });

            // Create transaction
            await createTransaction({
                userId: userId,
                referenceId: order._id,
                type: 'Order',
                amount: totalPrice
            }, session);

            res.status(201).json({
                order: order,
                message: 'Order created successfully'
            });
        });
    } catch (error: any) {
        console.error('Error creating order:', error);
        res.status(error.message.includes('Insufficient') ? 403 : 500).json({
            message: error.message
        });
    } finally {
        session.endSession();
    }
};

export const getOrders = async (req: any, res: any) => {
    try {
        const reqUser = req.user;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const ordersList = await Order.aggregate([
            { $match: { patientId: reqUser._id } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },

            // totalMedicines sum of all item quantities
            {
                $addFields: {
                    totalMedicines: {
                        $sum: {
                            $map: {
                                input: "$items",
                                as: "item",
                                in: "$$item.quantity"
                            }
                        }
                    }
                }
            },

            // Lookup transaction based on orderId
            {
                $lookup: {
                    from: "transactions",
                    let: { orderId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$referenceId", "$$orderId"] },
                                        { $eq: ["$type", "Order"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                amount: 1
                            }
                        }
                    ],
                    as: "transactionDetails"
                }
            },

            { $unwind: { path: "$transactionDetails", preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    status: 1,
                    createdAt: 1,
                    totalMedicines: 1,
                    transactionId: "$transactionDetails._id",
                    totalPrice: "$transactionDetails.amount"
                }
            }
        ]);

        const total = await Order.countDocuments({ patientId: reqUser._id });
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
            ordersData: ordersList,
            pagination: {
                currentPage: page,
                totalPages,
                hasMore: page < totalPages
            }
        });

    } catch (error: any) {
        console.error("Error in getOrders:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getOrderDetails = async (req: any, res: any) => {
    try {
        const orderId = req.params.orderId

        const orderDetails = await Order.aggregate([
            { $match: { _id: mongoose.Types.ObjectId.createFromHexString(orderId) } },

            // Unwind items to join medicine info
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "offeredmedicines",
                    localField: "items.medicineId",
                    foreignField: "_id",
                    as: "medicineDetails"
                }
            },
            { $unwind: "$medicineDetails" },

            // Limit medicine fields
            {
                $project: {
                    _id: 1,
                    status: 1,
                    createdAt: 1,
                    "items.quantity": "$items.quantity",
                    "items.medicine.name": "$medicineDetails.name",
                    "items.medicine.price": "$medicineDetails.price",
                    "items.medicine.dosage": "$medicineDetails.dosage",
                    "items.medicine.picture": "$medicineDetails.picture"
                }
            },

            // Regroup items back into array
            {
                $group: {
                    _id: "$_id",
                    status: { $first: "$status" },
                    createdAt: { $first: "$createdAt" },
                    items: { $push: "$items" }
                }
            },

            // Join with transactions
            {
                $lookup: {
                    from: "transactions",
                    let: { orderId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$referenceId", "$$orderId"] },
                                        { $eq: ["$type", "Order"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                amount: 1
                            }
                        }
                    ],
                    as: "transaction"
                }
            },
            {
                $unwind: {
                    path: "$transaction",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Final projection
            {
                $project: {
                    orderId: "$_id",
                    status: 1,
                    createdAt: 1,
                    items: 1,
                    transaction: 1 // Only amount field included from previous projection
                }
            }
        ]);


        if (!orderDetails.length) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(orderDetails[0]);

    } catch (error: any) {
        console.error("Error in getOrderDetails:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};