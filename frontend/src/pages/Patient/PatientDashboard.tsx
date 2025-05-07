import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BookAppointment from "../../components/BookAppointment";
import { useAppointmentStore } from "../../store/useAppointmentStore"; // Import the store
import axios from "axios"; // Import axios for API calls

function PatientDashboard() {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  const { getDoctors, doctors = [] } = useAppointmentStore(); // Ensure doctors defaults to an empty array

  // Fetch doctors from the backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        await getDoctors(); // Call the function to fetch doctors
        setLoading(false); // Set loading to false after fetching
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
      // Replace with your backend API endpoint
      const response = await axios.post("http://localhost:5173/api/appointments", appointmentData);
  
      // Handle success response
      console.log("Appointment created successfully:", response.data);
      alert("Appointment booked successfully!");
  
      setShowBookingForm(false); // Close the form after booking
    } catch (error) {
      // Handle error response
      console.error("Error creating appointment:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };
  const handleCancel = () => {
    setShowBookingForm(false); // Close the form when "Cancel" is clicked
  };

  return (
    <div className="h-full w-full p-6 bg-gray-100">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold text-[#243954] mb-6">Welcome to Your Dashboard</h1>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Appointments */}
          <Link
            to="http://localhost:5173/Appointments"
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
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
            to="http://localhost:5173/Payments"
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
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
            to="http://localhost:5173/Pharmacy"
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
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
            to="http://localhost:5173/LabTests"
            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
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
                  className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold text-gray-800">{doctor.firstName +
                          " " +
                          doctor.lastName}</h3>
                  <button
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setShowBookingForm(true);
                    }}
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
    </div>
  );
}

export default PatientDashboard;