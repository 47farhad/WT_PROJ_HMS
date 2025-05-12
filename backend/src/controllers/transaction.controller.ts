import Transaction from '../models/transaction.model.js';
import Appointment from '../models/appointment.model.js';
import PatientLabTest from '../models/patientLabTest.model.js';


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
    return;
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

export const updateTransaction = async (req: any, res: any) => {
  const transactionId = req.params.id;
  const { status } = req.body;

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // If the status is 'paid', ensure no duplicate paid transaction exists
    if (status === 'paid') {
      let existingPaidTransaction;

      if (transaction.type === 'Appointment' || transaction.type === 'LabTest') {
        existingPaidTransaction = await Transaction.findOne({
          type: transaction.type,
          status: 'paid',
          _id: { $ne: transactionId }, // exclude current transaction
          referenceId: transaction.referenceId
        });
      }

      if (existingPaidTransaction) {
        // Mark current transaction as failed
        transaction.status = 'failed';
        await transaction.save();

        // Cancel the associated Appointment or LabTest
        if (transaction.type === 'Appointment') {
          const appointment = await Appointment.findById(transaction.referenceId);
          if (appointment) {
            appointment.status = 'cancelled';
            await appointment.save();
          }
        }

        if (transaction.type === 'LabTest') {
          const labTest = await PatientLabTest.findById(transaction.referenceId);
          if (labTest) {
            labTest.status = 'cancelled';
            await labTest.save();
          }
        }

        return res.status(400).json({ message: 'Transaction failed. Already confirmed by another user.' });
      }
    }

    // No conflict — proceed to update transaction status
    transaction.status = status;
    await transaction.save();

    // If paid, confirm appointment/lab test
    if (status === 'paid') {
      if (transaction.type === 'Appointment') {
        const appointment = await Appointment.findById(transaction.referenceId);
        if (appointment) {
          appointment.status = 'confirmed';
          await appointment.save();
        }
      }

      if (transaction.type === 'LabTest') {
        const labTest = await PatientLabTest.findById(transaction.referenceId);
        if (labTest) {
          labTest.status = 'confirmed';
          await labTest.save();
        }
      }
    }

    return res.status(200).json({ message: 'Transaction updated successfully', transaction });

  } catch (error: any) {
    console.error("Error in updateTransaction:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
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