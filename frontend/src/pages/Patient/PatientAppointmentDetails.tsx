import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppointmentStore } from "../../store/useAppointmentStore";
import { format } from "date-fns";
function PatientAppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const {
    selectedAppointment,
    getAppointmentDetails,
    isAppointmentLoading,
    updateAppointment,
  } = useAppointmentStore();

  console.log(selectedAppointment, appointmentId);

  useEffect(() => {
    if (appointmentId) {
      getAppointmentDetails(appointmentId);
    }
  }, [appointmentId, getAppointmentDetails]);

  if (isAppointmentLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 bg-[#1a2c42]"></div>
      </div>
    );

  if (!selectedAppointment)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[#1a2c42] text-white rounded hover:bg-[#1a2c42]"
        >
          Back to Appointments
        </button>
      </div>
    );

  const handleCancelAppointment = () => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      updateAppointment(appointmentId);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        <div className="overflow-y-auto max-h-115 bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-[#1a2c42] px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-white"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Appointments
            </button>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${selectedAppointment.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : selectedAppointment.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
            >
              {selectedAppointment.status}
            </span>
          </div>

          {/* Main Content */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
              Appointment Details
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Appointment Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Appointment Information
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-gray-500 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Appointment ID</p>
                      <p className="text-gray-700">{selectedAppointment._id}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Datetime</p>
                      <p className="text-gray-700">
                        {format(new Date(selectedAppointment.datetime), "d-MMM-yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-gray-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="text-gray-700">
                        {format(new Date(selectedAppointment.datetime), "h:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Doctor ID</p>
                    <p className="text-gray-700">{selectedAppointment.doctorId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Patient ID</p>
                    <p className="text-gray-700">{selectedAppointment.patientId}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedAppointment.description && (
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">
                    Description
                  </h2>
                  <p className="text-gray-700">{selectedAppointment.description}</p>
                </div>
              )}

              {/* System Info */}
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  System Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Created At</p>
                    <p className="text-gray-700">
                    {format(new Date(selectedAppointment.createdAt), "d-MMM-yyyy h:mm a")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-gray-700">
                    {format(new Date(selectedAppointment.updatedAt), "d-MMM-yyyy h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Appointment Button */}
            <div className="flex justify-end mt-6">
            {selectedAppointment.status !== "cancelled" && (
              <button
                onClick={handleCancelAppointment}
                className="px-6 py-2 bg-[#1a2c42] text-white rounded-lg hover:bg-[#162636]"
              >
                Cancel Appointment
              </button>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientAppointmentDetails;