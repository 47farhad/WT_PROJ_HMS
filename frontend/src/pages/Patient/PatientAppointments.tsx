import React, { useState } from "react";

function PatientAppointments() {
  // State to manage search query
  const [searchQuery, setSearchQuery] = useState("");

  const [appointments, setAppointments] = useState([]);

  return (
    <div
      className="min-h-screen w-full p-6"
      style={{
        background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 50%, #f5f3ff 100%)",
      }}
    >
      <div className="w-full max-w-screen-xl mx-auto">

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search here..."
            className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabular Display of Appointments */}
        <div className="w-full max-w-screen-xl">
          <h3 className="text-xl font-bold mb-4">Your Appointments</h3>
          <table className="min-w-full table-auto bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-[#243954] text-white">
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments
                .filter((appointment) =>
                  appointment.doctor.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((appointment) => (
                  <tr key={appointment.id} className="border-b">
                    <td className="py-3 px-4">{appointment.doctor}</td>
                    <td className="py-3 px-4">{appointment.date}</td>
                    <td className="py-3 px-4">{appointment.time}</td>
                    <td className="py-3 px-4">{appointment.reason}</td>
                    <td className="py-3 px-4">{appointment.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* No Appointments Message */}
          {appointments.length === 0 || appointments.filter((appointment) =>
            appointment.doctor.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 ? (
            <p className="text-center text-lg font-medium text-gray-500 mt-4">No appointments scheduled</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default PatientAppointments;
