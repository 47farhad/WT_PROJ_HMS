import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppointmentStore } from "../../store/useAppointmentStore";
import { format } from "date-fns";
import ConfirmationModal from "../../components/ConfirmationModal"; // Adjust path if needed

function PatientAppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const {
    selectedAppointment,
    getAppointmentDetails,
    isAppointmentLoading,
    updateAppointment,
  } = useAppointmentStore();

  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      getAppointmentDetails(appointmentId);
    }
  }, [appointmentId, getAppointmentDetails]);

  useEffect(() => {
  
  if (isAppointmentLoading) return;

  if (!selectedAppointment) {
    navigate("/Appointments");
  }
}, [isAppointmentLoading, selectedAppointment, navigate]);


  const handleCancelAppointment = () => {
    setShowCancelModal(true);
  };

  const confirmCancellation = () => {
    updateAppointment(appointmentId);
    setShowCancelModal(false);
  };

  if (isAppointmentLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 bg-[#1a2c42]"></div>
      </div>
    );
  }

  return selectedAppointment ? (
    <div className="h-full w-full p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Appointment Details</h1>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedAppointment.status === "confirmed"
              ? "bg-green-100 text-green-800"
              : selectedAppointment.status === "cancelled"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {selectedAppointment.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Appointment Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Appointment ID</p>
              <p className="text-gray-700">{selectedAppointment._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Datetime</p>
              <p className="text-gray-700">
                {format(new Date(selectedAppointment.datetime), "d-MMM-yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="text-gray-700">
                {format(new Date(selectedAppointment.datetime), "h:mm a")}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Related IDs
          </h2>
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

        {selectedAppointment.description && (
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Description
            </h2>
            <p className="text-gray-700">{selectedAppointment.description}</p>
          </div>
        )}

        <div className="md:col-span-2">
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

      {/* Cancel Button */}
      {selectedAppointment.status !== "cancelled" && (
        <div className="flex justify-end">
          <button
            onClick={handleCancelAppointment}
            className="px-6 py-2 bg-[#1a2c42] text-white rounded-lg hover:bg-[#162636]"
          >
            Cancel Appointment
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showCancelModal && (
        <ConfirmationModal
          isOpen={showCancelModal}
          onCancel={() => setShowCancelModal(false)}
          onConfirm={confirmCancellation}
          title="Cancel Appointment"
          message="Are you sure you want to cancel this appointment?"
        />
      )}
    </div>
  ) : null;
}

export default PatientAppointmentDetails;
