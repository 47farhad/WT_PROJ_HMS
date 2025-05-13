import Transaction from '../models/transaction.model.js';
import Appointment from '../models/appointment.model.js';
import PatientLabTest from '../models/patientLabTest.model.js';
import Order from '../models/order.model.js';
import mongoose from 'mongoose';


export const createTransaction = async (transactionData: any, session: any) => {
  const { userId, referenceId, type, amount } = transactionData;

  if (!referenceId || !type) {
    throw new Error("Missing Fields for transaction");
  }

  const newTransac: any = {
    userId,
    referenceId,
    type
  }

  if (amount) newTransac.amount = amount;

  const newTransaction = new Transaction(newTransac);
  if (newTransaction) {
    await newTransaction.save({ session });
    return newTransaction._id;
  }
  throw new Error("Error in creating transaction");
};

export const getAllTransactions = async (req: any, res: any) => {
  try {
    const reqUser = req.user;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const transactionsList = await Transaction.aggregate([
      // Match transactions for the specific patient
      { $match: { userId: reqUser._id } },

      // Sort by createdAt in descending order
      { $sort: { createdAt: -1 } },

      // Skip and limit for pagination
      { $skip: skip },
      { $limit: limit },

      // Project the fields you want
      {
        $project:
        {
          updatedAt: 1,
          type: 1,
          referenceId: 1,
          amount: 1,
          status: 1,
        }

      }
    ]);

    const total = await Transaction.countDocuments({ userId: reqUser._id });
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      transactionsData: transactionsList,

      pagination: {
        currentPage: page,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error: any) {
    console.error("Error in getTransactions:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTransaction = async (req: any, res: any) => {
  const transactionId = req.params.id;
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // 1. Update the transaction status
      const transaction = await Transaction.findByIdAndUpdate(
        transactionId,
        { status: 'paid' },
        { new: true, session }
      );

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // 2. Handle type-specific operations
      if (transaction.type === 'Appointment') {
        const [result] = await Appointment.aggregate([
          { $match: { _id: transaction.referenceId } },
          {
            $facet: {
              current: [{ $project: { datetime: 1, doctorId: 1 } }],
              conflicts: [
                {
                  $lookup: {
                    from: "appointments",
                    let: { dt: "$datetime", docId: "$doctorId" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $ne: ["$_id", transaction.referenceId] },
                              { $eq: ["$datetime", "$$dt"] },
                              { $eq: ["$doctorId", "$$docId"] },
                              { $ne: ["$status", "cancelled"] }
                            ]
                          }
                        }
                      }
                    ],
                    as: "conflicts"
                  }
                },
                { $unwind: "$conflicts" },
                { $project: { _id: "$conflicts._id" } }
              ]
            }
          },
          { $unwind: "$current" }
        ]).session(session);

        const conflictIds = result?.conflicts?.map((c: { _id: any }) => c._id) || [];

        await Promise.all([
          Appointment.updateOne(
            { _id: transaction.referenceId },
            { $set: { status: 'confirmed' } },
            { session }
          ),
          conflictIds.length > 0 && Appointment.updateMany(
            { _id: { $in: conflictIds } },
            { $set: { status: 'cancelled' } },
            { session }
          ),
          conflictIds.length > 0 && Transaction.updateMany(
            { referenceId: { $in: conflictIds }, type: 'Appointment' },
            { $set: { status: 'failed' } },
            { session }
          )
        ]);

      } else if (transaction.type === 'LabTest') {
        const [result] = await PatientLabTest.aggregate([
          { $match: { _id: transaction.referenceId } },
          {
            $facet: {
              current: [{ $project: { datetime: 1 } }],
              conflicts: [
                {
                  $lookup: {
                    from: "patientlabtests",
                    let: { dt: "$datetime" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              { $ne: ["$_id", transaction.referenceId] },
                              { $eq: ["$datetime", "$$dt"] },
                              { $ne: ["$status", "cancelled"] }
                            ]
                          }
                        }
                      }
                    ],
                    as: "conflicts"
                  }
                },
                { $unwind: "$conflicts" },
                { $project: { _id: "$conflicts._id" } }
              ]
            }
          },
          { $unwind: "$current" }
        ]).session(session);

        const conflictIds = result?.conflicts?.map((c: { _id: any }) => c._id) || [];

        await Promise.all([
          PatientLabTest.updateOne(
            { _id: transaction.referenceId },
            { $set: { status: 'confirmed' } },
            { session }
          ),
          conflictIds.length > 0 && PatientLabTest.updateMany(
            { _id: { $in: conflictIds } },
            { $set: { status: 'cancelled' } },
            { session }
          ),
          conflictIds.length > 0 && Transaction.updateMany(
            { referenceId: { $in: conflictIds }, type: 'LabTest' },
            { $set: { status: 'failed' } },
            { session }
          )
        ]);

      } else if (transaction.type === 'Order') {
        await Order.findByIdAndUpdate(
          transaction.referenceId,
          { $set: { status: 'confirmed' } },
          { session }
        );
      }

      return transaction;
    });

    const updatedTransaction = await Transaction.findById(transactionId);
    return res.status(200).json(updatedTransaction);

  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error in updateTransaction:", error.message);
    const status = error.message === 'Transaction not found' ? 404 : 500;
    return res.status(status).json({ message: error.message || "Internal Server Error" });
  } finally {
    session.endSession();
  }
};

export const getTransactionDetails = async (req: any, res: any) => {
  const reqUser = req.user;
  try {
    const transactionId = req.params.id;

    // Find the transaction by ID
    const transaction = await Transaction.findById(transactionId);

    // If the transaction is not found, return a 404 error
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Authorization check: if the user is a patient, ensure they can only access their own transaction
    if (reqUser.userType === "Patient") {
      if (transaction.userId.toString() !== reqUser._id.toString()) {
        return res.status(403).json({ message: 'Forbidden - Not Authorized' });
      }
    }

    // If everything is fine, return the transaction details
    return res.status(200).json({ transaction });
  } catch (error) {
    // Log the error and return a generic 500 error for server issues
    console.error("Error in controller: getTransactionDetails", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};