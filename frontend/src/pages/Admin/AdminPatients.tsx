import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { useAdminStore } from "../../store/useAdminStore";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

function AdminPatients() {
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
        getPatients();
    }, [getPatients]);

    useEffect(() => {
        const current = patientsEndRef.current;
        const observer = new IntersectionObserver(
            (entries) => {
                const firstEntry = entries[0];
                if (firstEntry.isIntersecting && !patients.pagination.isPageLoading && patients.pagination.hasMore && (patients.data.length != 0)) {
                    getPatients(patients.pagination.currentPage + 1);
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
    };

    return (
        <div className="h-full w-full p-5 pt-2 overflow-y-auto"style={{zoom:"120%"}}>
            <div className="w-full mx-auto ">
                <div className="flex flex-wrap justify-between items-center gap-4 p-2 mb-3">
                    {/* Search Bar */}
                    <div className="flex items-center justify-start w-70 h-10 rounded-md bg-[#F2F3F5] px-3 ">
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
                        <input
                            className="w-full bg-transparent text-md border-none focus:outline-none placeholder-[#87888A]"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value) }}
                            placeholder="Search patient name"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Age Filter */}
                        <div className="relative">
                            <button
                                onClick={() => setShowAgePicker(!showAgePicker)}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 rounded-lg text-[#243954] hover:bg-gray-300 transition"
                            >
                                <svg
                                    className="w-4 h-4 text-[#243954]"
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
                                </svg>
                                {(endAge > -1 || startAge > -1)
                                    ? `${startAge > -1 ? startAge : ''} - ${endAge > -1 ? endAge : ''}`
                                    : "Filter by Age"}
                                {showAgePicker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {showAgePicker && (
                                <div className="absolute right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-md p-3 z-10">
                                    <div className="flex flex-col gap-2 text-[#243954] text-sm">
                                        <label className="flex flex-col">
                                            Start Age
                                            <input
                                                type="number"
                                                name="startAge"
                                                min="0"
                                                className="border px-2 py-1 rounded-md text-sm"
                                                value={startAge > -1 ? startAge : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setStartAge(val === '' ? -1 : parseInt(val));
                                                }}
                                                placeholder="Min age"
                                            />
                                        </label>
                                        <label className="flex flex-col">
                                            End Age
                                            <input
                                                type="number"
                                                name="endAge"
                                                min="0"
                                                className="border px-2 py-1 rounded-md text-sm"
                                                value={endAge > -1 ? endAge : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setEndAge(val === '' ? -1 : parseInt(val));
                                                }}
                                                placeholder="Max age"
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Date Filter */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 rounded-lg text-[#243954] hover:bg-gray-300 transition"
                            >
                                <svg
                                    className="w-4 h-4 text-[#243954]"
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
                                {showDatePicker ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>

                            {showDatePicker && (
                                <div className="absolute right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-md p-3 z-10">
                                    <div className="flex flex-col gap-2 text-[#243954] text-sm">
                                        <label className="flex flex-col">
                                            Start Date
                                            <input
                                                type="date"
                                                name="startDate"
                                                className="border px-2 py-1 rounded-md text-sm"
                                                value={startDate}
                                                onChange={handleDateChange}
                                            />
                                        </label>
                                        <label className="flex flex-col">
                                            End Date
                                            <input
                                                type="date"
                                                name="endDate"
                                                className="border px-2 py-1 rounded-md text-sm"
                                                value={endDate}
                                                onChange={handleDateChange}
                                            />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Patients Table */}
                <div className="overflow-y-auto rounded-xl shadow-lg border border-gray-300 bg-white">
                    <table className="min-w-full table-auto bg-white text-sm">
                        <thead className="sticky top-0 bg-[#243954] text-white">
                            <tr>
                                <th className="py-3 px-4 text-left">Patient</th>
                                <th className="py-3 px-4 text-left">ID</th>
                                <th className="py-3 px-4 text-left">Age</th>
                                <th className="py-3 px-4 text-left">Upcoming Appointment</th>
                                <th className="py-3 px-4 text-left">Time</th>
                                <th className="py-3 px-4 text-left">Doctor</th>
                                <th className="py-3 px-4 text-left">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {patients.data
                            .filter(patient => {
                                // Name search filter
                                const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
                                const matchesSearch = fullName.includes(searchQuery.toLowerCase());

                                // Age filter handling
                                const hasAgeFilter = startAge >= 0 || endAge >= 0;
                                let matchesAge = true;

                                if (hasAgeFilter) {
                                    if (!patient.medicalInfo || !patient.medicalInfo.dateOfBirth) {
                                        matchesAge = false;
                                    } else {
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

                                // Date filter handling
                                const hasDateFilter = startDate || endDate;
                                let matchesDate = true;

                                if (hasDateFilter && patient.appointmentDate) {
                                    const appointmentDate = new Date(patient.appointmentDate);
                                    const start = startDate ? new Date(startDate) : null;
                                    const end = endDate ? new Date(endDate) : null;

                                    if (start && appointmentDate < start) matchesDate = false;
                                    if (end && appointmentDate > end) matchesDate = false;
                                } else if (hasDateFilter && !patient.appointmentDate) {
                                    matchesDate = false;
                                }

                                return matchesSearch && matchesAge && matchesDate;
                            })
                                .map(patient => {
                                    const dob = new Date(patient.medicalInfo?.dateOfBirth);
                                    const today = new Date();
                                    let age = today.getFullYear() - dob.getFullYear();
                                    const monthDiff = today.getMonth() - dob.getMonth();
                                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                                        age--;
                                    }

                                    // Format appointment date and time if available
                                    let appointmentDate = '-';
                                    let appointmentTime = '-';
                                    if (patient.appointmentDate) {
                                        appointmentDate = format(new Date(patient.appointmentDate), 'dd-MMM-yyyy');
                                        appointmentTime = format(new Date(patient.appointmentDate), 'h:mm a');
                                    }

                                    return (
                                        <tr
                                            key={patient._id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleClick(patient._id)}
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    {patient.profilePic ? (
                                                        <img
                                                            src={patient.profilePic}
                                                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                            alt={`${patient.firstName} ${patient.lastName}`}
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                            {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className="truncate">
                                                        {patient.firstName} {patient.lastName}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 truncate" title={patient._id}>
                                                {patient._id}
                                            </td>
                                            <td className="py-3 px-4">
                                                {patient.medicalInfo?.dateOfBirth ? age : '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                {patient.appointmentDate ? appointmentDate : '-'}
                                            </td>
                                            <td className="py-3 px-4">
                                                {patient.appointmentDate ? appointmentTime : '-'}
                                            </td>
                                            <td className="py-3 px-4 truncate" title={patient.doctor || '-'}>
                                                {patient.doctor || '-'}
                                            </td>
                                            <td className="py-3 px-4 truncate" title={patient.description || '-'}>
                                                {patient.description || '-'}
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                            <tr ref={patientsEndRef} />
                        </tbody>
                    </table>
                </div>

                {/* Loading and Empty States */}
                {isPatientsLoading && (
                    <div className="flex justify-center items-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#243954]"></div>
                    </div>
                )}
                {patients.data.length === 0 && !isPatientsLoading && (
                    <p className="text-center text-lg font-medium text-gray-500 mt-4">
                        No patients found
                    </p>
                )}
            </div>
        </div>
    );
}

export default AdminPatients;