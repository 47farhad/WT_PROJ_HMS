// PatientPayments.js
import React, { useState } from 'react';

function PatientPayments() {
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({
      ...paymentDetails,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle the payment logic here
    alert('Payment Successful!');
  };

  return (
    <div className="min-h-screen w-full p-6" style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 50%, #f5f3ff 100%)' }}>
      <div className="w-full max-w-screen-xl mx-auto">
        <h3 className="text-xl font-bold mb-4">Payment Details</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Card Number</label>
            <input
              type="text"
              name="cardNumber"
              value={paymentDetails.cardNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2"
              placeholder="Enter your card number"
              required
            />
          </div>
          <div className="mb-4 flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input
                type="month"
                name="expiryDate"
                value={paymentDetails.expiryDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2"
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700">CVV</label>
              <input
                type="text"
                name="cvv"
                value={paymentDetails.cvv}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2"
                placeholder="Enter CVV"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2"
              value="1000" // Example amount
              disabled
            />
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => window.history.back()} // Go back to the previous page
              className="bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#243954] text-white px-4 py-2 rounded-lg"
            >
              Pay Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PatientPayments;
