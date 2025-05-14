import React, { useEffect,useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppointmentStore } from "../../store/useAppointmentStore";
import { format, parseISO } from "date-fns";
import ConfirmationModal from "../../components/ConfirmationModal";

function DoctorAppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const {
    selectedAppointment,
    getAppointmentDetails,
    isAppointmentLoading,
    updateAppointmentStatus,
  } = useAppointmentStore();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    if (appointmentId) {
      getAppointmentDetails(appointmentId);
    }
  }, [appointmentId, getAppointmentDetails]);
 
  if (isAppointmentLoading || !selectedAppointment) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#243954]"></div>
      </div>
    );
  }

  const handleStatusChange = (status) => {
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    await updateAppointmentStatus(appointmentId, newStatus);
    setShowStatusModal(false);
  };

  const handleAddNotes = () => {
    navigate("/appointmentsnotes");
  };

  const handleAddPrescription = (appointmentId) => {
    navigate(`/prescriptionform/${appointmentId}`);
  };

  return (
    <div className="flex flex-row mx-5 mb-5 h-full">
      {/* Left side - Appointment details */}
      <div className="flex flex-col w-[70%] h-full">
          
            {/* Header card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h1 className="text-2xl font-bold text-[#243954] mb-2">Appointment Details</h1>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span>Appointment ID:</span>
                    <span className="ml-2 font-medium text-gray-700">{selectedAppointment._id}</span>
                  </div>
                </div>
                
                <div className="flex items-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${
                    selectedAppointment.status === "confirmed"
                  }`}>
                    {selectedAppointment.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                <div>
                  <div className="mb-4">
                    <span className="block text-sm text-gray-500">Appointment Date</span>
                    <span className="text-md font-semibold text-gray-700">
                      {format(parseISO(selectedAppointment.datetime), "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500">Time</span>
                    <span className="text-md font-semibold text-gray-700">
                      {format(parseISO(selectedAppointment.datetime), "h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

        {/* Appointment notes */}
        <div className="flex flex-col w-full mt-5 border-2 border-[#E6E6E8] rounded-2xl p-5 h-[40%]">
          <span className="text-lg font-semibold text-[#04080B] border-b border-[#E6E6E8] pb-2">
            Appointment Notes
          </span>
          <div className="mt-3 overflow-y-auto">
            {selectedAppointment.description ? (
              <p className="text-gray-700 whitespace-pre-line">
                {selectedAppointment.description}
              </p>
            ) : (
              <p className="text-gray-500 italic">No notes provided for this appointment.</p>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Actions and related info */}
      <div className="flex flex-col w-[30%] h-full ml-5">
        {/* Patient info */}
        <div className="bg-[#F5F5F5] rounded-2xl p-5 mb-5">
          <span className="text-lg font-semibold text-[#04080B] mb-3">
            Patient Information
          </span>
          <div className="flex items-center">
            <img 
              src={selectedAppointment.PatientProfilePic || "/default-patient.png"} 
              className="size-12 rounded-xl mr-3 mt-2" 
            />
            <div>
               <span className="text-sm text-[#4B4C4E]">Patient ID:</span>
                <span className="ml-1 text-sm text-[#4C4D4F] truncate">
                  {selectedAppointment.patientId}
                  </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#F5F5F5] rounded-2xl p-5 flex-1">
          <span className="text-lg font-semibold text-[#04080B] mb-3">
            Appointment Actions
          </span>
          
          <div className="space-y-5 mt-6">
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-white border border-gray-300 text-[#243954] px-3 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Back to Appointments
            </button>

            <button
              onClick={handleAddNotes}
              className="w-full bg-[#243954] text-white px-4 py-2 rounded-lg hover:bg-[#1e2e4a] transition font-medium"
            >
              Add Notes
            </button>

            <button
              onClick={() => handleAddPrescription(appointmentId)}
              className="w-full bg-[#243954] text-white px-4 py-2 rounded-lg hover:bg-[#1e2e4a] transition font-medium"
            >
              Add Prescription
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showStatusModal}
        onConfirm={confirmStatusChange}
        onCancel={() => setShowStatusModal(false)}
        title={`Change Appointment Status`}
        message={`Are you sure you want to mark this appointment as ${newStatus}?`}
      />
    </div>
  );
}

export default DoctorAppointmentDetails;