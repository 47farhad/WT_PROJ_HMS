import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BookAppointment from "../Patient/BookAppointment";
import { useAppointmentStore } from "../../store/useAppointmentStore";

function PatientDashboard() {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const { getDoctors, doctors = [] } = useAppointmentStore();
  const { createAppointment } = useAppointmentStore();
  const navigate = useNavigate();

  // Fetch doctors from the backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        await getDoctors();
        setLoading(false);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [getDoctors]);

  const handleBookAppointment = async (appointmentData) => {
    console.log("Appointment Data:", appointmentData);

    try {
      await createAppointment(appointmentData);

      alert("Appointment booked successfully!");
      setShowBookingForm(false); // Close the form after booking
    } catch (error) {
      // Handle error response
      console.error("Error creating appointment:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };
  const handleCancel = () => {
    setShowBookingForm(false);
  };

  const handleBookAppointmentClick = (doctorId) => {
    navigate(`/BookAppointment/${doctorId}`); // Navigate with doctorId in URL
  };

  return (
    <div className="overflow-y-auto p-5 pt-0 h-full w-full bg-white">
      {/* Dashboard Cards */}
      <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Appointments */}
        <Link
          to="/Appointments"
          className="bg-white border-1 border-gray-300 shadow-md rounded-lg p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
              <i className="fas fa-calendar-alt text-2xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Appointments</h3>
              <p className="text-sm text-gray-500">View and manage your appointments</p>
            </div>
          </div>
        </Link>

        {/* Payments */}
        <Link
          to="/Payments"
          className="bg-white border-1 border-gray-300 shadow-md rounded-lg p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 text-green-600 p-4 rounded-full">
              <i className="fas fa-wallet text-2xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Payments</h3>
              <p className="text-sm text-gray-500">Track your payment history</p>
            </div>
          </div>
        </Link>

        {/* Pharmacy */}
        <Link
          to="/Pharmacy"
          className="bg-white border-1 border-gray-300 shadow-md rounded-lg p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 text-purple-600 p-4 rounded-full">
              <i className="fas fa-pills text-2xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Pharmacy</h3>
              <p className="text-sm text-gray-500">Order and manage medicines</p>
            </div>
          </div>
        </Link>

        {/* Lab Tests */}
        <Link
          to="/LabTests"
          className="bg-white border-1 border-gray-300 shadow-md rounded-lg p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-100 text-yellow-600 p-4 rounded-full">
              <i className="fas fa-user text-2xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Lab Tests</h3>
              <p className="text-sm text-gray-500">Book and view Lab Tests</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Available Doctors */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-[#243954] mb-4">Available Doctors</h2>
        {loading ? (
          <p className="text-gray-500">Loading doctors...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white border-1 border-gray-300 shadow-md rounded-lg p-6 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold text-gray-800">{doctor.firstName +
                  " " +
                  doctor.lastName}</h3>
                <button
                  onClick={() => handleBookAppointmentClick(doctor._id)}
                  className="mt-4  bg-[#243954] text-white px-4 py-2 rounded-lg hover:bg-[#4c6280]"
                >
                  Book Appointment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book Appointment Form */}
      {showBookingForm && selectedDoctor && (

        <BookAppointment
          doctorName={selectedDoctor.firstName + " " + selectedDoctor.lastName}
          onBookAppointment={handleBookAppointment}
          onCancel={handleCancel}
        />

      )}

      {/* Recent Activity */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-[#243954] mb-4">Recent Activity</h2>
        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-gray-500">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;