import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../lib/axios';

interface Transaction {
  _id: string;  
  date: string;
  amount: number;
  type: 'Appointment' | 'Medicine' | 'Other';
  description: string;
  status: 'Completed' | 'Pending' | 'Failed';
  doctor?: string;
}

const PatientPayments: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/transactions');
      setTransactions(data);
    } catch (err) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = (transaction: Transaction) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      transaction.description.toLowerCase().includes(searchTerm) ||
      transaction.type.toLowerCase().includes(searchTerm) ||
      (transaction.doctor?.toLowerCase().includes(searchTerm))
    );
  };

  return (
    <div className="h-full overflow-y-scroll w-full p-6">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#243954]">Transaction History</h2>
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
          />
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#243954]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.filter(filterTransactions).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${transaction.type === 'Appointment' ? 'bg-blue-100 text-blue-800' :
                          transaction.type === 'Medicine' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactions.filter(filterTransactions).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No transactions found
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-[#243954] mb-4">Transaction Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600">Total Spent</p>
              <p className="text-2xl font-bold text-blue-800">
                ${transactions.reduce((sum, t) => sum + t.amount, 0)}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600">Completed Payments</p>
              <p className="text-2xl font-bold text-green-800">
                {transactions.filter(t => t.status === 'Completed').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-800">
                {transactions.filter(t => t.status === 'Pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Remove the addNewTransaction export as it's now handled by the backend

export default PatientPayments;
