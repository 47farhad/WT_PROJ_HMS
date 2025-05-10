import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function PatientLabtests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [labTests, setLabTests] = useState([
    {
      _id: "1",
      name: "Complete Blood Count (CBC)",
      description: "Measures components of blood including RBCs, WBCs, and platelets",
      duration: "30 minutes",
      price: 45.99,
      requirements: ["Fasting for 8 hours", "Bring ID and insurance card", "Wear comfortable clothing"]
    },
    {
      _id: "2",
      name: "Lipid Panel",
      description: "Measures cholesterol levels and other fats in your blood",
      duration: "45 minutes",
      price: 65.00,
      requirements: ["12-hour fasting required", "Morning appointment preferred", "No alcohol 24 hours before"]
    },
    {
      _id: "3",
      name: "Diabetes Screening",
      description: "Tests blood glucose levels to screen for diabetes",
      duration: "1 hour",
      price: 55.50,
      requirements: ["8-hour fasting required", "Bring list of medications", "Morning appointment only"]
    },
    {
      _id: "4",
      name: "Thyroid Function Test",
      description: "Evaluates thyroid hormone levels",
      duration: "1 hour",
      price: 50.00,
      requirements: ["No medication before test", "Fasting not required"]
    },
    {
      _id: "5",
      name: "Vitamin D Test",
      description: "Measures Vitamin D levels",
      duration: "30 minutes",
      price: 40.00,
      requirements: ["No fasting required"]
    },
    {
      _id: "6",
      name: "COVID-19 Test",
      description: "Detects current COVID-19 infection",
      duration: "15 minutes",
      price: 30.00,
      requirements: ["Avoid eating or drinking 30 mins before"]
    },
    {
      _id: "7",
      name: "Liver Function Test",
      description: "Analyzes enzymes and proteins in your blood",
      duration: "1 hour",
      price: 60.00,
      requirements: ["8-hour fasting", "Avoid alcohol 24 hours"]
    },
    {
      _id: "8",
      name: "Kidney Function Test",
      description: "Checks how well kidneys are working",
      duration: "45 minutes",
      price: 55.00,
      requirements: ["8-hour fasting", "Bring medication list"]
    },
    {
      _id: "9",
      name: "Iron Studies",
      description: "Measures iron levels in blood",
      duration: "1 hour",
      price: 48.00,
      requirements: ["8-hour fasting"]
    },
    {
      _id: "10",
      name: "HBA 1-C",
      description: "Diabetes Test",
      duration: "15 minutes",
      price: 20.00,
      requirements: ["Morning sample preferred"]
    },
    {
      _id: "11",
      name: "Calcium Test",
      description: "Measures calcium level in blood",
      duration: "30 minutes",
      price: 35.00,
      requirements: ["No fasting required"]
    },
    {
      _id: "12",
      name: "Electrolyte Panel",
      description: "Checks balance of minerals like sodium and potassium",
      duration: "30 minutes",
      price: 40.00,
      requirements: ["Drink water before test"]
    },
    {
      _id: "13",
      name: "Hormone Test",
      description: "Measures hormone levels",
      duration: "1 hour",
      price: 70.00,
      requirements: ["No medication before test"]
    }
  ]);

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredTests = labTests.filter((test) =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const paginatedTests = filteredTests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleBookTest = (test) => {
    navigate("/book-labtest", { state: { test } });
  };

  return (
    <div className="h-full max-h-[calc(100vh-88px)] w-full p-5 pt-0 overflow-y-scroll text-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#243954]">Lab tests</h1>
        <input
          type="text"
          placeholder="Search tests..."
          className="w-1/4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">Loading lab tests...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginatedTests.map((test) => (
              <div
                key={test._id}
                className="bg-white border border-gray-300 rounded-xl shadow-md transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:border-[#a5b1c0] hover:z-10"
              >
                <div className="p-4 flex flex-col h-full">
                  <div className="flex-grow">
                    <h3 className="text-base font-semibold text-[#243954] mb-1">{test.name}</h3>
                    <p className="text-gray-500 mb-2 text-sm">{test.description}</p>
                    <p className="font-semibold text-sm text-[#243954] mb-2">${test.price}</p>
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-1 text-sm">Requirements:</h4>
                      <ul className="list-disc list-inside text-xs text-gray-600">
                        {test.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookTest(test)}
                    className="mt-auto w-full bg-[#243954] text-white py-1.5 rounded-md text-sm hover:bg-[#1a2c42] transition-colors"
                  >
                    Book Test
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTests.length > itemsPerPage && (
            <div className="mt-6 flex justify-end text-sm">
              <div className="space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1 bg-[#243954] rounded text-white disabled:opacity-50"
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                <span className="text-[#243954] font-medium">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="px-3 py-1 bg-[#243954] rounded text-white disabled:opacity-50"
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {filteredTests.length === 0 && !loading && !error && (
        <p className="text-center text-base font-medium text-gray-500 mt-4">
          No lab tests available
        </p>
      )}
    </div>
  );
}

export default PatientLabtests;