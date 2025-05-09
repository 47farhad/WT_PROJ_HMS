import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactionStore } from '../../store/useTransactionStore';

const PatientPayments: React.FC = () => {
  const [searchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const navigate = useNavigate();
  const { transactions, getAllTransactions } = useTransactionStore();

  useEffect(() => {
    getAllTransactions();
  }, [getAllTransactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterValue, startDate, endDate]);

  const filteredTransactions = Array.isArray(transactions?.data)
    ? transactions.data.filter((t) => {
      if (filterType === 'status') {
        return filterValue ? t.status === filterValue : true;
      }
      if (filterType === 'type') {
        return filterValue ? t.type === filterValue : true;
      }
      if (filterType === 'date') {
        const transactionDate = new Date(t.updatedAt);
        const from = startDate ? new Date(startDate) : null;
        const to = endDate ? new Date(endDate) : null;

        if (from && to) {
          return transactionDate >= from && transactionDate <= to;
        } else if (from) {
          return transactionDate >= from;
        } else if (to) {
          return transactionDate <= to;
        }
        return true;
      }
      return true; // No filter applied
    })
    : [];

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="h-full w-full p-5 pt-0 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4 items-center">
          <label className="font-bold text-[#243954]">Filter by:</label>
          <select
            className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setFilterValue('');
              setStartDate('');
              setEndDate('');
            }}
          >
            <option value="">None</option>
            <option value="status">Status</option>
            <option value="type">Type</option>
            <option value="date">Date</option>
          </select>

          {filterType === 'status' && (
            <select
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            >
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="failed">Failed</option>
            </select>
          )}

          {filterType === 'type' && (
            <select
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            >
              <option value="">All</option>
              <option value="Appointment">Appointment</option>
              <option value="Medication">Medication</option>
              <option value="LabTest">Lab Test</option>
            </select>
          )}

          {filterType === 'date' && (
            <div className="flex space-x-2">
              <input
                type="date"
                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="text-gray-600 text-sm">to</span>
              <input
                type="date"
                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-y-auto rounded-xl shadow-lg border border-gray-300">
        <div className="overflow-y-scroll h-[210px]">
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
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={`cursor-pointer px-2 py-1 rounded-full text-xs font-medium
                            ${transaction.type === 'Appointment' ? 'bg-blue-100 text-blue-800' :
                            transaction.type === 'Medication' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'}`}
                        onClick={() => navigate(`/AppointmentDetails/${transaction.referenceId}`)}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        onClick={transaction.status === 'unpaid' ? () => navigate(`/UpdateTransaction/${transaction._id}`) : undefined}
                        className={`cursor-pointer px-2 py-1 rounded-full text-xs font-medium
                            ${transaction.status === 'paid' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}
                            ${transaction.status === 'unpaid' ? 'hover:underline' : ''}`}
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
      <div className="mt-6 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold text-[#243954] mb-4">Transaction Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Spent</p>
            <p className="text-2xl font-bold text-blue-800">
              ${Array.isArray(transactions.data)
                ? transactions.data.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0).toFixed(2)
                : '0.00'}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Completed Payments</p>
            <p className="text-2xl font-bold text-green-800">
              {Array.isArray(transactions.data)
                ? transactions.data.filter(t => t.status === 'paid').length
                : 0}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600">Pending Payments</p>
            <p className="text-2xl font-bold text-yellow-800">
              {Array.isArray(transactions.data)
                ? transactions.data.filter(t => t.status === 'unpaid').length
                : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPayments;
