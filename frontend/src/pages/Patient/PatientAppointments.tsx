import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import BookAppointment from "../../components/BookAppointment";
import { useAppointmentStore } from "../../store/useAppointmentStore";

function PatientAppointments() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formData, setFormData] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [handleChange, setHandleChange] = useState("");
  const { appointments, getAllAppointments } = useAppointmentStore();

  useEffect(() => {
    getAllAppointments();
  }, [getAllAppointments]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate") setStartDate(value);
    if (name === "endDate") setEndDate(value);
  };

  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      <div className="w-full max-w-screen-xl mx-auto">
        <div>
          <h3 className="text-xl text-[#243954] font-bold mb-4">
            Your Appointments
          </h3>
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
              >
                {startDate && endDate
                  ? `${format(new Date(startDate), "d-MMM-yyyy")} to ${format(
                      new Date(endDate),
                      "d-MMM-yyyy"
                    )}`
                  : "Filter by Date"}
              </button>
              {showDatePicker && (
                <div className="absolute z-10 mt-2 bg-white p-4 shadow-lg rounded-lg border border-gray-300">
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
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="mt-4 bg-[#243954] hover:bg-[#1a2c42] text-white px-4 py-2 rounded-lg"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-[#243954] hover:bg-[#1a2c42] text-white px-5 py-2 rounded-lg font-medium transition"
            >
              + Book Appointment
            </button>
          </div>

          <div className="overflow-y-auto max-h-98 rounded-xl shadow-lg border border-gray-300">
            <table className="min-w-full table-auto bg-white">
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
                {appointments.data
                  .filter((appointment) => {
                    const appointmentDate = new Date(appointment.datetime);
                    const start = startDate ? new Date(startDate) : null;
                    const end = endDate ? new Date(endDate) : null;

                    if (start && appointmentDate < start) return false;
                    if (end && appointmentDate > end) return false;
                    return true;
                  })
                  .map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="text-center border-t hover:bg-blue-50"
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
                          className={`px-2 py-1 rounded-full text-sm ${
                            appointment.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "Cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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

      {showBookingModal && (
        <BookAppointment
          onClose={() => setShowBookingModal(false)}
          formData={formData}
          handleChange={handleChange}
          error={error}
          success={success}
        />
      )}
    </div>
  );
}

export default PatientAppointments;
