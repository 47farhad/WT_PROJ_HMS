import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppointmentStore } from "../../store/useAppointmentStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useAdminStore } from "../../store/useAdminStore";

function DoctorDashboard() {
  const { patients, getPatients, isPatientsLoading } = useAdminStore();
  const patientsEndRef = useRef(null);
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const {
    getAllAppointments,
    isAppointmentsLoading,
    appointments: { data: appointments, pagination },
    getAppointmentStats,
    appointmentStats
  } = useAppointmentStore();

  const appointmentEndRef = useRef(null);
  const appointmentContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Generate random patient profile pictures
  const getRandomPatientAvatar = (seed) =>
    `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const todayDateObj = new Date();
  todayDateObj.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (authUser?._id) {
      getAppointmentStats(authUser._id);
    }
  }, [authUser?._id, getAppointmentStats]);

  const confirmedAppointments = appointments.map(appointment => ({
    ...appointment,
    _id: appointment._id,
    datetime: appointment.datetime,
    description: appointment.description,
    status: appointment.status,
    patient: {
      _id: appointment.patientId,
      firstName: appointment.patientFirstName,
      lastName: appointment.patientLastName,
      profilePic: appointment.patientProfilePic,
    },
    doctorId: {
      _id: authUser._id
    }
  }));

  // Today's appointments
  const todaysAppointments = confirmedAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.datetime).toISOString().split('T')[0];
    return appointmentDate === today;
  });

  // Upcoming appointments (excluding today's)
  const upcomingAppointments = confirmedAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.datetime);
    return appointmentDate > todayDateObj;
  }).slice(0, 5);

  // Calculate stats from the store
  const totalConfirmedAppointmentsCount = appointmentStats.total || 0;
  const totalPatientsCount = patients.data?.length || 0;
  const monthlyEarnings = totalConfirmedAppointmentsCount * 50 * 0.02;

  useEffect(() => {
    getAllAppointments();
  }, [getAllAppointments]);

  useEffect(() => {
    if (
      isAtBottom &&
      !pagination.isPageLoading &&
      pagination.hasMore &&
      !isAppointmentsLoading
    ) {
      getAllAppointments(pagination.currentPage + 1);
    }
  }, [isAtBottom, pagination, getAllAppointments, isAppointmentsLoading]);

  useEffect(() => {
    const container = appointmentContainerRef.current;

    const handleScroll = () => {
      if (!container || !appointmentEndRef.current) return;
      const endRefPosition = appointmentEndRef.current.getBoundingClientRect().bottom;
      const containerPosition = container.getBoundingClientRect().bottom;
      const threshold = 5;
      const reachedBottom = Math.abs(endRefPosition - containerPosition) <= threshold;
      setIsAtBottom(reachedBottom);
    };

    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAppointmentClick = (appointmentId) => {
    navigate(`/DoctorAppointmentDetails/${appointmentId}`);
  };

  useEffect(() => {
    getPatients();
  }, [getPatients]);

  useEffect(() => {
    const current = patientsEndRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && !patients.pagination.isPageLoading && patients.pagination.hasMore && (patients.data.length != 0)) {
          getPatients(patients.pagination.currentPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (patientsEndRef.current) {
      observer.observe(patientsEndRef.current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [getPatients, patients.pagination, patients.data.length]);

  const handlePatientClick = (patientId) => {
    navigate(`/Patients/${patientId}`);
  };

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
              <p className="text-3xl font-bold text-gray-900">{totalConfirmedAppointmentsCount}</p>
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
              <p className="text-3xl font-bold text-gray-900">{patients.data?.length || 0}</p>
            </div>
          </div>
          <Link to="/Patients" className="text-sm text-green-600 hover:underline mt-3 block">View patients →</Link>
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
            {todaysAppointments.length > 0 ? (
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
                    <tr
                      key={appointment._id}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleAppointmentClick(appointment._id)}
                    >
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
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(appointment.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                          }`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-2">No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up border border-gray-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Patients</h2>
            <Link to="/Patients" className="text-blue-600 hover:underline font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            {patients.data?.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.data.slice(0, 5).map(patient => (
                    <tr
                      key={patient._id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handlePatientClick(patient._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={getRandomPatientAvatar(
                                `${patient.firstName} ${patient.lastName}`
                              )}
                              alt={patient.firstName}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.latestPastAppointment?.datetime
                          ? new Date(patient.latestPastAppointment.datetime).toLocaleDateString()
                          : patient.upcomingAppointment?.datetime
                            ? new Date(patient.upcomingAppointment.datetime).toLocaleDateString()
                            : 'No appointments'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.contact || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="mt-2">No patients found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fade-in border border-gray-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
          <Link to="/Appointments" className="text-blue-600 hover:underline font-medium">View All</Link>
        </div>
        <div className="overflow-x-auto">
          {upcomingAppointments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                            {appointment.patient.contact}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(appointment.datetime).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(appointment.datetime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                        }`}>
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2">No upcoming appointments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;