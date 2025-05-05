import React, { useState } from 'react';
import { axiosInstance } from '../lib/axios';
import { useNavigate } from 'react-router-dom';

interface PaymentFormProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  amount: number;
  description: string;
  appointmentId: string; 
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onClose, onSubmit, amount, description,appointmentId }) => {

  const navigate = useNavigate();

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({
    cardNumber: '',
    expiryDate: '',
    nameOnCard: '',
    cvv: '',
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setPaymentData({ ...paymentData, cardNumber: value });
    setErrors({ ...errors, cardNumber: '' }); // clear error on change
    if (value.length !== 16) {
      setErrors(prev => ({ ...prev, cardNumber: 'Card number must be 16 digits' }));
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    
    if (selectedDate < today) {
      setErrors({ ...errors, expiryDate: 'Card has expired' });
    } else {
      setErrors({ ...errors, expiryDate: '' });
    }
    setPaymentData({ ...paymentData, expiryDate: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!paymentData.nameOnCard.trim()) {
      setErrors({ ...errors, nameOnCard: 'Name is required' });
      return;
    }
    if (!paymentData.cvv || paymentData.cvv.length !== 3) {
      setErrors({ ...errors, cvv: 'Valid CVV is required' });
      return;
    }
    if (errors.cardNumber || errors.expiryDate) {
      return;
    }

    try {
      // Create transaction in backend
      await axiosInstance.post('/transactions', {
        appointmentId,
        amount,
        type: 'Appointment',
        description,
        status: 'Completed',
        paymentDetails: {
          cardNumber: paymentData.cardNumber,
          nameOnCard: paymentData.nameOnCard,
          expiryDate: paymentData.expiryDate
        }
      });

      setPaymentSuccess(true);
      setTimeout(() => {
        onSubmit(e);
      }, 1500);
    } catch (err){
      setErrors({ ...errors, cardNumber: 'Payment processing failed' });
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-[#243954] p-6 text-center">
        <h1 className="text-2xl font-bold text-white">Payment Details</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {paymentSuccess && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
            Payment successful! Processing your appointment...
          </div>
        )}

        <div className="text-center mb-4">
          <p className="text-lg font-medium">Amount to Pay: ${amount}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
          <input
            type="text"
            value={paymentData.cardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234567890123456"
            maxLength={16}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
          />
          {errors.cardNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
          <input
            type="text"
            value={paymentData.nameOnCard}
            onChange={(e) => setPaymentData({ ...paymentData, nameOnCard: e.target.value })}
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="date"
              value={paymentData.expiryDate}
              onChange={handleExpiryDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
            />
            {errors.expiryDate && (
              <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
            <input
              type="password"
              value={paymentData.cvv}
              onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
              placeholder="123"
              maxLength={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
            />
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => {navigate("/Payments")}}
            disabled={paymentSuccess}
            className="bg-[#243954] hover:bg-[#1a2c42] text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={paymentSuccess}
            className="bg-[#243954] hover:bg-[#1a2c42] text-white px-5 py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            Pay & Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
