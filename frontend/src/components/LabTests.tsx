import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import BookLabTest from './BookLabTest';

interface LabTest {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  requirements: string[];
}

const LabTests: React.FC = () => {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchLabTests();
  }, []);

  const fetchLabTests = async () => {
    try {
      const { data } = await axiosInstance.get('/lab-tests');
      setTests(data);
    } catch {
      setError('Failed to fetch lab tests');
    } finally {
      setLoading(false);
    }
  };

  const handleBookTest = (test: LabTest) => {
    setSelectedTest(test);
    setShowBookingForm(true);
  };

  return (
    <div className="min-h-screen w-full p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#243954] mb-8">Laboratory Tests</h1>

        {loading ? (
          <div className="text-center py-8">Loading available tests...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div key={test._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#243954] mb-2">{test.name}</h3>
                  <p className="text-gray-600 mb-4">{test.description}</p>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Duration: {test.duration}</p>
                    <p className="font-semibold text-lg text-[#243954]">${test.price}</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {test.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => handleBookTest(test)}
                    className="w-full bg-[#243954] text-white py-2 rounded-lg hover:bg-[#1a2c42] transition-colors"
                  >
                    Book Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showBookingForm && selectedTest && (
        <BookLabTest
          test={selectedTest}
          onClose={() => setShowBookingForm(false)}
          onSuccess={() => {
            setShowBookingForm(false);
            setSelectedTest(null);
          }}
        />
      )}
    </div>
  );
};

export default LabTests;