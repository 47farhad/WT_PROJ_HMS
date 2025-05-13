import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useAppointmentStore } from "../../store/useAppointmentStore";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";

function PatientAppointments() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("");
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
    navigate(`/AppointmentDetails/${appointmentId}`);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate") setStartDate(value);
    if (name === "endDate") setEndDate(value);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-88px)] w-full p-5 pt-0 overflow-y-auto">
      {/* Top Controls */}
      <div className="flex justify-between items-center flex-wrap gap-3 p-2 mb-4">
        {/* Status  */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Status Buttons */}
          {["all", "confirmed", "pending", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2 py-1 rounded-md text-sm font-medium transition ${statusFilter === status
                ? "bg-[#243954] text-white"
                : "bg-gray-200 text-[#243954] hover:bg-[#243954] hover:text-white"
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
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

          {/* Book Appointment Button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs bg-[#243954] text-white px-2 py-2 rounded-md hover:bg-[#1c2d4a]"
          >
            Book Appointment
          </button>
        </div>
      </div>

      {/* Appointment Table */}
      <div
        className="flex flex-1 overflow-y-auto rounded-xl shadow-lg border border-gray-300"
        ref={appointmentContainerRef}
      >
        <table className="min-w-full table-auto bg-white text-sm">
          <thead className="sticky top-0 bg-[#243954] text-white">
            <tr>
              <th className="py-3 px-4">Doctor</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-center font-medium">
            {(appointments || [])
              .filter((appointment) => {
                const appointmentDate = new Date(appointment.datetime);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;

                if (start && appointmentDate < start) return false;
                if (end && appointmentDate > end) return false;
                if (
                  statusFilter !== "all" &&
                  appointment.status.toLowerCase() !== statusFilter
                )
                  return false;
                if (
                  doctorFilter &&
                  !(
                    appointment.doctorFirstName
                      .toLowerCase()
                      .includes(doctorFilter.toLowerCase()) ||
                    appointment.doctorLastName
                      .toLowerCase()
                      .includes(doctorFilter.toLowerCase())
                  )
                )
                  return false;
                return true;
              })
              .map((appointment) => (
                <tr
                  key={appointment._id}
                  className="text-center border-t hover:bg-blue-50 cursor-pointer"
                  onClick={() => handleClick(appointment._id)}
                >
                  <td className="py-3 px-4 truncate max-w-[100px]">
                    {appointment.doctorFirstName +
                      " " +
                      appointment.doctorLastName}
                  </td>
                  <td>
                    {format(new Date(appointment.datetime), "d-MMM-yyyy")}
                  </td>
                  <td>
                    {format(new Date(appointment.datetime), "h:mm a")}
                  </td>
                  <td className="py-3 px-4 truncate max-w-[100px]">
                    {appointment.description}
                  </td>
                  <td className="py-3 px-4 truncate max-w-[100px]">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${appointment.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
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
      {appointments.length === 0 && (
        <p className="text-center text-lg font-medium text-gray-500 mt-4">
          No appointments scheduled
        </p>
      )}
    </div>
  );
}

export default PatientAppointments;
