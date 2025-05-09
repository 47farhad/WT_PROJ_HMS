import React, { useState, useEffect } from "react";

function PatientLabtests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [labTests, setLabTests] = useState([
    {
      _id: "1",
      name: "Complete Blood Count (CBC)",
      description: "Measures components of blood including RBCs, WBCs, and platelets",
      duration: "30 minutes",
      price: 45.99,
      requirements: [
        "Fasting for 8 hours",
        "Bring ID and insurance card",
        "Wear comfortable clothing"
      ]
    },
    {
      _id: "2",
      name: "Lipid Panel",
      description: "Measures cholesterol levels and other fats in your blood",
      duration: "45 minutes",
      price: 65.00,
      requirements: [
        "12-hour fasting required",
        "Morning appointment preferred",
        "No alcohol 24 hours before"
      ]
    },
    {
      _id: "4",
      name: "Diabetes Screening",
      description: "Tests blood glucose levels to screen for diabetes",
      duration: "1 hour",
      price: 55.50,
      requirements: [
        "8-hour fasting required",
        "Bring list of medications",
        "Morning appointment only"
      ]
    },
    {
      _id: "5",
      name: "Diabetes Screening",
      description: "Tests blood glucose levels to screen for diabetes",
      duration: "1 hour",
      price: 55.50,
      requirements: [
        "8-hour fasting required",
        "Bring list of medications",
        "Morning appointment only"
      ]
    },
    {
      _id: "6",
      name: "Diabetes Screening",
      description: "Tests blood glucose levels to screen for diabetes",
      duration: "1 hour",
      price: 55.50,
      requirements: [
        "8-hour fasting required",
        "Bring list of medications",
        "Morning appointment only"
      ]
    },
    {
      _id: "7",
      name: "Diabetes Screening",
      description: "Tests blood glucose levels to screen for diabetes",
      duration: "1 hour",
      price: 55.50,
      requirements: [
        "8-hour fasting required",
        "Bring list of medications",
        "Morning appointment only"
      ]
    },
    {
      _id: "8",
      name: "Diabetes Screening",
      description: "Tests blood glucose levels to screen for diabetes",
      duration: "1 hour",
      price: 55.50,
      requirements: [
        "8-hour fasting required",
        "Bring list of medications",
        "Morning appointment only"
      ]
    },
    {
      _id: "9",
      name: "Diabetes Screening",
      description: "Tests blood glucose levels to screen for diabetes",
      duration: "1 hour",
      price: 55.50,
      requirements: [
        "8-hour fasting required",
        "Bring list of medications",
        "Morning appointment only"
      ]
    },
    {
      _id: "10",
      name: "Diabetes Screening",
      description: "Tests blood glucose levels to screen for diabetes",
      duration: "1 hour",
      price: 55.50,
      requirements: [
        "8-hour fasting required",
        "Bring list of medications",
        "Morning appointment only"
      ]
    },
  ]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBookTest = (test) => {
    setSelectedTest(test);
    setShowBookingModal(true);
  };

  return (
    <div className="h-full max-h-[calc(100vh-88px)] w-full p-5 pt-0 overflow-y-scroll">
      <div>
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Search tests..."
            className="w-1/4 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading lab tests...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labTests
              .filter((test) =>
                test.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((test) => (
                <div key={test._id} className="bg-white border-1 border-gray-300 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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

        {labTests.length === 0 && !loading && !error && (
          <p className="text-center text-lg font-medium text-gray-500 mt-4">
            No lab tests available
          </p>
        )}
      </div>
    </div>
  );
}

export default PatientLabtests;