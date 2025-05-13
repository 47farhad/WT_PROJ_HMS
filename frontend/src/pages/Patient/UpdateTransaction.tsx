import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../../store/useTransactionStore.ts';
import toast from 'react-hot-toast';

const UpdateTransaction = () => {
 
  const { transactionId } = useParams();
  const navigate = useNavigate();
   const {
      getTransactionDetails,
      isTransactionLoading,
      updateTransaction,
      selectedTransaction,
    } = useTransactionStore();

  // Payment form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cvv, setCvv] = useState('');
  const [expiry, setExpiry] = useState('');

  useEffect(() => {
      if (transactionId) {
        getTransactionDetails(transactionId);
      }
    }, [transactionId, getTransactionDetails]);
if (isTransactionLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 bg-[#1a2c42]"></div>
      </div>
    );

  const handlePayment = async (e) => {
    e.preventDefault();

    // Basic validation
    if (cardNumber.length !== 16 || isNaN(cardNumber)) {
      return toast.error("Card number must be 16 digits");
    }
    if (cvv.length !== 3 || isNaN(cvv)) {
      return toast.error("CVV must be 3 digits");
    }
    if (!expiry.match(/^\d{4}-\d{2}$/)) {
      return toast.error("Expiry must be in YYYY-MM format");
    }

    if (!cardName.trim()) {
      return toast.error("Cardholder name is required");
    }

    // Proceed to update the transaction
    await updateTransaction(transactionId);

    // Redirect or show confirmation
    navigate('/Payments'); // Adjust route as needed
  };

  if (!selectedTransaction) {
    return <div className="p-4 text-center">Loading transaction...</div>;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-green-50 to-purple-100"></div>
      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Payment for Transaction</h2>
        <p className="text-center text-lg font-medium mb-6 text-gray-600">
          Amount: <span className="text-green-600 font-bold">${selectedTransaction.amount}</span>
        </p>

        <form onSubmit={handlePayment} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              placeholder="1234 5678 9012 3456"
              className="mt-1 w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
            <input
              type="text"
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              placeholder="John Doe"
              className="mt-1 w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="123"
                className="mt-1 w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring focus:ring-blue-200"
                required
              />
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input
                type="month"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                min={new Date().toISOString().slice(0, 7)} // ensures only current or future months
                className="mt-1 w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring focus:ring-blue-200"
                required
              />

            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#243954] text-white py-2 rounded-lg hover:bg-[#4c6280] transition"
          >
            Pay Now
          </button>

          <button
            type="button"
            onClick={() => navigate("/Payments")}
            className="w-full bg-gray-100 text-[#243954] py-2 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>

  );
};

export default UpdateTransaction;
