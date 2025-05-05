import React, { useEffect, useState } from 'react';
import PaymentForm from './PaymentForm';
import { useAppointmentStore } from '../store/useAppointmentStore';

interface BookAppointmentProps {
  onClose: () => void;
    formData: {
    fullName: string;
    email: string;
    date: string;
    time: string;
    reason: string;
    doctor: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  error: string;
  success: boolean;
}

const BookAppointment: React.FC<BookAppointmentProps> = ({
  onClose,
  formData,
  handleChange,
  error,
  success,
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const { doctors, getDoctors } = useAppointmentStore();

  const handleBooking = async () => {
    try {
      const appointmentResponse = await axiosInstance.post('/appointments', {
        fullName: formData.fullName,
        email: formData.email,
        doctor: formData.doctor,
        date: formData.date,
        time: formData.time,
        reason: formData.reason,
      });
  
      const transactionResponse = await axiosInstance.post('/transactions', {
        appointmentId: appointmentResponse.data.id,
        amount: 50, // Example amount
        status: 'unpaid',
      });
  
      setSuccess(true);
      setShowPayment(true);
    } catch (error) {
      setError('Failed to create appointment or transaction. Please try again.');
    }
  };
  
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ( !formData.doctor || !formData.date || !formData.time || !formData.reason) {
      setError('All fields are required.');
      return;
    }
    handleBooking();
  };
  useEffect(() => {
    getDoctors()
  }, [getDoctors])
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Doctor</label>
                <select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>{doc.firstName + ' ' + doc.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-1/2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#243954]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-1/2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#243954]"
                  required
                />
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
          onSubmit={handleBooking}
          amount={50}
          doctor={formData.doctor}
          description={formData.reason}
        />
      )}
    </div>
  );
};

export default BookAppointment;