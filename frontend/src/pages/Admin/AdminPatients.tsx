import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "../../store/useAdminStore";
import Spinner from '../../components/common/Spinner';

function AdminPatients() {
    const { patients, getPatients, isPatientsLoading } = useAdminStore();
    const navigate = useNavigate();

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [ageFilter, setAgeFilter] = useState<string>('');
    const [dateFilter, setDateFilter] = useState<string>('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showAgePicker, setShowAgePicker] = useState(false);
    const [startAge, setStartAge] = useState(-1);
    const [endAge, setEndAge] = useState(-1);
    const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Load patients on component mount
    useEffect(() => {
        try {
            getPatients();
        } catch (err) {
            setError("Failed to load patients data");
            console.error("Error loading patients:", err);
        }
    }, [getPatients]);

    // Filter patients whenever filter criteria or patients data changes
    useEffect(() => {
        if (!patients.data) return;

        let results = [...patients.data];
        
        // Apply search query filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(patient => 
                `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query) ||
                (patient.email && patient.email.toLowerCase().includes(query))
            );
        }
        
        // Apply age filter
        if (startAge >= 0 || endAge >= 0) {
            results = results.filter(patient => {
                if (!patient.medicalInfo || !patient.medicalInfo.dateOfBirth) return false;
                
                const dob = new Date(patient.medicalInfo.dateOfBirth);
                const today = new Date();
                let age = today.getFullYear() - dob.getFullYear();
                const monthDiff = today.getMonth() - dob.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                    age--;
                }
                
                return (startAge < 0 || age >= startAge) &&
                       (endAge < 0 || age <= endAge);
            });
        }
        
        // Apply date filter
        if (startDate || endDate) {
            results = results.filter(patient => {
                if (!patient.appointment) return false;
                
                const appointmentDate = new Date(patient.appointment);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;
                
                return (!start || appointmentDate >= start) && 
                       (!end || appointmentDate <= end);
            });
        }
        
        setFilteredPatients(results);
    }, [patients.data, searchQuery, startAge, endAge, startDate, endDate]);

    // Handle date change
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "startDate") setStartDate(value);
        if (name === "endDate") setEndDate(value);
    };
    
    // Handle patient click
    const handlePatientClick = (patientId: string) => {
        navigate(`/Patients/${patientId}`);
    };
    
    // Reset all filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setStartAge(-1);
        setEndAge(-1);
        setStartDate('');
        setEndDate('');
    };
    
    // Refresh data
    const handleRefreshData = async () => {
        try {
            await getPatients();
        } catch (err) {
            setError("Failed to refresh patients data");
            console.error("Error refreshing patients:", err);
        }
    };

    // Calculate patient age from DOB
    const calculateAge = (dateOfBirth: string) => {
        if (!dateOfBirth) return '-';
        
        const dob = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age.toString();
    };

    return (
        <div className="w-full p-6">
            <div className="max-w-screen-xl mx-auto">
                {/* Header with title and refresh button */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#243954]">Patient Management</h1>
                    <button 
                        onClick={handleRefreshData}
                        className="px-4 py-2 bg-[#243954] text-white rounded-md hover:bg-[#1a2a40] transition-colors"
                    >
                        Refresh Data
                    </button>
                </div>

                {/* Enhanced debug info for development */}
                {error && (
                    <div className="p-4 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Filters section */}
                <div className="bg-white rounded-lg shadow-md p-5 mb-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Filters</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Age filter */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                            <button
                                onClick={() => setShowAgePicker(!showAgePicker)}
                                className="w-full p-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954] flex justify-between items-center"
                            >
                                <span>
                                    {(startAge > -1 || endAge > -1)
                                        ? `${startAge > -1 ? startAge : 'Any'} - ${endAge > -1 ? endAge : 'Any'}`
                                        : "All Ages"}
                                </span>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {showAgePicker && (
                                <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-300 p-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label htmlFor="minAge" className="block text-sm font-medium text-gray-700 mb-1">
                                                Min Age
                                            </label>
                                            <input
                                                type="number"
                                                id="minAge"
                                                min="0"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
                                                value={startAge > -1 ? startAge : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setStartAge(val === '' ? -1 : parseInt(val));
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="maxAge" className="block text-sm font-medium text-gray-700 mb-1">
                                                Max Age
                                            </label>
                                            <input
                                                type="number"
                                                id="maxAge"
                                                min="0"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
                                                value={endAge > -1 ? endAge : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setEndAge(val === '' ? -1 : parseInt(val));
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => setShowAgePicker(false)}
                                            className="px-3 py-1 bg-[#243954] text-white rounded-md hover:bg-[#1a2a40] transition-colors text-sm"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Date filter */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
                            <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className="w-full p-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954] flex justify-between items-center"
                            >
                                <span>
                                    {startDate && endDate
                                        ? `${format(new Date(startDate), "MMM d, yyyy")} - ${format(new Date(endDate), "MMM d, yyyy")}`
                                        : startDate 
                                            ? `From ${format(new Date(startDate), "MMM d, yyyy")}`
                                            : endDate
                                                ? `Until ${format(new Date(endDate), "MMM d, yyyy")}`
                                                : "All Dates"}
                                </span>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {showDatePicker && (
                                <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-300 p-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                id="startDate"
                                                name="startDate"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
                                                value={startDate}
                                                onChange={handleDateChange}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                id="endDate"
                                                name="endDate"
                                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
                                                value={endDate}
                                                onChange={handleDateChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => setShowDatePicker(false)}
                                            className="px-3 py-1 bg-[#243954] text-white rounded-md hover:bg-[#1a2a40] transition-colors text-sm"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Search filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search patients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleResetFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors self-end"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Total patients count */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-[#243954] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">Total patients: {patients.data.length}</span>
                    </div>
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-[#243954] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="font-medium">Filtered patients: {filteredPatients.length}</span>
                    </div>
                </div>

                {/* Patients Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {isPatientsLoading ? (
                        <div className="p-6 flex justify-center">
                            <Spinner />
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No patients found matching your criteria
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#243954] text-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Age</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Latest Appointment</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Reason</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Latest Doctor</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPatients.map((patient) => {
                                        // Calculate age
                                        const age = patient.medicalInfo?.dateOfBirth ? 
                                            calculateAge(patient.medicalInfo.dateOfBirth) : '-';
                                            
                                        // Format appointment date if exists
                                        const formattedAppointment = patient.appointment ? 
                                            format(new Date(patient.appointment), "MMM d, yyyy") : '-';
                                            
                                        return (
                                            <tr key={patient._id} 
                                                className="hover:bg-gray-50 cursor-pointer" 
                                                onClick={() => handlePatientClick(patient._id)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            {patient.profilePic ? (
                                                                <img 
                                                                    className="h-10 w-10 rounded-full object-cover" 
                                                                    src={patient.profilePic} 
                                                                    alt={`${patient.firstName}'s profile`} 
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-[#243954] text-white flex items-center justify-center">
                                                                    <span>{patient.firstName && patient.firstName[0]}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {patient.firstName} {patient.lastName}
                                                            </div>
                                                            <div className="text-xs text-gray-500">{patient.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="text-sm">{patient._id.substring(0, 8)}...</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {age}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formattedAppointment}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="max-w-xs truncate">{patient.reason || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="max-w-xs truncate">{patient.doctor || '-'}</div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminPatients;