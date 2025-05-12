import Order from '../models/order.model.js';
import OfferedMedicine from '../models/offeredMedicine.model.js';
import Transaction from '../models/transaction.model.js';
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
        const order: any = await Order.create([{
            patientId: userId,
            items: orderItems,
            totalPrice,
            status: 'pending'
        }], { session });

        // Create transaction
        const transactionId = await createTransaction({
            userId,
            referenceId: order._id,
            type: 'Medication',
            amount: totalPrice
        }, session);

        // Commit transaction
        await session.commitTransaction();

        res.status(201).json({
            order: order[0],
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