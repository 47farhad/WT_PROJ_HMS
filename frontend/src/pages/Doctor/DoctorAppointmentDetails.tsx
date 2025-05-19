import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppointmentStore } from "../../store/useAppointmentStore";
import { useNotesStore } from "../../store/useNotesStore";
import { format, parseISO, isAfter } from "date-fns";
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

  // Change to use the single note instead of array
  const { getNotesbyAppointmentId, appointmentNotes, isNotesLoading } = useNotesStore();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [showActionButtons, setShowActionButtons] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      getAppointmentDetails(appointmentId);
      getNotesbyAppointmentId(appointmentId);
    }
  }, [appointmentId, getAppointmentDetails, getNotesbyAppointmentId]);

  useEffect(() => {
    if (selectedAppointment?.datetime) {
      const appointmentTime = parseISO(selectedAppointment.datetime);
      const currentTime = new Date();
      setShowActionButtons(isAfter(currentTime, appointmentTime));
    }
  }, [selectedAppointment]);

  if (isAppointmentLoading || !selectedAppointment) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#243954]"></div>
      </div>
    );
  }

  // Handle the single note or null case
  const renderNotes = () => {
    const note = appointmentNotes[appointmentId]; // Extract note for the specific appointment ID
   
   if (!note) {
     return (
       <div className="flex items-center justify-center h-full">
         <p className="text-gray-500 italic">No notes available for this appointment</p>
       </div>
     );
   }
   
   return (
     <div className="border border-gray-300 rounded-lg p-3 h-full">
       <p className="text-gray-500 text-sm mb-1">
         {note.createdAt && format(new Date(note.createdAt), "MMM d, yyyy")}
       </p>
       <h3 className="text-md font-bold text-[#243954] mb-2">{note.header}</h3>
       <p className="text-gray-700 text-md">{note.text}</p>
     </div>
   );
  };


  const handleStatusChange = (status) => {
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    await updateAppointmentStatus(appointmentId, newStatus);
    setShowStatusModal(false);
  };

  const handleAddNotes = () => {
    navigate(`/notes/${appointmentId}`);
  };

  const handleAddPrescription = (appointmentId) => {
    navigate(`/prescriptionform/${appointmentId}`);
  };

  return (
    <div className="flex flex-row mx-5 mb-5 h-full overflow-y-auto" style={{ zoom: "100%" }}>
      {/* Left side - Appointment details */}
      <div className="flex flex-col w-[75%] h-full space-x-9 space-y-5"> {/* Added space-y-5 for consistent spacing */}

        {/* Header card */}
        <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h1 className="text-3xl font-bold text-[#243954] mb-2">Appointment Details</h1>
              <div className="flex items-center text-lg text-gray-500 mb-4">
                <span>Appointment ID:</span>
                <span className="ml-2 font-medium text-gray-700">{selectedAppointment._id}</span>
              </div>
            </div>

            <div className="flex items-end">
              <span className={`px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 ${selectedAppointment.status === "confirmed" ? "bg-green-100" : ""
                }`}>
                {selectedAppointment.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-9">
            <div>
              <div className="mb-4">
                <span className="block text-lg text-gray-500">Appointment Date</span>
                <span className="text-xl font-semibold text-gray-700">
                  {format(parseISO(selectedAppointment.datetime), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div>
                <span className="block text-lg text-gray-500">Time</span>
                <span className="text-xl font-semibold text-gray-700">
                  {format(parseISO(selectedAppointment.datetime), "h:mm a")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Notes Container */}
        <div className="flex flex-row w-full h-[48%] space-x-5"> {/* Added space-x-5 for gap between columns */}
          {/* Description */}
          <div className="flex flex-col w-[28%] border-2 border-gray-300 rounded-2xl p-4 h-full bg-white"> {/* Added p-4 and bg-white */}
            <span className="text-lg font-semibold text-[#04080B] font-sans text-center border-b border-[#E6E6E8] pb-2 mb-3"> {/* Improved border styling */}
              Description
            </span>
            <div className="flex-1 overflow-y-auto"> {/* Added overflow handling */}
              {selectedAppointment.description ? (
                <p className="text-left text-gray-700 whitespace-pre-line">
                  {selectedAppointment.description}
                </p>
              ) : (
                <p className="text-gray-500 italic">No description provided for this appointment.</p>
              )}
            </div>
          </div>

            {/* Patient Notes */}
          <div className="flex flex-col w-[67%] border-2 border-gray-300 rounded-2xl p-4 h-full bg-white">
            <div className="flex justify-between items-center mb-4 border-b border-[#E6E6E8] pb-2">
              <span className="text-lg font-semibold text-[#04080B]">
                Patient Notes
              </span>
            </div>
            {renderNotes()}
          </div>
        </div>
      </div>


      {/* Right side - Actions and related info */}
      <div className="flex flex-col w-[25%] h-full space-y-5"> {/* Added space-y-5 */}
        {/* Patient info */}
        <div className="bg-[#F5F5F5] rounded-2xl p-5 h-[30%]"> {/* Added fixed height */}
          <span className="text-xl font-semibold text-[#04080B] mb-3">
            Patient Information
          </span>
          <div className="flex items-center">
            <img
              src={selectedAppointment.patientId.profilePic}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              alt={`${selectedAppointment.patientId.firstName} ${selectedAppointment.patientId.lastName}`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <span className="text-lg text-[#4B4C4E]">Name:</span>
              <span className="ml-1 text-lg text-[#4C4D4F] truncate">
                {selectedAppointment.patientId.firstName} {selectedAppointment.patientId.lastName}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#F5F5F5] rounded-2xl p-5 flex-1">
          <span className="text-xl font-semibold text-[#04080B] mb-3">
            Appointment Actions
          </span>
          <div className="space-y-4">
            <button
              onClick={() => navigate(-1)}
              className="mt-6 w-full bg-white border border-gray-300 text-[#243954] px-4 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Back to Appointments
            </button>

            {showActionButtons && (
              <>
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
              </>
            )}
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