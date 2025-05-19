import React, { useState, useEffect } from 'react';
import { useAdminPaymentStore } from '../../store/useAdminPaymentStore';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const AdminPayments: React.FC = () => {
  // Get state and actions from the store
  const { 
    payments, 
    summary, 
    isPaymentsLoading, 
    getPayments, 
    getSummary, 
    updatePaymentStatus 
  } = useAdminPaymentStore();
  
  // Local state for filters
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Fetch data on component mount
  useEffect(() => {
    console.log('AdminPayments component mounted');
    getPayments();
    getSummary();
  }, []);

  // Filter payments
  const filteredPayments = React.useMemo(() => {
    return payments.data.filter(payment => {
      // Apply type filter
      if (selectedType && payment?.treatment && payment.treatment !== selectedType) {
        return false;
      }
      
      // Apply status filter
      if (selectedStatus && payment?.status && payment.status !== selectedStatus) {
        return false;
      }
      
      // Apply search filter (invoice ID or patient name)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (payment?.invoiceId?.toLowerCase()?.includes(query) || false) ||
          (payment?.patientName?.toLowerCase()?.includes(query) || false)
        );
      }
      
      return true;
    });
  }, [payments.data, selectedType, selectedStatus, searchQuery]);
  
  // Reset filters
  const handleResetFilters = () => {
    setSelectedType('');
    setSelectedStatus('');
    setSearchQuery('');
  };
  
  // Manual refresh function
  const handleRefresh = () => {
    toast.success('Refreshing payments data');
    getPayments();
    getSummary();
  };
  
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5 }
    }
  };
  
  // Render loading state
  if (isPaymentsLoading && (!payments.data || payments.data.length === 0)) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-88px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#243954]"></div>
      </div>
    );
  }
  
  // Check if summary exists before rendering
  const hasSummary = summary && summary.overall;

  return (
    <div className="container mx-auto p-4 max-w-full h-full max-h-[calc(100vh-88px)] overflow-y-scroll">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-2xl font-bold text-[#243954]">Payment Management</h1>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          className="px-4 py-2 bg-[#243954] text-white rounded-md hover:bg-[#1a2c42] transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          Refresh Data
        </motion.button>
      </motion.div>
      
      {/* Summary Cards */}
      {hasSummary && (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <motion.div 
            variants={cardVariant}
            whileHover={{ scale: 1.03, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}
            className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg shadow transition-all duration-300"
          >
            <h2 className="text-sm text-blue-800 font-medium">Total Amount</h2>
            <p className="text-2xl font-bold text-blue-800">${summary.overall.totalAmount.toFixed(2)}</p>
          </motion.div>
          
          <motion.div 
            variants={cardVariant}
            whileHover={{ scale: 1.03, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}
            className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg shadow transition-all duration-300"
          >
            <h2 className="text-sm text-green-800 font-medium">Paid Amount</h2>
            <p className="text-2xl font-bold text-green-800">${summary.overall.approvedAmount.toFixed(2)}</p>
          </motion.div>
          
          <motion.div 
            variants={cardVariant}
            whileHover={{ scale: 1.03, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}
            className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg shadow transition-all duration-300"
          >
            <h2 className="text-sm text-yellow-800 font-medium">Pending Amount</h2>
            <p className="text-2xl font-bold text-yellow-800">${summary.overall.pendingAmount.toFixed(2)}</p>
          </motion.div>
          
          <motion.div 
            variants={cardVariant}
            whileHover={{ scale: 1.03, boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)" }}
            className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg shadow transition-all duration-300"
          >
            <h2 className="text-sm text-purple-800 font-medium">Total Payments</h2>
            <p className="text-2xl font-bold text-purple-800">{summary.overall.totalCount}</p>
          </motion.div>
        </motion.div>
      )}
      
      {/* Filters */}
      <motion.div 
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
        className="bg-white p-4 rounded-lg shadow mb-6"
      >
        <h2 className="text-lg font-semibold mb-4 text-[#243954]">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Treatment Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#243954] transition-all duration-200"
            >
              <option value="">All Types</option>
              <option value="Appointment">Appointment</option>
              <option value="LabTest">Lab Test</option>
              <option value="Order">Medicine</option>
            </select>
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#243954] transition-all duration-200"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          
          {/* Search Input */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by invoice ID or patient name"
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
      
      {/* Stats information */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-4 p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center"
      >
        <div className="flex items-center">
          <div className="text-[#243954] mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">Total payments:</span>&nbsp;
          <span>{payments.data?.length || 0}</span>
        </div>
        <div className="flex items-center">
          <div className="text-[#243954] mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm1 4a1 1 0 100 2h12a1 1 0 100-2H4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">Filtered payments:</span>&nbsp;
          <span>{filteredPayments.length}</span>
        </div>
      </motion.div>
      
      {/* Payments Table */}
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Treatment</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <motion.tr 
                    key={payment._id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                    whileHover={{ backgroundColor: "rgba(243, 244, 246, 0.7)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.invoiceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.patientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.treatment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${payment.status === 'Paid' ? 'bg-green-100 text-green-800' : 
                          payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`
                      }>
                        {payment.status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    No payments found
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

export default AdminPayments;