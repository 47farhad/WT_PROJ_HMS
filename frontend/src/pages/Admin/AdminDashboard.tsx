import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserMd, FaCalendarCheck, FaMoneyBillWave, FaFlask, FaPrescriptionBottleAlt } from 'react-icons/fa';
import { TbUserPlus } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../components/common/Spinner';

// Base API URL
const API_BASE_URL = 'http://localhost:5001/api';

// Define types for our data
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  profilePic?: string;
  isActive: boolean;
}

interface Doctor extends User {
  doctorInfo?: {
    specialization?: string;
    qualifications?: string[];
    experience?: number;
    department?: string;
    isAvailable?: boolean;
    averageRating?: number;
  };
}

interface Patient extends User {
  medicalInfo?: {
    bloodType?: string;
    dateOfBirth?: Date;
    height?: number;
    weight?: number;
    gender?: string;
  };
}

interface Appointment {
  _id: string;
  patientId: any;
  doctorId: any;
  datetime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  _id: string;
  patientId: any;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface DisplayAppointment {
  _id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
}

interface DisplayPayment {
  _id: string;
  patientName: string;
  amount: number;
  date: string;
  status: string;
}

interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  totalPayments: number;
  totalTests: number;
  totalPrescriptions: number;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalPayments: 0,
    totalTests: 0,
    totalPrescriptions: 0
  });
  const [recentAppointments, setRecentAppointments] = useState<DisplayAppointment[]>([]);
  const [recentPayments, setRecentPayments] = useState<DisplayPayment[]>([]);
  
  // Fetch all data for dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Counting doctors, patients, appointments, and payments
        let doctors: Doctor[] = [];
        let patients: Patient[] = [];
        let appointments: Appointment[] = [];
        let payments: Payment[] = [];
        
        try {
          // Fetch doctors using the correct endpoint
          console.log('Fetching doctors...');
          const doctorsResponse = await axios.get(`${API_BASE_URL}/admin/doctors`, {
            withCredentials: true
          });
          doctors = doctorsResponse.data?.data || [];
          console.log(`Found ${doctors.length} doctors`);
        } catch (err) {
          console.error('Error fetching doctors:', err);
        }
        
        try {
          // Fetch patients using the correct endpoint
          console.log('Fetching patients...');
          const patientsResponse = await axios.get(`${API_BASE_URL}/admin/getPatients`, {
            withCredentials: true
          });
          patients = patientsResponse.data?.data || [];
          console.log(`Found ${patients.length} patients`);
        } catch (err) {
          console.error('Error fetching patients:', err);
        }
        
        try {
          // Fetch appointments using the correct endpoint
          console.log('Fetching appointments...');
          const appointmentsResponse = await axios.get(`${API_BASE_URL}/admin/appointments`, {
            withCredentials: true
          });
          appointments = appointmentsResponse.data?.data || [];
          console.log(`Found ${appointments.length} appointments`);
          
          // Count completed appointments (used for prescriptions count)
          const completedAppointments = appointments.filter(
            (appointment: Appointment) => appointment.status === 'confirmed'
          ).length;
        } catch (err) {
          console.error('Error fetching appointments:', err);
        }
        
        try {
          // Fetch payments using the correct endpoint
          console.log('Fetching payments...');
          const paymentsResponse = await axios.get(`${API_BASE_URL}/admin/payments`, {
            withCredentials: true
          });
          payments = paymentsResponse.data?.data || [];
          console.log(`Found ${payments.length} payments`);
          
          // Count lab tests as payments with a lab test filter
          const labTests = payments.filter(
            (payment: Payment) => payment.description?.toLowerCase().includes('lab') || 
                               payment.description?.toLowerCase().includes('test')
          ).length;
          
          // Set the calculated stats
          setStats({
            totalUsers: doctors.length + patients.length,
            totalDoctors: doctors.length,
            totalPatients: patients.length,
            totalAppointments: appointments.length,
            totalPayments: payments.length,
            totalTests: labTests, // Lab tests are payments with lab/test in description
            totalPrescriptions: appointments.filter(a => a.status === 'confirmed').length // Prescriptions are completed appointments
          });
        } catch (err) {
          console.error('Error fetching payments:', err);
        }
        
        // Process recent appointments (up to 5)
        const formattedAppointments = appointments
          .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
          .slice(0, 5)
          .map((appointment: Appointment) => {
            // Extract patient name
            let patientName = 'Unknown Patient';
            if (appointment.patientId) {
              if (typeof appointment.patientId === 'object') {
                patientName = `${appointment.patientId.firstName || ''} ${appointment.patientId.lastName || ''}`.trim();
              } else {
                // If patientId is not an object but an ID, try to find the patient in the patients list
                const patient = patients.find((p: any) => p._id === appointment.patientId);
                if (patient) {
                  patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
                }
              }
            }
            
            // Extract doctor name
            let doctorName = 'Unknown Doctor';
            if (appointment.doctorId) {
              if (typeof appointment.doctorId === 'object') {
                doctorName = `Dr. ${appointment.doctorId.firstName || ''} ${appointment.doctorId.lastName || ''}`.trim();
              } else {
                // If doctorId is not an object but an ID, try to find the doctor in the doctors list
                const doctor = doctors.find((d: any) => d._id === appointment.doctorId);
                if (doctor) {
                  doctorName = `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
                }
              }
            }
            
            // Format date and time
            const dateObj = new Date(appointment.datetime);
            let formattedDate = 'Invalid Date';
            let formattedTime = '';
            
            // Check if the date is valid before formatting
            if (!isNaN(dateObj.getTime())) {
              try {
                formattedDate = dateObj.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric'
                });
                
                formattedTime = dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
              } catch (e) {
                console.error('Error formatting date:', e);
              }
            }
            
            return {
              _id: appointment._id,
              patientName,
              doctorName,
              date: formattedDate,
              time: formattedTime,
              status: appointment.status
            };
          });
        
        setRecentAppointments(formattedAppointments);
        
        // Process recent payments (up to 5)
        const formattedPayments = payments
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map((payment: Payment) => {
            // Extract patient name
            let patientName = 'Unknown Patient';
            if (payment.patientId) {
              if (typeof payment.patientId === 'object') {
                patientName = `${payment.patientId.firstName || ''} ${payment.patientId.lastName || ''}`.trim();
              } else {
                // If patientId is not an object but an ID, try to find the patient in the patients list
                const patient = patients.find((p: any) => p._id === payment.patientId);
                if (patient) {
                  patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
                }
              }
            }
            
            // Format date
            let formattedDate = 'Invalid Date';
            try {
              const paymentDate = payment.date ? new Date(payment.date) : new Date(payment.createdAt);
              
              // Check if the date is valid before formatting
              if (!isNaN(paymentDate.getTime())) {
                formattedDate = paymentDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric'
                });
              }
            } catch (e) {
              console.error('Error formatting payment date:', e);
            }
            
            // Format amount properly
            const amount = typeof payment.amount === 'number' ? payment.amount : 0;
            
            return {
              _id: payment._id,
              patientName,
              amount: amount,
              date: formattedDate,
              status: payment.status || 'pending'
            };
          });
        
        setRecentPayments(formattedPayments);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Navigate to detail pages - use exact URLs
  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path);
    
    // Use the exact URL for navigation
    navigate('/' + path);
  };
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    try {
      return `Rs ${amount}`;
    } catch (e) {
      return `Rs 0`;
    }
  };

  // Get status color class
  const getStatusColorClass = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#243954]">{getGreeting()}, Admin!</h1>
            <p className="text-gray-600 mt-1">Welcome to your MedX admin dashboard</p>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {/* Users Stat */}
        <div 
          onClick={() => handleNavigation('Patients')} 
          className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <h3 className="text-2xl font-bold text-[#243954]">{stats.totalUsers}</h3>
            </div>
          </div>
        </div>

        {/* Doctors Stat */}
        <div 
          onClick={() => handleNavigation('Doctors')} 
          className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <FaUserMd className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Doctors</p>
              <h3 className="text-2xl font-bold text-[#243954]">{stats.totalDoctors}</h3>
            </div>
          </div>
        </div>

        {/* Patients Stat */}
        <div 
          onClick={() => handleNavigation('Patients')} 
          className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <TbUserPlus className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Patients</p>
              <h3 className="text-2xl font-bold text-[#243954]">{stats.totalPatients}</h3>
            </div>
          </div>
        </div>

        {/* Appointments Stat */}
        <div 
          onClick={() => handleNavigation('Appointments')} 
          className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <FaCalendarCheck className="text-yellow-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Appointments</p>
              <h3 className="text-2xl font-bold text-[#243954]">{stats.totalAppointments}</h3>
            </div>
          </div>
        </div>

        {/* Payments Stat */}
        <div 
          onClick={() => handleNavigation('Payments')} 
          className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="rounded-full bg-red-100 p-3 mr-4">
              <FaMoneyBillWave className="text-red-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Payments</p>
              <h3 className="text-2xl font-bold text-[#243954]">{stats.totalPayments}</h3>
            </div>
          </div>
        </div>

        {/* Lab Tests Stat */}
        <div 
          onClick={() => handleNavigation('LabTests')} 
          className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="rounded-full bg-teal-100 p-3 mr-4">
              <FaFlask className="text-teal-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Lab Tests</p>
              <h3 className="text-2xl font-bold text-[#243954]">{stats.totalTests}</h3>
            </div>
          </div>
        </div>

        {/* Prescriptions Stat */}
        <div 
          onClick={() => handleNavigation('Pharmacy')} 
          className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="rounded-full bg-indigo-100 p-3 mr-4">
              <FaPrescriptionBottleAlt className="text-indigo-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Prescriptions</p>
              <h3 className="text-2xl font-bold text-[#243954]">{stats.totalPrescriptions}</h3>
            </div>
          </div>
        </div>
        
        {/* Schedule */}
        <div 
          onClick={() => handleNavigation('Schedule')} 
          className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center">
            <div className="rounded-full bg-orange-100 p-3 mr-4">
              <FaCalendarCheck className="text-orange-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Schedule Management</p>
              <h3 className="text-lg font-bold text-[#243954]">View Calendar</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#243954]">Recent Appointments</h2>
            <button 
              onClick={() => handleNavigation('Appointments')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </button>
          </div>
          
          {recentAppointments.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No recent appointments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentAppointments.map((appointment) => (
                    <tr 
                      key={appointment._id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleNavigation(`Appointments/${appointment._id}`)}
                    >
                      <td className="px-4 py-3 text-sm">{appointment.patientName}</td>
                      <td className="px-4 py-3 text-sm">{appointment.doctorName}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {appointment.date} {appointment.time && `at ${appointment.time}`}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColorClass(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#243954]">Recent Payments</h2>
            <button 
              onClick={() => handleNavigation('Payments')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </button>
          </div>
          
          {recentPayments.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No recent payments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentPayments.map((payment) => (
                    <tr 
                      key={payment._id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleNavigation(`Payments/${payment._id}`)}
                    >
                      <td className="px-4 py-3 text-sm">{payment.patientName}</td>
                      <td className="px-4 py-3 text-sm">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{payment.date}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColorClass(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;