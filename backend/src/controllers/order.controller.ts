import Order from '../models/order.model.js';
import OfferedMedicine from '../models/offeredMedicine.model.js';
import mongoose from 'mongoose';
import { createTransaction } from './transaction.controller.js';

export const createOrder = async (req: any, res: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const items = req.body;

        // Input validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Order items are required' });
        }

        const invalidItems = items.some(item =>
            !item.medicine || !item.quantity || item.quantity < 1
        );

        if (invalidItems) {
            await session.abortTransaction();
            return res.status(400).json({
                message: 'Each item must contain valid medicineId and quantity (minimum 1)'
            });
        }

        // Single query to fetch all medicines
        const medicineIds = items.map(item => item.medicine);
        const medicines = await OfferedMedicine.find({
            _id: { $in: medicineIds }
        }).session(session);

        // Create medicine map for quick lookup
        const medicineMap = new Map(
            medicines.map(med => [med._id.toString(), med])
        );

        // Calculate total price and validate medicines
        let totalPrice = 0;
        const orderItems = [];

        for (const item of items) {
            const medicine = medicineMap.get(item.medicine);

            if (!medicine) {
                await session.abortTransaction();
                return res.status(404).json({
                    message: `Medicine with ID ${item.medicine} not found`
                });
            }

            if (medicine.status !== 'available') {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `${medicine.name} is not available`
                });
            }

            totalPrice += medicine.price * item.quantity;
            orderItems.push({
                medicineId: item.medicine,
                quantity: item.quantity
            });
        }

        // Create order
        const order = new Order({
            patientId: userId,
            items: orderItems,
            totalPrice,
            status: 'pending'
        })

        await order.save({ session })

        const transactionId = await createTransaction({
            userId: userId,
            referenceId: order._id,
            type: 'Order',
            amount: totalPrice
        }, session);

        // Commit transaction
        await session.commitTransaction();

        res.status(201).json({
            order: order,
            transaction: transactionId
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal server error' });
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