import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BookAppointment from "../Patient/BookAppointment";
import { useAppointmentStore } from "../../store/useAppointmentStore";
import { useAuthStore } from "../../store/useAuthStore";

function PatientDashboard() {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuthStore(); 
  const { getDoctors, doctors = [] } = useAppointmentStore();
  const { createAppointment } = useAppointmentStore();
  const navigate = useNavigate();

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
    try {
      await createAppointment(appointmentData);
      alert("Appointment booked successfully!");
      setShowBookingForm(false);
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  const handleCancel = () => {
    setShowBookingForm(false);
  };

  const handleBookAppointmentClick = (doctorId) => {
    navigate(`/BookAppointment/${doctorId}`);
  };

  // Generate random doctor profile pictures (using DiceBear avatars)
  const getRandomDoctorAvatar = (seed) =>
    `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  return (
    <div className="overflow-y-auto p-5 h-full w-full bg-white">
      {/* Welcome Header */}
      <div className="mb-8 animate-slide-up">

        <h1 className="text-3xl font-bold text-gray-800">
          Hi, {authUser?.firstName}!
        </h1>
        <p className="text-gray-600">Welcome to your MedX patient dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Appointments Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Appointments</h3>
              <p className="text-3xl font-bold text-gray-900">78</p>
            </div>
          </div>
          <Link to="/Appointments" className="text-sm text-blue-600 hover:underline mt-3 block">View and manage →</Link>
        </div>

        {/* Payments Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Payments</h3>
              <p className="text-3xl font-bold text-gray-900">56</p>
            </div>
          </div>
          <Link to="/Payments" className="text-sm text-green-600 hover:underline mt-3 block">Track history →</Link>
        </div>

        {/* Pharmacy Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Pharmacy</h3>
              <p className="text-3xl font-bold text-gray-900">47</p>
            </div>
          </div>
          <Link to="/Pharmacy" className="text-sm text-purple-600 hover:underline mt-3 block">Purachase Medicine →</Link>
        </div>

        {/* Lab Tests Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Lab Tests</h3>
              <p className="text-3xl font-bold text-gray-900">32</p>
            </div>
          </div>
          <Link to="/LabTests" className="text-sm text-amber-600 hover:underline mt-3 block">View and book  →</Link>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Appointments</h2>
            <Link to="/Appointments" className="text-blue-600 hover:underline font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={getRandomDoctorAvatar("Sarah Johnson")} alt="Dr. Sarah Johnson" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Dr. Sarah Johnson</div>
                        <div className="text-sm text-gray-500">Cardiology</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-05-14</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      confirmed
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full" src={getRandomDoctorAvatar("Michael Chen")} alt="Dr. Michael Chen" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Dr. Michael Chen</div>
                        <div className="text-sm text-gray-500">Neurology</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2023-05-12</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      pending
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Payments</h2>
            <Link to="/Payments" className="text-blue-600 hover:underline font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Appointment</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$ 50</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      paid
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Lab Tests</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$ 50</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      unpaid
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Available Doctors */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fade-in border border-gray-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Available Doctors</h2>
          <Link to="/Doctors" className="text-blue-600 hover:underline font-medium">View All</Link>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-300"
              >
                <div className="flex flex-col items-center text-center">
                  <img
                    src={doctor.profilePic || (getRandomDoctorAvatar(doctor.firstName + " " + doctor.lastName))}
                    alt={doctor.firstName + " " + doctor.lastName}
                    className="h-20 w-20 rounded-full object-cover mb-4 border-4 border-blue-100"
                  />
                  <h3 className="text-lg font-semibold text-gray-800">
                    {doctor.firstName + " " + doctor.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{doctor.specialization}</p>
                  <div className="flex items-center text-yellow-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                    <span className="text-gray-500 text-xs ml-1">(120)</span>
                  </div>
                  <button
                    onClick={() => handleBookAppointmentClick(doctor._id)}
                    className="w-full  bg-[#243954] text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg hover:bg-[#414c5c]"
                  >
                    Book Appointment
                  </button>
                </div>
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
    </div>
  );
}

export default PatientDashboard;