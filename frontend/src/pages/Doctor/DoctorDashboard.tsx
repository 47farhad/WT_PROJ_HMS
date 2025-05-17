import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";

function DoctorDashboard() {
  const navigate = useNavigate();
  const { authUser } = useAuthStore(); 

  // Generate random patient profile pictures
  const getRandomPatientAvatar = (seed) =>
    `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  // Hardcoded data
  const todaysAppointmentsCount = 5;
  const totalPatientsCount = 42;
  const prescriptionsCount = 28;
  const monthlyEarnings = 3250;

  // Hardcoded appointments data
  const todaysAppointments = [
    {
      _id: "1",
      patient: {
        firstName: "John",
        lastName: "Doe",
        gender: "Male",
        age: 35,
        phone: "555-123-4567"
      },
      date: new Date().setHours(10, 0, 0, 0),
      status: "confirmed",
      reason: "Annual checkup"
    },
    {
      _id: "2",
      patient: {
        firstName: "Jane",
        lastName: "Smith",
        gender: "Female",
        age: 28,
        phone: "555-987-6543"
      },
      date: new Date().setHours(11, 30, 0, 0),
      status: "confirmed",
      reason: "Follow-up"
    },
    {
      _id: "3",
      patient: {
        firstName: "Robert",
        lastName: "Johnson",
        gender: "Male",
        age: 52,
        phone: "555-456-7890"
      },
      date: new Date().setHours(14, 0, 0, 0),
      status: "pending",
      reason: "Blood pressure"
    }
  ];

  const recentPatients = [
    {
      _id: "1",
      patient: {
        firstName: "Emily",
        lastName: "Williams",
        phone: "555-111-2222"
      },
      date: new Date().setDate(new Date().getDate() - 2),
      reason: "Allergy consultation"
    },
    {
      _id: "2",
      patient: {
        firstName: "Michael",
        lastName: "Brown",
        phone: "555-333-4444"
      },
      date: new Date().setDate(new Date().getDate() - 5),
      reason: "Diabetes management"
    },
    {
      _id: "3",
      patient: {
        firstName: "Sarah",
        lastName: "Davis",
        phone: "555-555-6666"
      },
      date: new Date().setDate(new Date().getDate() - 7),
      reason: "Physical therapy"
    }
  ];

  const upcomingAppointments = [
    {
      _id: "4",
      patient: {
        firstName: "David",
        lastName: "Wilson",
        phone: "555-777-8888"
      },
      date: new Date().setDate(new Date().getDate() + 1),
      status: "confirmed",
      reason: "Post-surgery check"
    },
    {
      _id: "5",
      patient: {
        firstName: "Lisa",
        lastName: "Moore",
        phone: "555-999-0000"
      },
      date: new Date().setDate(new Date().getDate() + 2),
      status: "confirmed",
      reason: "Vaccination"
    },
    {
      _id: "6",
      patient: {
        firstName: "James",
        lastName: "Taylor",
        phone: "555-222-3333"
      },
      date: new Date().setDate(new Date().getDate() + 3),
      status: "pending",
      reason: "General consultation"
    }
  ];

  return (
    <div className="overflow-y-auto p-5 h-full w-full bg-white">
      {/* Welcome Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-800">
          Hi, {authUser?.firstName}!
        </h1>
        <p className="text-gray-600">Welcome to your MedX doctor dashboard</p>
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
              <p className="text-3xl font-bold text-gray-900">{todaysAppointmentsCount}</p>
            </div>
          </div>
          <Link to="/Appointments" className="text-sm text-blue-600 hover:underline mt-3 block">View schedule →</Link>
        </div>

        {/* Patients Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Total Patients</h3>
              <p className="text-3xl font-bold text-gray-900">{totalPatientsCount}</p>
            </div>
          </div>
          <Link to="/Patients" className="text-sm text-green-600 hover:underline mt-3 block">View patients →</Link>
        </div>

        {/* Prescriptions Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Prescriptions</h3>
              <p className="text-3xl font-bold text-gray-900">{prescriptionsCount}</p>
            </div>
          </div>
          <Link to="/Prescriptions" className="text-sm text-purple-600 hover:underline mt-3 block">Manage prescriptions →</Link>
        </div>

        {/* Earnings Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-100 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">Earnings</h3>
              <p className="text-3xl font-bold text-gray-900">${monthlyEarnings}</p>
            </div>
          </div>
          <Link to="/Earnings" className="text-sm text-amber-600 hover:underline mt-3 block">View details →</Link>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Today's Appointments</h2>
            <Link to="/DoctorAppointments" className="text-blue-600 hover:underline font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todaysAppointments.map(appointment => (
                  <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src={getRandomPatientAvatar(
                              `${appointment.patient.firstName} ${appointment.patient.lastName}`
                            )} 
                            alt={appointment.patient.firstName} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient.firstName} {appointment.patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patient.gender}, {appointment.patient.age}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Patients</h2>
            <Link to="/Patients" className="text-blue-600 hover:underline font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPatients.map(patient => (
                  <tr key={patient._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src={getRandomPatientAvatar(
                              `${patient.patient.firstName} ${patient.patient.lastName}`
                            )} 
                            alt={patient.patient.firstName} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.patient.firstName} {patient.patient.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {patient.patient.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(patient.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fade-in border border-gray-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
          <Link to="/DoctorAppointments" className="text-blue-600 hover:underline font-medium">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingAppointments.map(appointment => (
                <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full" 
                          src={getRandomPatientAvatar(
                            `${appointment.patient.firstName} ${appointment.patient.lastName}`
                          )} 
                          alt={appointment.patient.firstName} 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.patient.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(appointment.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {appointment.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => navigate(`/appointment/${appointment._id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;