import React, { useState, useEffect } from 'react';
import { useAdminAppointmentStore } from '../../store/useAdminAppointmentStore';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const AdminAppointments: React.FC = () => {
  // Get state and actions from the store
  const {
    appointments,
    isAppointmentsLoading,
    getAppointments,
    updateAppointment
  } = useAdminAppointmentStore();

  // Local state for filters
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Fetch data on component mount
  useEffect(() => {
    console.log('AdminAppointments component mounted');
    getAppointments();
  }, []);

  // Log the appointments data whenever it changes
  useEffect(() => {
    console.log('Appointments data:', appointments);
    if (appointments.data.length === 0) {
      console.log('No appointments data available');
    } else {
      console.log('First appointment:', appointments.data[0]);
    }
  }, [appointments]);

  // Filter appointments
  const filteredAppointments = React.useMemo(() => {
    if (!appointments.data || appointments.data.length === 0) {
      return [];
    }

    return appointments.data.filter(appointment => {
      // Apply status filter
      if (selectedStatus && appointment.status !== selectedStatus) {
        return false;
      }

      // Apply date range filter
      if (startDate || endDate) {
        const appointmentDate = appointment.date;

        if (startDate && appointmentDate < startDate) {
          return false;
        }

        if (endDate && appointmentDate > endDate) {
          return false;
        }
      }

      // Apply search filter (patient name or doctor name)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          appointment.patientName?.toLowerCase().includes(query) ||
          appointment.doctorName?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [appointments.data, selectedStatus, startDate, endDate, searchQuery]);

  // Reset filters
  const handleResetFilters = () => {
    setSelectedStatus('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  // Manual refresh function
  const handleRefresh = () => {
    toast.success('Refreshing appointments data');
    getAppointments();
  };

  // Handle appointment status update
  const handleStatusUpdate = (id: string, newStatus: string) => {
    console.log(`Updating appointment ${id} to status ${newStatus}`);
    updateAppointment(id, newStatus);
  };

  // Render loading state
  if (isAppointmentsLoading && (!appointments.data || appointments.data.length === 0)) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-88px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#243954]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-full h-full max-h-[calc(100vh-88px)] overflow-y-scroll">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white p-4 rounded-lg shadow mb-6"
      >
        <h2 className="text-lg font-semibold mb-4 text-[#243954]">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#243954] transition-all duration-200"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#243954] transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#243954] transition-all duration-200"
            />
          </div>

          {/* Search Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search patient or doctor name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#243954] transition-all duration-200"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleResetFilters}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200 whitespace-nowrap"
              >
                Reset
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats and information */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-4 p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200"
      >
        <div className="flex flex-wrap gap-4 justify-between">
          <div className="flex items-center">
            <div className="text-[#243954] mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 6a1 1 0 100 2 1 1 0 000-2zm0 3a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">Total appointments:</span>&nbsp;
            <span>{appointments.data?.length || 0}</span>
          </div>
          <div className="flex items-center">
            <div className="text-[#243954] mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 4a1 1 0 100 2h12a1 1 0 100-2H4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">Filtered appointments:</span>&nbsp;
            <span>{filteredAppointments.length}</span>
          </div>
        </div>
      </motion.div>

      {/* Appointments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-lg shadow overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#243954] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <motion.tr
                    key={appointment._id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                    whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.7)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.patientName || 'Unknown Patient'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.doctorName || 'Unknown Doctor'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.date || 'No date'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.time || 'No time'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.reason || 'No reason'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              appointment.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'}`
                      }>
                        {appointment.status ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    {isAppointmentsLoading ? 'Loading appointments...' : 'No appointments found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAppointments;