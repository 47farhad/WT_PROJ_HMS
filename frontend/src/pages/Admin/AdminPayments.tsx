import React, { useState, useEffect } from 'react';
import { usePaymentStore } from '../../store/usePaymentStore';
import { format } from 'date-fns';

// Components
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

// Types
interface PaymentSummaryCardProps {
  title: string;
  value: number | string;
  bgColor: string;
  textColor: string;
  icon?: React.ReactNode;
}

const AdminPayments: React.FC = () => {
  // State management
  const {
    payments,
    summary,
    loading,
    error,
    filters,
    fetchPayments,
    fetchPaymentSummary,
    updatePaymentStatus
  } = usePaymentStore();

  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [approvalNote, setApprovalNote] = useState<string>('');

  // Categories for filtering
  const paymentCategories = [
    { value: '', label: 'All Categories' },
    { value: 'appointment', label: 'Appointment' },
    { value: 'labtest', label: 'Lab Test' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'salary', label: 'Salary' },
    { value: 'refund', label: 'Refund' },
    { value: 'other', label: 'Other' },
  ];

  // Status options for filtering
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'refunded', label: 'Refunded' },
  ];

  // Fetch payments and summary data on component mount
  useEffect(() => {
    fetchPayments();
    fetchPaymentSummary();
  }, [fetchPayments, fetchPaymentSummary]);

  // Handle filter changes
  const handleFilterChange = () => {
    const newFilters = {
      category: selectedCategory,
      status: selectedStatus,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    };
    
    fetchPayments(newFilters);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedStatus('');
    setSearchQuery('');
    setDateRange({ startDate: '', endDate: '' });
    fetchPayments({});
  };

  // Open the approval modal
  const handleOpenApprovalModal = (paymentId: string, initialStatus: string) => {
    setSelectedPaymentId(paymentId);
    setNewStatus(initialStatus);
    setApprovalNote('');
    setShowApprovalModal(true);
  };

  // Submit the payment status change
  const handleApprovePayment = async () => {
    try {
      await updatePaymentStatus(selectedPaymentId, newStatus as any);
      setShowApprovalModal(false);
      // Refresh data
      fetchPaymentSummary();
    } catch (err) {
      console.error('Failed to update payment status:', err);
    }
  };

  // Filter payments by search query (client-side filtering for immediate feedback)
  const filteredPayments = payments.filter(payment => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      payment.transactionId?.toLowerCase().includes(query) ||
      payment.patientName?.toLowerCase().includes(query) ||
      payment.doctorName?.toLowerCase().includes(query)
    );
  });

  // Summary card component
  const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
    title,
    value,
    bgColor,
    textColor,
    icon
  }) => (
    <div className={`${bgColor} p-4 rounded-lg shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${textColor}`}>{title}</p>
          <p className={`text-2xl font-bold ${textColor}`}>
            {typeof value === 'number' && title.includes('Amount') ? `$${value.toFixed(2)}` : value}
          </p>
        </div>
        {icon && <div className={`text-2xl ${textColor}`}>{icon}</div>}
      </div>
    </div>
  );

  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-[#243954] mb-4 md:mb-0">Payment Management</h2>
          
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
            />
            <button
              onClick={handleFilterChange}
              className="bg-[#243954] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <PaymentSummaryCard
              title="Total Amount"
              value={summary.overall.totalAmount}
              bgColor="bg-blue-50"
              textColor="text-blue-800"
            />
            <PaymentSummaryCard
              title="Approved Amount"
              value={summary.overall.approvedAmount}
              bgColor="bg-green-50"
              textColor="text-green-800"
            />
            <PaymentSummaryCard
              title="Pending Amount"
              value={summary.overall.pendingAmount}
              bgColor="bg-yellow-50"
              textColor="text-yellow-800"
            />
            <PaymentSummaryCard
              title="Total Transactions"
              value={summary.overall.totalCount}
              bgColor="bg-purple-50"
              textColor="text-purple-800"
            />
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold text-[#243954] mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
              >
                {paymentCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
              />
            </div>
          </div>
        </div>

        {/* Payment Categories Accordion */}
        <div className="mb-6">
          <CategoryAccordion
            title="Appointment Payments"
            category="appointment"
            payments={filteredPayments}
            onApprove={handleOpenApprovalModal}
          />
          
          <CategoryAccordion
            title="Lab Test Payments"
            category="labtest"
            payments={filteredPayments}
            onApprove={handleOpenApprovalModal}
          />
          
          <CategoryAccordion
            title="Medicine Payments"
            category="medicine"
            payments={filteredPayments}
            onApprove={handleOpenApprovalModal}
          />
          
          <CategoryAccordion
            title="Salary Payments"
            category="salary"
            payments={filteredPayments}
            onApprove={handleOpenApprovalModal}
          />
          
          <CategoryAccordion
            title="Refund Payments"
            category="refund"
            payments={filteredPayments}
            onApprove={handleOpenApprovalModal}
          />
          
          <CategoryAccordion
            title="Other Payments"
            category="other"
            payments={filteredPayments}
            onApprove={handleOpenApprovalModal}
          />
        </div>

        {/* Loading and Error States */}
        {loading && <Spinner />}
        {error && <Alert type="error" message={error} />}

        {/* Approval Modal */}
        {showApprovalModal && (
          <Modal
            isOpen={showApprovalModal}
            onClose={() => setShowApprovalModal(false)}
            title="Update Payment Status"
          >
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
                >
                  {statusOptions.filter(option => option.value !== '').map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprovePayment}
                  className="bg-[#243954] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

// Category Accordion Component
interface CategoryAccordionProps {
  title: string;
  category: string;
  payments: any[];
  onApprove: (id: string, status: string) => void;
}

const CategoryAccordion: React.FC<CategoryAccordionProps> = ({
  title,
  category,
  payments,
  onApprove
}) => {
  const [isOpen, setIsOpen] = useState(true);
  
  // Filter payments by category
  const categoryPayments = payments.filter(payment => payment.category === category);
  
  // Calculate category totals
  const totalAmount = categoryPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Don't render if no payments in this category
  if (categoryPayments.length === 0) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-md mb-4 overflow-hidden">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-[#243954]">{title}</h3>
          <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {categoryPayments.length}
          </span>
        </div>
        <div className="flex items-center">
          <span className="mr-4 font-semibold">${totalAmount.toFixed(2)}</span>
          <svg 
            className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isOpen && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#243954] text-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Transaction ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Patient
                </th>
                {category === 'appointment' && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Doctor
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payment.transactionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.patientName}
                  </td>
                  {category === 'appointment' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.doctorName}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${payment.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        payment.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-blue-100 text-blue-800'}`
                    }>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onApprove(payment._id, payment.status)}
                      className="text-[#243954] hover:text-blue-700 mr-3"
                    >
                      Change Status
                    </button>
                    <a 
                      href={`/admin/payments/${payment._id}`} 
                      className="text-gray-600 hover:text-gray-900"
                    >
                      View Details
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;