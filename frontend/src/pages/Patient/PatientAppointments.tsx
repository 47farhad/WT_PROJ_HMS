import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../lib/axios";
import BookAppointment from "../../components/BookAppointment";

function PatientAppointments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    doctor: "",
    date: "",
    time: "",
    reason: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/appointments');
      setAppointments(data);
    } catch (err) {
      setError("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data } = await axiosInstance.get('/doctors');
      setDoctors(data);
    } catch (err) {
      setError("Failed to fetch doctors");
    }
  };

  const fetchAvailability = async (doctorId) => {
    try {
      const { data } = await axiosInstance.get(`/doctors/${doctorId}/availability`);
      setAvailableDates(data.dates);
      setAvailableTimes(data.times);
    } catch (err) {
      setError("Failed to fetch availability");
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (name === 'doctor' && value) {
      await fetchAvailability(value);
    }
  };

  const handlePaymentSuccess = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axiosInstance.post('/appointments', formData);
      setAppointments([...appointments, data]);
      setShowBookingModal(false);
      setFormData({
        fullName: "",
        email: "",
        doctor: "",
        date: "",
        time: "",
        reason: "",
      });
      setSuccess(true);
    } catch (err) {
      setError("Failed to create appointment");
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await axiosInstance.put(`/appointments/${appointmentId}`, { status: "Cancelled" });
      const updatedAppointments = appointments.map(apt => 
        apt._id === appointmentId ? { ...apt, status: "Cancelled" } : apt
      );
      setAppointments(updatedAppointments);
    } catch (err) {
      setError("Failed to cancel appointment");
    }
  };

  return (
    <div className="min-h-screen w-full p-6" style={{ background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 50%, #f5f3ff 100%)" }}>
      <div className="w-full max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search here..."
            className="w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => setShowBookingModal(true)}
            className="bg-[#243954] hover:bg-[#1a2c42] text-white px-5 py-2 rounded-lg font-medium transition"
          >
            + Book Appointment
          </button>
        </div>

        <div className="w-full max-w-screen-xl">
          <h3 className="text-xl text-[#243954] font-bold mb-4">Your Appointments</h3>
          <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-[#243954] text-white">
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments
                .filter((appointment) =>
                  appointment.doctor.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((appointment) => (
                  <tr key={appointment.id} className="border-b">
                    <td className="py-3 px-4">{appointment.doctor}</td>
                    <td className="py-3 px-4">{appointment.date}</td>
                    <td className="py-3 px-4">{appointment.time}</td>
                    <td className="py-3 px-4">{appointment.reason}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        appointment.status === "Confirmed" ? "bg-green-100 text-green-800" :
                        appointment.status === "Cancelled" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {appointment.status !== "Cancelled" && (
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {appointments.length === 0 && (
            <p className="text-center text-lg font-medium text-gray-500 mt-4">
              No appointments scheduled
            </p>
          )}
        </div>
      </div>

      {showBookingModal && (
        <BookAppointment
          onClose={() => setShowBookingModal(false)}
          onSubmit={handlePaymentSuccess}
          formData={formData}
          handleChange={handleChange}
          error={error}
          success={success}
          doctors={doctors}
          availableDates={availableDates}
          availableTimes={availableTimes}
        />
      )}
    </div>
  );
}

export default PatientAppointments;
