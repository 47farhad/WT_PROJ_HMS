import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { usePrescriptionStore } from "../../store/usePrescriptionStore";
import { useNavigate } from "react-router-dom";

function PatientPrescriptions() {

    const { prescriptions, isPrescriptionsLoading, getPrescriptions } = usePrescriptionStore();

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showDateFilter, setShowDateFilter] = useState(false);

    const [isAtBottom, setIsAtBottom] = useState(false);

    const containerRef = useRef(null);
    const bottomRef = useRef(null)

    const navigate = useNavigate();

    useEffect(() => {
        getPrescriptions();
    }, [getPrescriptions]);

    useEffect(() => {
        if (isAtBottom && !prescriptions.pagination.isPageLoading && prescriptions.pagination.hasMore && !isPrescriptionsLoading) {
            getPrescriptions(prescriptions.pagination.currentPage + 1);
        }
    }, [
        isAtBottom,
        prescriptions.pagination.currentPage,
        prescriptions.pagination.isPageLoading,
        prescriptions.pagination.hasMore,
        isPrescriptionsLoading,
        getPrescriptions
    ]);

    useEffect(() => {
        const container = containerRef.current;

        const handleScroll = () => {
            if (!container || !bottomRef.current) return;

            const endRefPosition = bottomRef.current.getBoundingClientRect().bottom;
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

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        if (name === "startDate") setStartDate(value);
        else if (name === "endDate") setEndDate(value);
    };

    const filteredPrescriptions = (prescriptions.data || []).filter(prescription => {
        const orderDate = new Date(prescription.createdAt);
        const matchesStartDate = !startDate || orderDate >= new Date(startDate);
        const matchesEndDate = !endDate || orderDate <= new Date(endDate);
        return matchesStartDate && matchesEndDate;
    });

    if (!prescriptions) {
        return (
            <div>
                Loading
            </div>
        )
    }

    return (
        <div className="h-full w-full p-5 pt-0 overflow-y-auto text-base">
            <div className="w-full mx-auto space-y-3">
                {/* Top Bar */}
                <div className="flex items-center justify-between flex-wrap gap-3 p-2 mb-4">
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
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-y-auto max-h-110 rounded-xl shadow border border-gray-300" ref={containerRef}>
                    <table className="min-w-full table-auto bg-white text-sm">
                        <thead className="sticky top-0 bg-[#243954] text-white">
                            <tr>
                                <th className="py-3 px-4">ID</th>
                                <th className="py-3 px-4">Given By</th>
                                <th className="py-3 px-4">Dated</th>
                                <th className="py-3 px-4">Expiry</th>
                                <th className="py-3 px-4">No. of Medicine</th>
                                <th className="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-center font-medium">
                            {prescriptions.data.map((prescription) => {
                                const status = prescription.activeData.overallStatus.isExpired
                                    ? 'expired'
                                    : prescription.activeData.overallStatus.isFullyUsed
                                        ? 'used'
                                        : 'available';

                                return (
                                    <tr key={prescription._id} className="hover:bg-gray-50"
                                    onClick={() => navigate(`/Prescriptions/${prescription._id}`)}>
                                        <td className="py-3 px-4">{prescription._id.slice(-6)}</td>
                                        <td className="py-3 px-4">
                                            {prescription.doctorName || 'Unknown'}
                                        </td>
                                        <td className="py-3 px-4">
                                            {new Date(prescription.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            {new Date(prescription.expiryDate).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            {prescription.activeData.overallStatus.totalPrescribed}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${status === 'available' ? 'bg-green-100 text-green-800' :
                                                status === 'used' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr ref={bottomRef} />
                        </tbody>
                    </table>
                </div>

                {/* No Data Message */}
                {filteredPrescriptions.length === 0 && (
                    <p className="text-center text-base font-medium text-gray-500 mt-2">
                        No prescriptions match your filters
                    </p>
                )}
            </div>
        </div>
    )
}

export default PatientPrescriptions;