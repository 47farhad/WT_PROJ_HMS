import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLabTestStore } from "../../store/useLabTestStore";

function ViewLabTests() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const {
    offeredLabTests,
    isOfferedLabTestsLoading,
    getOfferedLabTest,
  } = useLabTestStore();

  useEffect(() => {
    getOfferedLabTest();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredTests = offeredLabTests.filter((test) =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const paginatedTests = filteredTests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleBookTest = (labTestId) => {
    navigate(`/BookLabTest/${labTestId}`);
  };
  
  if(isOfferedLabTestsLoading){
        return (
            <div>
                Loading
            </div>
        )
    }
  return (
    <div className="h-full max-h-[calc(100vh-88px)] w-full p-4 pt-3 overflow-y-scroll text-sm">
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search tests..."
          className="w-1/4 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isOfferedLabTestsLoading ? (
        <div className="text-center py-8">Loading lab tests...</div>
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
                    <h3 className="text-base font-semibold text-[#243954] mb-1">
                      {test.name}
                    </h3>
                    <p className="text-gray-500 mb-2 text-sm">{test.description}</p>
                    <p className="font-semibold text-sm text-[#243954] mb-2">
                      ${test.price}
                    </p>
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-1 text-sm">
                        Requirements:
                      </h4>
                      <ul className="list-disc list-inside text-xs text-gray-600">
                        {test.requirements?.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookTest(test._id)}
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

      {!isOfferedLabTestsLoading && filteredTests.length === 0 && (
        <p className="text-center text-base font-medium text-gray-500 mt-4">
          No lab tests available
        </p>
      )}
    </div>
  );
}

export default ViewLabTests;
