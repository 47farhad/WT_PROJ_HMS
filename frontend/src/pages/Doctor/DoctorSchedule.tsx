import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../lib/axios";

interface Appointment {
  _id: string;
  patientName: string;
  date: string;
  time: string;
  reason: string;
  status: "Confirmed" | "Pending" | "Cancelled";
}

function DoctorSchedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/doctor/appointments");
      setAppointments(response.data);
    } catch (err: any) {
      setError("Failed to fetch appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full p-6 bg-gray-100">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold text-[#243954] mb-6">Your Schedule</h1>

        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-[#243954] text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Patient Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Time</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Reason</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading schedule...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No appointments scheduled.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{appointment.patientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(appointment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{appointment.time}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{appointment.reason}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === "Confirmed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DoctorSchedule;