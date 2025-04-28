import React, { useState } from 'react';
import PaymentForm from './PaymentForm';

interface BookAppointmentProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: {
    fullName: string;
    email: string;
    doctor: string;
    date: string;
    time: string;
    reason: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error: string;
  success: boolean;
  doctors: string[];
  availableDates: string[];
  availableTimes: string[];
}

const BookAppointment: React.FC<BookAppointmentProps> = ({
  onClose,
  onSubmit,
  formData,
  handleChange,
  error,
  success,
  doctors,
  availableDates,
  availableTimes
}) => {
  const [showPayment, setShowPayment] = useState(false);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.doctor || !formData.date || !formData.time || !formData.reason) {
      return;
    }
    setShowPayment(true);
  };
  return (
    <div className="fixed inset-0 bg-opacity-40 flex items-center justify-center z-50" 
         style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 50%, #f5f3ff 100%)' }}>
      {!showPayment ? (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-[#243954] p-6 text-center">
            <h1 className="text-2xl font-bold text-white">Book an Appointment</h1>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-5">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
            {success && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">Appointment successfully booked!</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Doctor</label>
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc} value={doc}>{doc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <select
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  disabled={!formData.doctor}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
                >
                  <option value="">Select Date</option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  disabled={!formData.doctor}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
                >
                  <option value="">Select Time</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={3}
                placeholder="Briefly describe your concern..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none resize-none"
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>

              <button
                type="submit"
                onClick={handleBooking}
                className="bg-[#243954] hover:bg-[#1a2c42] text-white px-5 py-2 rounded-lg font-medium transition"
              >
                Proceed to Payment
              </button>
            </div>
          </form>
        </div>
      ) : (
        <PaymentForm 
          onClose={() => setShowPayment(false)}
          onSubmit={onSubmit}
          amount={50}
          doctor={formData.doctor}
          description={formData.reason}
        />
      )}
    </div>
  );
};

export default BookAppointment;