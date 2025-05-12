import Transaction from '../models/transaction.model.js';
import Appointment from '../models/appointment.model.js';


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

    // If the status is 'Paid', check if someone else has already paid for the same appointment or lab test
    if (status === 'paid') {
      let existingPaidTransaction;

      // Check for conflicting paid transaction for the same Appointment
      if (transaction.type === 'Appointment') {
        existingPaidTransaction = await Transaction.findOne({
          type: 'Appointment',
          status: 'paid',
          _id: { $ne: transactionId }, // Exclude the current transaction
          appointmentId: transaction.referenceId // if this is referencing an appointment
        });
      }


      if (existingPaidTransaction ) {
        // Another user has already paid for the same appointment or lab test
        transaction.status = 'failed';
        await transaction.save();

        // Cancel the associated appointment or lab test based on the transaction type
        if (transaction.type === 'Appointment') {
          const appointment = await Appointment.findById(transaction.referenceId);

          if (appointment) {
            appointment.status = 'cancelled';
            await appointment.save();
          }
        }

        return res.status(400).json({ message: 'Transaction failed. Appointment already confirmed by another user.' });
      }
    }

    // If no conflicting transaction, update the status to 'Paid' or 'Unpaid' based on user input
    transaction.status = status;
    await transaction.save();
    if (status === 'paid' && transaction.type === 'Appointment') {
      const appointment = await Appointment.findById(transaction.referenceId);
      if (appointment) {
        appointment.status = 'confirmed';
        await appointment.save();
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