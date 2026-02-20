import React, { useEffect, useMemo } from 'react';
import { FaUserMd, FaCalendarCheck, FaMoneyBillWave, FaFlask } from 'react-icons/fa';
import { TbUserPlus } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import { useAdminStore } from '../../store/useAdminStore';

function AdminDashboard() {
  const navigate = useNavigate();

  // 1. Get everything from the Store
  const { 
    loadDashboardData,
    patients,
    doctors,
    appointments,
    transactions,
    isPatientsLoading,
    isAppointmentsLoading,
    isTransactionsLoading
  } = useAdminStore();

  // 2. Load Data on Mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Global loading state
  const isLoading = isPatientsLoading || isAppointmentsLoading || isTransactionsLoading;

  // 3. Calculate Stats & Recent Items (Memoized for performance)
  const dashboardData = useMemo(() => {
    // Totals
    const totalDoctors = doctors.total || doctors.data.length || 0;
    const totalPatients = patients.pagination?.total || 0;
    const totalAppointments = appointments.pagination?.total || 0;
    const totalTransactions = transactions.total || 0;

    // Calculate specific counts from loaded data
    const totalTests = transactions.data.filter((t: any) => 
      t.type === 'LabTest' || t.description?.toLowerCase().includes('lab')
    ).length;

    // Sort and Slice for "Recent" tables
    // Assuming createdAt or date strings are available
    const recentAppointments = [...appointments.data]
      .sort((a: any, b: any) => new Date(b.datetime || b.date).getTime() - new Date(a.datetime || a.date).getTime())
      .slice(0, 5);

    const recentTransactions = [...transactions.data]
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      stats: {
        totalUsers: totalDoctors + totalPatients,
        totalDoctors,
        totalPatients,
        totalAppointments,
        totalTransactions,
        totalTests
      },
      recentAppointments,
      recentTransactions
    };
  }, [doctors, patients, appointments, transactions]);

  // 4. Helpers
  const getGreeting = () => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusColorClass = (status: string = '') => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 5. Initial Loading Screen (only if no data exists yet)
  if (isLoading && dashboardData.stats.totalUsers === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-full max-h-[calc(100vh-88px)] overflow-y-scroll">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#243954]">{getGreeting()}, Admin!</h1>
            <p className="text-gray-600 mt-1">Welcome to your MedX admin dashboard</p>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-gray-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
        <StatCard 
          icon={<FaUserMd className="text-green-600 text-xl" />} 
          color="bg-green-100" 
          title="Total Doctors" 
          value={dashboardData.stats.totalDoctors} 
          onClick={() => navigate('/Doctors')} 
        />
        <StatCard 
          icon={<TbUserPlus className="text-purple-600 text-xl" />} 
          color="bg-purple-100" 
          title="Total Patients" 
          value={dashboardData.stats.totalPatients} 
          onClick={() => navigate('/Patients')} 
        />
        <StatCard 
          icon={<FaCalendarCheck className="text-yellow-600 text-xl" />} 
          color="bg-yellow-100" 
          title="Appointments" 
          value={dashboardData.stats.totalAppointments} 
          onClick={() => navigate('/Appointments')} 
        />
        <StatCard 
          icon={<FaMoneyBillWave className="text-red-600 text-xl" />} 
          color="bg-red-100" 
          title="Transactions" 
          value={dashboardData.stats.totalTransactions} 
          onClick={() => navigate('/Transactions')} 
        />
        <StatCard 
          icon={<FaFlask className="text-teal-600 text-xl" />} 
          color="bg-teal-100" 
          title="Lab Tests" 
          value={dashboardData.stats.totalTests} 
          onClick={() => navigate('/LabTests')} 
        />
        
        {/* Schedule Link */}
        <div 
          onClick={() => navigate('/Schedule')} 
          className="bg-white rounded-lg shadow p-5 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#243954]">Recent Appointments</h2>
            <button 
              onClick={() => navigate('/Appointments')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </button>
          </div>
          
          {dashboardData.recentAppointments.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No recent appointments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardData.recentAppointments.map((apt: any) => (
                    <tr 
                      key={apt._id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/Appointments/${apt._id}`)}
                    >
                      <td className="px-4 py-3 text-sm">
                        {/* Safe check for patient name if populated */}
                        {apt.patientId?.firstName ? `${apt.patientId.firstName} ${apt.patientId.lastName}` : (apt.patientName || 'Unknown')}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                         {new Date(apt.datetime || apt.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColorClass(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Transactions (Payments) */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[#243954]">Recent Transactions</h2>
            <button 
              onClick={() => navigate('/Transactions')}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View All
            </button>
          </div>
          
          {dashboardData.recentTransactions.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No recent transactions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardData.recentTransactions.map((tx: any) => (
                    <tr 
                      key={tx._id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/Transactions/${tx._id}`)}
                    >
                      <td className="px-4 py-3 text-sm">
                         {tx.userId ? `${tx.userId.firstName} ${tx.userId.lastName}` : 'Guest'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{formatCurrency(tx.amount)}</span>
                          {/* Type Badge */}
                          <span className="text-[10px] text-gray-500 bg-gray-100 w-fit px-1.5 rounded mt-0.5">
                            {tx.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColorClass(tx.status)}`}>
                          {tx.status}
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

// Reusable Component for Stat Cards to keep JSX clean
const StatCard = ({ icon, color, title, value, onClick }: any) => (
  <div 
    onClick={onClick} 
    className="bg-white rounded-lg shadow p-5 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
  >
    <div className="flex items-center">
      <div className={`rounded-full ${color} p-3 mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-[#243954]">{value}</h3>
      </div>
    </div>
  </div>
);

export default AdminDashboard;