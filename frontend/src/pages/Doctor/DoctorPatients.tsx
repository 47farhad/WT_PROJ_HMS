import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";

import '../../css/hideScroll.css'
import { useAdminStore } from "../../store/useAdminStore";
import { useNavigate } from "react-router-dom";

function DoctorPatients() {

    const { patients, getPatients, isPatientsLoading } = useAdminStore();

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showAgePicker, setShowAgePicker] = useState(false);
    const [startAge, setStartAge] = useState(-1);
    const [endAge, setEndAge] = useState(-1);
    const [searchQuery, setSearchQuery] = useState('');

    const patientsEndRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        getPatients()
    }, [getPatients])

    useEffect(() => {
        const current = patientsEndRef.current;

        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry.isIntersecting && !patients.pagination.isPageLoading && patients.pagination.hasMore && (patients.data.length != 0)) {
                    getPatients(patients.pagination.currentPage + 1)
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
    }, [getPatients, patients.pagination, patients.data.length]);

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        if (name === "startDate") setStartDate(value);
        if (name === "endDate") setEndDate(value);
    };

    const handleClick = (patientId) => {
        navigate(`/Patients/${patientId}`);
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
                    {/* Age picker */}
                    <div className="flex justify-end relative focus:outline-none hov">
                        <button
                            onClick={() => setShowAgePicker(!showAgePicker)}
                            className="h-10 px-4 border-none bg-[#F2F3F5] hover:bg-[#243954] hover:text-white transition-colors duration-100 text-[#434446] text-md rounded-lg focus:ring-2 focus:outline-none outline-none flex items-center gap-2"
                        >
                            {/* Age Filter Icon - Birthday Version */}
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
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>

                            {(endAge > -1 || startAge > -1)
                                ? `${startAge > -1 ? startAge : ''} - ${endAge > -1 ? endAge : ''}`
                                : "Filter by Age"}

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

                        {showAgePicker && (
                            <div className="absolute z-10 top-full right-0 mt-1 bg-white p-4 shadow-lg rounded-lg border border-gray-300 w-64">
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label
                                            htmlFor="startDate"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Start Age
                                        </label>
                                        <input
                                            type="number"
                                            id="startDate"
                                            name="startDate"
                                            min="0"
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
                                            value={startAge > -1 ? startAge : ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setStartAge(val === '' ? -1 : parseInt(val));
                                            }}
                                            placeholder="Min age"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label
                                            htmlFor="endDate"
                                            className="block text-sm font-medium text-gray-700 mb-1"
                                        >
                                            End Age
                                        </label>
                                        <input
                                            type="number"
                                            id="endDate"
                                            name="endDate"
                                            min="0"
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
                                            value={endAge > -1 ? endAge : ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setEndAge(val === '' ? -1 : parseInt(val));
                                            }}
                                            placeholder="Max age"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

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
                                    <th className="text-left pl-5 py-4 font-normal w-[21%]">Name</th>
                                    <th className="text-left pl-2 py-4 font-normal w-[7%]">ID</th>
                                    <th className="text-left pl-2 py-4 font-normal w-[7%]">Age</th>
                                    <th className="text-left pl-2 py-4 font-normal w-[20%]">Latest Appointment</th>
                                    <th className="text-left pl-2 py-4 font-normal w-[25%]">Reason</th>
                                    <th className="text-left pl-2 py-4 font-normal w-[20%]">Latest Doctor</th>
                                </tr>
                            </thead>
                        </table>
                    </div>

                    {/* Scrollable table body */}
                    <div className="flex-grow overflow-y-auto scrollbar-hide">
                        <table className="w-full table-fixed">
                            <tbody className="bg-white text-md text-[#333]">
                                {patients.data
                                    .filter(patient => {
                                        // Name search filter
                                        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
                                        const matchesSearch = fullName.includes(searchQuery.toLowerCase());

                                        // Date range filter
                                        const appointmentDate = new Date(patient.appointment);
                                        const start = startDate ? new Date(startDate) : null;
                                        const end = endDate ? new Date(endDate) : null;
                                        const matchesDate = (!start || appointmentDate >= start) && (!end || appointmentDate <= end);

                                        // Age filter handling
                                        const hasAgeFilter = startAge >= 0 || endAge >= 0;
                                        let matchesAge = true; // Default to true if no age filtering

                                        if (hasAgeFilter) {
                                            // If age filtering is active but medicalInfo or DOB is missing, exclude
                                            if (!patient.medicalInfo || !patient.medicalInfo.dateOfBirth) {
                                                matchesAge = false;
                                            } else {
                                                // Calculate age if we have DOB
                                                const dob = new Date(patient.medicalInfo.dateOfBirth);
                                                const today = new Date();
                                                let age = today.getFullYear() - dob.getFullYear();
                                                const monthDiff = today.getMonth() - dob.getMonth();
                                                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                                                    age--;
                                                }

                                                matchesAge =
                                                    (startAge < 0 || age >= startAge) &&
                                                    (endAge < 0 || age <= endAge);
                                            }
                                        }

                                        return matchesSearch && matchesDate && matchesAge;
                                    })
                                    .map(patient => {
                                        const dob = new Date(patient.medicalInfo?.dateOfBirth);
                                        const today = new Date();
                                        let age = today.getFullYear() - dob.getFullYear();
                                        const monthDiff = today.getMonth() - dob.getMonth();
                                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                                            age--;
                                        }

                                        return (
                                            <tr key={patient._id} className="hover:bg-gray-50 border-b border-[#f0f0f0]"
                                            onClick={() => {handleClick(patient._id)}}>
                                                <td className="text-left pl-5 py-4 font-normal w-[21%] truncate" title={`${patient.firstName} ${patient.lastName}`}>
                                                    <div className="flex items-center gap-2">
                                                        {patient.profilePic && (
                                                            <img
                                                                src={patient.profilePic}
                                                                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                                                                alt={`${patient.firstName}'s profile`}
                                                            />
                                                        )}
                                                        <span className="truncate">
                                                            {patient.firstName} {patient.lastName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="text-left pl-2 py-4 font-normal w-[7%] truncate" title={patient._id}>
                                                    {patient._id}
                                                </td>
                                                <td className="text-left pl-2 py-4 font-normal w-[7%] truncate">
                                                    {patient.medicalInfo?.dateOfBirth ? age : '-'}
                                                </td>
                                                <td className="text-left pl-2 py-4 font-normal w-[20%] truncate" title={patient.appointment || '-'}>
                                                    {patient.appointment || '-'}
                                                </td>
                                                <td className="text-left pl-2 py-4 font-normal w-[25%] truncate" title={patient.reason || '-'}>
                                                    {patient.reason || '-'}
                                                </td>
                                                <td className="text-left pl-2 py-4 font-normal w-[20%] truncate" title={patient.doctor || '-'}>
                                                    {patient.doctor || '-'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                                <tr ref={patientsEndRef} className="w-full" />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DoctorPatients