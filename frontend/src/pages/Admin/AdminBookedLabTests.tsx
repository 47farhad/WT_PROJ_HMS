import { format, parseISO } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePatientLabTestStore } from "../../store/usePatientLabTestStore";
import toast from "react-hot-toast";
import ConfirmationModal from "../../components/ConfirmationModal";

function AdminBookedLabTests() {

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedPdf, setSelectedPdf] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadTestId, setUploadTestId] = useState('');

    const patientsEndRef = useRef(null);

    const { getAllLabTests, isLabTestsLoading, labTests, uploadLabTest } = usePatientLabTestStore();

    const navigate = useNavigate();

    useEffect(() => {
        getAllLabTests();
    }, [getAllLabTests]);

    useEffect(() => {
        const current = patientsEndRef.current;

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry.isIntersecting && !labTests.pagination.isPageLoading && labTests.pagination.hasMore && (labTests.data.length != 0)) {
                    getAllLabTests(labTests.pagination.currentPage + 1)
                }
            },
            { threshold: 0.1 }
        );

        if (patientsEndRef.current) {
            observer.observe(patientsEndRef.current);
        }

        return () => {
            if (current) {
                observer.unobserve(current);
            }
        };
    }, [getAllLabTests, labTests.pagination, labTests.data.length]);

    const handlePdfChange = (e, testId) => {
        const file = e.target.files[0];

        if (!file) return;

        // Check if file is PDF
        if (file.type !== "application/pdf") {
            toast.error("Please select a PDF file");
            return;
        }

        // Check file size (e.g., 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB");
            return;
        }

        setSelectedPdf(file);
        setUploadTestId(testId)
        setShowModal(true); // Show confirmation modal
        e.target.value = ''; // Reset input to allow re-selection of same file
    };

    const handleConfirmUpload = async () => {
        if (!selectedPdf) {
            toast.error("No PDF selected");
            return;
        }

        try {
            setIsUploading(true);

            await uploadLabTest(uploadTestId, selectedPdf);

            setSelectedPdf(null);
            setIsUploading(false);
            setUploadTestId('');
            setShowModal(false);
        } catch (error) {
            toast.error("Failed to upload PDF");
            setIsUploading(false);
            console.error(error);
        }
    };

    const handleCancelUpload = () => {
        setSelectedPdf(null);
        setShowModal(false);
    };

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
        if (name === "endDate") setEndDate(value);
    };

    const filteredTests = (labTests.data || []).filter((test) => {
        const testDate = new Date(test.datetime);
        const isStartMatch = !startDate || testDate >= new Date(startDate);
        const isEndMatch = !endDate || testDate <= new Date(endDate);
        return isStartMatch && isEndMatch;
    });

    if (isLabTestsLoading) {
        return (
            <div>
                Loading
            </div>
        )
    }

    return (
        <div className="flex flex-col flex-1 items-center mx-5 max-h-[calc(100vh-88px)]">
            {/* Top div with filters and search bar */}
            <div className="flex flex-row justify-between w-full">
                {/* Search Bar */}
                <div className="flex items-center justify-start w-70 h-10 rounded-md bg-[#F2F3F5] px-3">
                    {/* Search Icon SVG */}
                    <svg
                        className="w-6 h-6 mr-2 text-[#87888A]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>

                    {/* Search Input */}
                    <input
                        className="w-full bg-transparent text-md border-none focus:outline-none placeholder-[#87888A]"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value) }}
                        placeholder="Search name"
                    />
                </div>

                <div className="flex flex-row gap-3">
                    {/* Date Picker */}
                    <div className="flex justify-end relative focus:outline-none">
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="h-10 px-4 border-none bg-[#F2F3F5] hover:bg-[#243954] transition-colors duration-100 hover:text-white text-[#434446] text-md rounded-lg focus:ring-2 focus:outline-none outline-none flex items-center gap-2"
                        >
                            {/* Calendar Icon */}
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>

                            {startDate && endDate
                                ? `${format(new Date(startDate), "d MMM yyyy")} - ${format(
                                    new Date(endDate),
                                    "d MMM yyyy"
                                )}`
                                : "Filter by Date"}

                            {/* Dropdown Arrow Icon */}
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {showDatePicker && (
                            <div className="absolute z-10 top-full right-0 mt-1 bg-white p-4 shadow-lg rounded-lg border border-gray-300">
                                <div className="flex gap-4">
                                    <div>
                                        <label
                                            htmlFor="startDate"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            name="startDate"
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
                                            value={startDate}
                                            onChange={handleDateChange}
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="endDate"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            name="endDate"
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
                                            value={endDate}
                                            onChange={handleDateChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* The table with all the patients */}
            <div className="h-full w-full my-5 rounded-2xl overflow-hidden flex flex-col">
                {/* Table container with fixed height */}
                <div className="flex-grow overflow-hidden flex flex-col">
                    {/* Table header (fixed) */}
                    <div className="flex-shrink-0">
                        <table className="w-full table-fixed">
                            <thead className="bg-[#243954] text-sm text-white">
                                <tr>
                                    <th className="text-left pl-5 py-4 font-normal w-[20%]">Name</th>
                                    <th className="text-left pl-2 py-4 font-normal w-[22%]">ID</th>
                                    <th className="text-left pl-2 py-4 font-normal w-[13%]">Amount</th>
                                    <th className="text-left pl-2 py-4 font-normal w-[10%]">Test</th>
                                    <th className="text-left pl-2 py-4 font-normal w-[15%]">Date</th>
                                    <th className="text-left pl-2 py-4 font-normal w-[10%]">Time</th>
                                    <th className="text-left pl-2 py-4 font-normal w-[10%]">Result</th>
                                </tr>
                            </thead>
                        </table>
                    </div>

                    {/* Scrollable table body */}
                    <div className="flex-grow overflow-y-auto scrollbar-hide">
                        <table className="w-full table-fixed">
                            <tbody className="bg-white text-md text-[#333]">
                                {filteredTests.map((test) => (
                                    <tr
                                        key={test._id}
                                    >
                                        <td className="text-left pl-5 py-4 font-normal w-[20%] truncate">
                                            <div className="flex items-center gap-2">
                                                {test.patientprofilePicture && (
                                                    <img
                                                        src={test.patientprofilePicture}
                                                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                                                        alt={`${test.patientFirstName}'s profile`}
                                                    />
                                                )}
                                                <span className="truncate">
                                                    {test.patientFirstName} {test.patientLastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-left pl-2 py-4 font-normal w-[22%] truncate">
                                            {test._id}
                                        </td>
                                        <td className="text-left pl-2 py-4 font-normal w-[13%] truncate">
                                            {test.testPrice}
                                        </td>
                                        <td className="text-left pl-2 py-4 font-normal w-[10%] truncate">
                                            {test.testName}
                                        </td>
                                        <td className="text-left pl-2 py-4 font-normal w-[15%] truncate">
                                            {format(parseISO(test.datetime), 'MMMM d, yyyy')}
                                        </td>
                                        <td className="text-left pl-2 py-4 font-normal w-[10%] truncate">
                                            {format(parseISO(test.datetime), 'hh:mm a')}
                                        </td>
                                        <td className="text-left pl-2 py-4 font-normal w-[10%] truncate">
                                            {test.result ? (
                                                <button
                                                    onClick={() => handleDownload(test)}
                                                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                                                >
                                                    Download
                                                </button>
                                            ) : (
                                                new Date(test.datetime) > new Date() ? (
                                                    <>
                                                        <input
                                                            type="file"
                                                            id={`upload-${test._id}`}
                                                            accept="application/pdf"
                                                            onChange={(e) => handlePdfChange(e, test._id)}
                                                            className="hidden"
                                                        />
                                                        <label
                                                            htmlFor={`upload-${test._id}`}
                                                            className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer"
                                                        >
                                                            Upload
                                                        </label>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                <tr ref={patientsEndRef} className="w-full" />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showModal}
                onConfirm={handleConfirmUpload}
                onCancel={handleCancelUpload}
                title="Upload Test Result"
                message="Are you sure you want to upload the selected file?"
                showLoading={isUploading}
            />
        </div>
    )
}

export default AdminBookedLabTests;