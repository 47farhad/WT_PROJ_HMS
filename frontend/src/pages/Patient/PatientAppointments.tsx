import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useAppointmentStore } from "../../store/useAppointmentStore";
import { useNavigate } from "react-router-dom";

function PatientAppointments() {
  const [showSubFilter, setShowSubFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("");

  const {
    getAllAppointments,
    isAppointmentsLoading,
    appointments: {
      data: appointments,
      pagination
    }
  } = useAppointmentStore();

  const appointmentEndRef = useRef(null);
  const appointmentContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setStatusFilter("all");
    setDoctorFilter("");
    setStartDate("");
    setEndDate("");
  }, [showSubFilter]);

  useEffect(() => {
    getAllAppointments();
  }, [getAllAppointments]);

  useEffect(() => {
    if (isAtBottom && !pagination.isPageLoading && pagination.hasMore && !isAppointmentsLoading) {
      getAllAppointments(pagination.currentPage + 1);
    }
  }, [isAtBottom, pagination.currentPage, getAllAppointments, pagination.isPageLoading, pagination.hasMore, isAppointmentsLoading]);

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
    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
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
    <div className="h-full w-full p-5 pt-0 overflow-y-auto">
      <div className="w-full mx-auto">
        <div>
          <div className="flex justify-between items-center mb-4">

            <div className="flex items-center space-x-2">
              <span className=" text-[#243954] font-bold">Filter By:</span>
              <select
                className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
                onChange={(e) => setShowSubFilter(e.target.value)}
                value={showSubFilter}
              >
                <option value="">Select</option>
                <option value="status">Status</option>
                <option value="doctor">Doctor</option>
                <option value="date">Date</option>
              </select>

              {showSubFilter === "status" && (
                <select
                  className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              )}

              {showSubFilter === "doctor" && (
                <input
                  type="text"
                  placeholder="Doctor's name"
                  className="px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#243954] outline-none"
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                />
              )}

              {showSubFilter === "date" && (
                <>
                  <input
                    type="date"
                    name="startDate"
                    className="px-2 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#243954] outline-none"
                    value={startDate}
                    onChange={handleDateChange}
                  />
                  <span className="mx-1">to</span>
                  <input
                    type="date"
                    name="endDate"
                    className="px-2 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#243954] outline-none"
                    value={endDate}
                    onChange={handleDateChange}
                  />
                </>
              )}
            </div>
          </div>

          <div
            className="overflow-y-auto max-h-110 rounded-xl shadow-lg border border-gray-300"
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
                      className="text-center border-t hover:bg-blue-50"
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

          {appointments.length === 0 && (
            <p className="text-center text-lg font-medium text-gray-500 mt-4">
              No appointments scheduled
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientAppointments;
