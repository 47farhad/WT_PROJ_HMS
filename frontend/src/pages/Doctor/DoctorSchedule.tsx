import React, { useState, useEffect, useRef } from "react";
import { format ,isAfter} from "date-fns";
import { useAppointmentStore } from "../../store/useAppointmentStore";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

function DoctorSchedule() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("confirmed");
  const [patientFilter, setPatientFilter] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  const {
    getAllAppointments,
    isAppointmentsLoading,
    appointments: { data: appointments, pagination }
  } = useAppointmentStore();

  const appointmentEndRef = useRef(null);
  const appointmentContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getAllAppointments();
  }, [getAllAppointments]);

  useEffect(() => {
    if (
      isAtBottom &&
      !pagination.isPageLoading &&
      pagination.hasMore &&
      !isAppointmentsLoading
    ) {
      getAllAppointments(pagination.currentPage + 1);
    }
  }, [isAtBottom, pagination, getAllAppointments, isAppointmentsLoading]);

  useEffect(() => {
    const container = appointmentContainerRef.current;

    const handleScroll = () => {
      if (!container || !appointmentEndRef.current) return;
      const endRefPosition = appointmentEndRef.current.getBoundingClientRect().bottom;
      const containerPosition = container.getBoundingClientRect().bottom;
      const threshold = 5;
      const reachedBottom = Math.abs(endRefPosition - containerPosition) <= threshold;
      setIsAtBottom(reachedBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (appointmentId) => {
    navigate(`/DoctorAppointmentDetails/${appointmentId}`);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate") setStartDate(value);
    if (name === "endDate") setEndDate(value);
  };

  const filteredAppointments = (appointments || []).filter((appointment) => {
    const appointmentDate = new Date(appointment.datetime);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Date filtering
    if (start && appointmentDate < start) return false;
    if (end && appointmentDate > end) return false;
    
    // Status filtering
    if (
      statusFilter !== "all" &&
      appointment.status.toLowerCase() !== statusFilter.toLowerCase()
    ) return false;
    
    // Patient name filtering
    if (patientFilter) {
      const fullName = `${appointment.patientFirstName} ${appointment.patientLastName}`.toLowerCase();
      if (!fullName.includes(patientFilter.toLowerCase())) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="h-full w-full p-5 pt-0 overflow-y-auto" style={{ zoom: "120%" }}>
      <div className="w-full mx-auto">
        {/* Top Controls */}
        <div className="flex flex-wrap justify-between items-center gap-4 p-2 mb-3">
          {/* Search Bar */}
          <div className="flex items-center justify-start w-70 h-10 rounded-md bg-[#F2F3F5] px-3">
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
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              placeholder="Search by patient name"
            />
            {patientFilter && (
              <button 
                onClick={() => setPatientFilter("")}
                className="text-gray-500 ml-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Right: Date Filter + Book Button */}
          <div className="flex items-center gap-3">
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
                Filter by Date
                {showDateFilter ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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

        {/* Appointment Table */}
        <div
          className="overflow-y-auto max-h-110 rounded-xl shadow-lg border border-gray-300"
          ref={appointmentContainerRef}
        >
          <table className="min-w-full table-auto bg-white text-sm">
            <thead className="sticky top-0 bg-[#243954] text-white">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 font-medium">
              {filteredAppointments.map((appointment) => (
                <tr
                  key={appointment._id}
                  className="text-center border-t hover:bg-blue-50 cursor-pointer"
                  onClick={() => handleClick(appointment._id)}
                >
                  <td className="py-3 px-4 truncate max-w-[100px]">
                    <div className="flex items-center justify-left gap-3">
                      <img
                        className="w-10 h-10 rounded-full"
                        src={appointment.patientprofilePic}
                        alt={`${appointment.patientFirstName} ${appointment.patientLastName}`}
                      />
                      <div className="text-left">
                        <div className="text-left font-medium text-gray-800 whitespace-nowrap">
                          {appointment.patientFirstName} {appointment.patientLastName}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    {format(new Date(appointment.datetime), "d-MMM-yyyy")}
                  </td>
                  <td>
                    {format(new Date(appointment.datetime), "h:mm a")}
                  </td>
                  <td className="py-3 px-4 truncate max-w-[100px]">
                    <span
                      className={`px-2 py-1 rounded-full text-sm bg-green-100 text-green-800 "${
                        appointment.status === "confirmed"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                </tr>
              ))}
              <tr ref={appointmentEndRef} />
            </tbody>
          </table>
        </div>

        {/* No Appointments Message */}
        {filteredAppointments.length === 0 && (
          <p className="text-center text-lg font-medium text-gray-500 mt-4">
            {appointments.length === 0
              ? "No appointments scheduled"
              : "No appointments match your filters"}
          </p>
        )}
      </div>
    </div>
  );
}

export default DoctorSchedule;