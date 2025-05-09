import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../lib/axios';

interface Transaction {
  _id: string;  
  date: string;
  amount: number;
  type: 'Appointment' | 'Medicine' | 'Other';
  status: 'Paid' | 'Unpaid' | 'Failed';
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
      // Dummy data for transactions
      const dummyTransactions: Transaction[] = [
        {
          _id: "1",
          date: "2025-05-01T10:30:00Z",
          amount: 50.0,
          type: "Appointment",
          status: "Paid",
        },
        {
          _id: "2",
          date: "2025-05-02T14:00:00Z",
          amount: 20.0,
          type: "Medicine",
          status: "Paid",
        },
        {
          _id: "3",
          date: "2025-05-03T09:15:00Z",
          amount: 100.0,
          type: "Appointment",
          status: "Unpaid",
        },
        {
          _id: "4",
          date: "2025-05-04T16:45:00Z",
          amount: 15.0,
          type: "Medicine",
          status: "Paid",
        },
        {
          _id: "5",
          date: "2025-05-05T11:00:00Z",
          amount: 200.0,
          type: "Appointment",
          status: "Failed",
        },
        {
          _id: "6",
          date: "2025-05-06T13:30:00Z",
          amount: 30.0,
          type: "Medicine",
          status: "Paid",
        },
        {
          _id: "7",
          date: "2025-05-07T08:00:00Z",
          amount: 75.0,
          type: "Appointment",
          status: "Paid",
        },
        {
          _id: "8",
          date: "2025-05-08T15:20:00Z",
          amount: 12.0,
          type: "Medicine",
          status: "Unpaid",
        },
        {
          _id: "9",
          date: "2025-05-09T10:10:00Z",
          amount: 60.0,
          type: "Appointment",
          status: "Paid",
        },
        {
          _id: "10",
          date: "2025-05-10T17:50:00Z",
          amount: 25.0,
          type: "Medicine",
          status: "Paid",
        },
      ];
      setTransactions(dummyTransactions);
    } catch (err) {
      setError("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = (transaction: Transaction) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      transaction.type.toLowerCase().includes(searchTerm)
    );
  };

  return (
    <div className="h-full w-full p-6 overflow-y-auto">
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

        <div className="overflow-y-auto min-h-60 rounded-xl shadow-lg border border-gray-300">
          <div className="overflow-y-auto max-h-60">
            <table className="min-w-full table-auto">
              <thead className="sticky top-0 bg-[#243954] text-white ">
                <tr>
                  <th className="px-4 py-3 ">
                    Date
                  </th>
                  <th className="px-4 py-3 ">
                    Type
                  </th>
                  <th className="px-4 py-3 ">
                    Amount
                  </th>
                  <th className="px-4 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-center">
                {transactions.filter(filterTransactions).map((transaction) => (
                  <tr key={transaction._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
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
                        ${transaction.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'Unpaid' ? 'bg-yellow-100 text-yellow-800' :
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
                {transactions.filter(t => t.status === 'Paid').length}
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600">Pending Payments</p>
              <p className="text-2xl font-bold text-yellow-800">
                {transactions.filter(t => t.status === 'Unpaid').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPayments;
