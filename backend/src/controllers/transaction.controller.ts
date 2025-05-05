import { Request, Response } from 'express';
import Transaction from '../models/transaction.model.js';

export const createTransaction = async (req: any, res: any) => {
  const { cardNumber, cardName, expiryDate,cvv } = req.body;
  const reqUser = req.user;

  try {
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newTransaction = new Transaction({
      cardNumber,
      cardName,
      expiryDate,
      cvv
    });

    if (newTransaction) {
        await newTransaction.save();
        const { _id, transactionType, amount, status, paymentMethod, transactionDate } = newTransaction;
        return res.status(201).json({
          message: 'Transaction created successfully',
          transaction: { _id, transactionType, amount, status, paymentMethod, transactionDate },
        });
      }

  }
  catch (error) {
    console.log("Error in controller: createTransaction");
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getAllTransactions = async (req: any, res: any) => {
  try {
    const reqUser = req.user;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const transactionsList = await Transaction.aggregate([
      // Match transactions for the specific patient
      { $match: { patientId: reqUser._id } },

      // Sort by createdAt in descending order
      { $sort: { createdAt: -1 } },

      // Skip and limit for pagination
      { $skip: skip },
      { $limit: limit },

      // Project the fields you want
      {
        $project: {
          date: 1,
          transactionType: 1,
          status: 1,
          amount: 1,
        }
      }
    ]);

    const total = await Transaction.countDocuments({ patientId: reqUser._id });
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
export const getTransactionDetails = async (req: any, res: any) => {
  const reqUser = req.user;
  try {
    const transactionId = req.params.id;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).json({ transaction });
  }
  catch (error) {
    console.log("Error in controller: getTransactionDetails");
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const updateTransaction = async (req: any, res: any) => {
    const transactionId = req.params.id;
    const { status } = req.body;
    try {
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      transaction.status = status;
      await transaction.save();
      return res.status(200).json({ message: 'Transaction updated successfully', transaction });
    } 
    catch (error:any) {
      console.error("Error in updateTransaction:", error.message);
      return res.status(500).json({ message: "Internal Server Error" });
    }
};