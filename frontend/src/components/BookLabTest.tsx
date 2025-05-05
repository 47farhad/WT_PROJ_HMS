import React, { useState } from 'react';
import PaymentForm from './PaymentForm';

const BookLabTest = ({ test, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState('booking');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = () => {
    onSuccess();
  };

  if (currentStep === 'payment') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center "  
      style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 50%, #f5f3ff 100%)' }}>
        <PaymentForm
          amount={test.price}
          onSuccess={handlePaymentSuccess}
          onBack={() => setCurrentStep('booking')}
          testDetails={{
            ...formData,
            testName: test.name,
            price: test.price
          }}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center "
     style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 50%, #f5f3ff 100%)' }}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-[#243954] mb-6 text-center">Book Lab Test</h2>

        <div className="mb-6 text-center">
          <p className="text-xl font-semibold">{test.name}</p>
          <p className="text-gray-600">Price: ${test.price}</p>
          <p className="text-gray-600">Duration: {test.duration}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#243954]"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#243954]"
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#243954]"
            required
          />
          <div className="flex space-x-4">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-1/2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#243954]"
              required
            />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-1/2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#243954]"
              required
            />
          </div>
          <textarea
            name="notes"
            placeholder="Additional Notes (Optional)"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#243954]"
            rows={3}
          ></textarea>

          <button
            type="submit"
            className="w-full py-3 bg-[#243954] text-white font-semibold rounded-lg hover:bg-[#1a2c42] transition duration-200"
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookLabTest;
