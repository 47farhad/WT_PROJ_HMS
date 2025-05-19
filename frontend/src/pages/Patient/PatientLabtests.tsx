import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ChevronUp, ChevronDown } from "lucide-react";
import { usePatientLabTestStore } from "../../store/usePatientLabTestStore";
import ConfirmationModal from "../../components/ConfirmationModal";

function PatientLabTest() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testToCancel, setTestToCancel] = useState(null);

  const {
    getAllLabTests,
    cancelLabTest,
    isLabTestsLoading,
    labTests: {
      data: labTests,
      pagination
    }
  } = usePatientLabTestStore() as PatientLabTestStore;

  const labTestEndRef = useRef<HTMLTableRowElement>(null);
  const labTestContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    getAllLabTests();
  }, [getAllLabTests]);

  useEffect(() => {
    if (isAtBottom && !pagination.isPageLoading && pagination.hasMore && !isLabTestsLoading) {
      getAllLabTests(pagination.currentPage + 1);
    }
  }, [isAtBottom, pagination.currentPage, getAllLabTests, pagination.isPageLoading, pagination.hasMore, isLabTestsLoading]);

  useEffect(() => {
    const container = labTestContainerRef.current;
    
    if (!container) return;

    const handleScroll = () => {
      if (!container || !labTestEndRef.current) return;

      const endRefPosition = labTestEndRef.current.getBoundingClientRect().bottom;
      const containerPosition = container.getBoundingClientRect().bottom;

      const threshold = 5;
      const reachedBottom = Math.abs(endRefPosition - containerPosition) <= threshold;
      setIsAtBottom(reachedBottom);
    };
    
    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);


  const handleDownload = (test) => {
    const link = document.createElement('a');
    link.href = test.result;
    link.download = `test-result-${test._id}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate") setStartDate(value);
    else if (name === "endDate") setEndDate(value);
  };

  const filteredTests = (labTests || []).filter((test: LabTest) => {
    const testDate = new Date(test.datetime);
    const isStatusMatch = statusFilter === "all" || test.status === statusFilter;
    const isStartMatch = !startDate || testDate >= new Date(startDate);
    const isEndMatch = !endDate || testDate <= new Date(endDate);
    return isStatusMatch && isStartMatch && isEndMatch;
  });

  const handleCancelTestClick = (labTestId: string) => {
    setTestToCancel(labTestId);
    setIsModalOpen(true); // Open the modal
  };

  const handleConfirmCancel = () => {
    if (testToCancel) {
      cancelLabTest(testToCancel, { status: "cancelled" });
      setIsModalOpen(false); // Close the modal after confirmation
    }
  };

  return (
    <div className="h-full w-full p-5 pt-0 overflow-y-auto text-base"style={{ zoom: "120%" }}>
      <div className="w-full mx-auto space-y-3">
        {/* Top Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 p-2 mb-4">
          {/* Status Filters */}
          <div className="flex gap-1 flex-wrap">
            {["all", "confirmed", "pending", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2 py-1 rounded-md text-sm font-medium transition
                  ${statusFilter === status
                    ? "bg-[#243954] text-white"
                    : "bg-gray-200 text-[#243954] hover:bg-[#243954] hover:text-white"
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-5">
            {/* Filter by Date */}
            <div className="relative">

              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
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
                Filter by Date {showDateFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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

            {/* Book Tests button */}
            <button
              onClick={() => navigate("/ViewLabTests")}
              className="px-3 py-1 text-sm bg-[#243954] text-white rounded-md hover:opacity-90"
            >
              Book Tests
            </button>
          </div>
        </div>

        {/* Table */}
        <div
          className="overflow-y-auto max-h-110 rounded-xl shadow border border-gray-300"
          ref={labTestContainerRef}
        >
          <table className="min-w-full table-auto bg-white text-sm">
            <thead className="sticky top-0 bg-[#243954] text-white">
              <tr>
                <th className="py-3 px-4">Test Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-center font-medium">
              {filteredTests.map((test: LabTest) => (
                <tr
                  key={test._id}
                  className="hover:bg-sky-100 transition-colors duration-200"
                >
                  <td className="py-3 px-4">{test.testName}</td>
                  <td className="py-3 px-4">{new Date(test.datetime).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{format(new Date(test.datetime), 'hh:mm a')}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs 
                      ${test.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : test.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"}`}
                    >
                      {test.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {test.status !== "cancelled" && new Date(test.datetime) > new Date() && (
                      <button
                        onClick={() => handleCancelTestClick(test._id)}
                        className="px-2 py-1 text-sm bg-red-500 text-white rounded-md hover:opacity-80"
                      >
                        Cancel
                      </button>
                    )}

                    {test.status === "confirmed" &&
                      new Date(test.datetime) <= new Date() &&
                      test.result &&
                      test.result !== "" && (
                        <button
                          onClick={() => handleDownload(test)}
                          className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                        >
                          Download
                        </button>
                      )}
                  </td>
                </tr>
              ))}
              <tr ref={labTestEndRef} />
            </tbody>
          </table>
        </div>

        {/* No Data Message */}
        {filteredTests.length === 0 && (
          <p className="text-center text-base font-medium text-gray-500 mt-2">
            No lab tests match your filters
          </p>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Test"
        message="Are you sure you want to cancel this test?"
        showLoading={false}
      />
    </div>
  );
}

export default PatientLabTest;