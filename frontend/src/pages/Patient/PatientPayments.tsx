import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTransactionStore } from '../../store/useTransactionStore';

const PatientPayments: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const { transactions, getAllTransactions } = useTransactionStore();

  useEffect(() => {
    getAllTransactions();
  }, [getAllTransactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, filterValue, startDate, endDate, statusFilter]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'startDate') setStartDate(value);
    else if (name === 'endDate') setEndDate(value);
  };

  const handleTypeFilter = (type: string) => {
    setFilterType('type');
    setFilterValue(type);
    setShowTypeFilter(false);
  };

  const clearTypeFilter = () => {
    setFilterType('');
    setFilterValue('');
  };

  const filteredTransactions = Array.isArray(transactions?.data)
    ? transactions.data.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (filterType === 'type' && filterValue) {
        return t.type === filterValue;
      }
      if (filterType === 'date') {
        const transactionDate = new Date(t.updatedAt);
        const from = startDate ? new Date(startDate) : null;
        const to = endDate ? new Date(endDate) : null;
        if (from && to) return transactionDate >= from && transactionDate <= to;
        if (from) return transactionDate >= from;
        if (to) return transactionDate <= to;
      }
      return true;
    })
    : [];

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="h-full max-h-[calc(100vh-88px)] w-full p-5 pt-0 flex flex-col justify-between">
      {/* Top Controls */}
      <div className="flex justify-between items-center flex-wrap gap-3 p-2 mb-4">
        {/* Status */}
        <div className="flex flex-wrap gap-2 items-center">
          {["all", "paid", "unpaid", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2 py-1 rounded-md text-sm font-medium transition ${statusFilter === status
                ? "bg-[#243954] text-white"
                : "bg-gray-200 text-[#243954] hover:bg-[#243954] hover:text-white"
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Right Side Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Filter by Type */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTypeFilter(!showTypeFilter);
                setShowDateFilter(false);
              }}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 rounded-md text-[#243954]"
            >
              <svg
                className="h-4 w-4 text-[#243954]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              {filterType === 'type' ? filterValue : 'Filter by Type'}
              {showTypeFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showTypeFilter && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-md p-3 z-10 min-w-[180px]">
                <div className="flex flex-col gap-2 text-[#243954] text-sm">
                  <button
                    onClick={() => clearTypeFilter()}
                    className={`px-2 py-1 text-left rounded ${!filterType ? 'bg-blue-100 font-medium' : 'hover:bg-gray-100'}`}
                  >
                    All Types
                  </button>
                  {['Appointment', 'Medication', 'LabTest'].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleTypeFilter(type)}
                      className={`px-2 py-1 text-left rounded ${filterValue === type ? 'bg-blue-100 font-medium' : 'hover:bg-gray-100'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filter by Date */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDateFilter(!showDateFilter);
                setShowTypeFilter(false);
                setFilterType('date');
              }}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 rounded-md text-[#243954]"
            >
              <svg
                className="h-4 w-4 text-[#243954]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10m-11 4h.01M6 21h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Filter by Date
              {showDateFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showDateFilter && (
              <div className="absolute right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-md p-3 z-10">
                <div className="flex flex-col gap-2 text-[#243954] text-sm">
                  <label className="flex flex-col">
                    Start Date
                    <input
                      type="date"
                      name="startDate"
                      value={startDate}
                      onChange={handleDateChange}
                      className="border px-2 py-1 rounded-md text-sm"
                    />
                  </label>
                  <label className="flex flex-col">
                    End Date
                    <input
                      type="date"
                      name="endDate"
                      value={endDate}
                      onChange={handleDateChange}
                      className="border px-2 py-1 rounded-md text-sm"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto rounded-xl shadow-lg border border-gray-200">
        <div className="overflow-y-scroll h-full">
          <table className="min-w-full table-auto">
            <thead className="sticky top-0 bg-[#243954] text-white">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-center">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-blue-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(transaction.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span
                        className={`cursor-pointer px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'Appointment'
                          ? 'bg-blue-100 text-blue-800'
                          : transaction.type === 'Order'
                            ? 'bg-green-100 text-green-800'
                            : transaction.type === 'LabTest'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        onClick={() => {
                          if (transaction.type === 'Appointment') {
                            navigate(`/AppointmentDetails/${transaction.referenceId}`);
                          } else if (transaction.type === 'Order') {
                            navigate(`/Orders/${transaction.referenceId}`);
                          } else if (transaction.type === 'LabTest') {
                            navigate(`/Labtests/${transaction.referenceId}`);
                          }
                        }}
                      >
                        {transaction.type == "Order" ? 'Medication' : transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        onClick={
                          transaction.status === 'unpaid'
                            ? () => navigate(`/UpdateTransaction/${transaction._id}`)
                            : undefined
                        }
                        className={`cursor-pointer px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                          } ${transaction.status === 'unpaid' ? 'hover:underline' : ''}`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredTransactions.length > itemsPerPage && (
        <div className="m-2 flex justify-end text-sm">
          <div className="space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1 bg-[#243954] rounded text-white"
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            <span className="text-[#243954] font-medium">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1 bg-[#243954] rounded text-white"
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-[#243954] mb-4">Transaction Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Spent</p>
            <p className="text-2xl font-bold text-blue-800">
              $
              {Array.isArray(transactions.data)
                ? transactions.data
                  .filter((t) => t.status === 'paid')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(2)
                : '0.00'}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Completed Payments</p>
            <p className="text-2xl font-bold text-green-800">
              {Array.isArray(transactions.data)
                ? transactions.data.filter((t) => t.status === 'paid').length
                : 0}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600">Pending Payments</p>
            <p className="text-2xl font-bold text-yellow-800">
              {Array.isArray(transactions.data)
                ? transactions.data.filter((t) => t.status === 'unpaid').length
                : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPayments;