import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppointmentStore } from "../../store/useAppointmentStore";
import { format, parseISO, isAfter } from "date-fns";
import { StarIcon } from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast";

function PatientAppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const {
    selectedAppointment,
    getAppointmentDetails,
    isAppointmentLoading,
  } = useAppointmentStore();

  const [patientNotes, setPatientNotes] = useState([]);
  const [showReviewSection, setShowReviewSection] = useState(false);

  const [review, setReview] = useState({
    rating: 0,
    comment: "",
    hoverRating: 0,
    isSubmitting: false
  });

  useEffect(() => {
    if (appointmentId) {
      getAppointmentDetails(appointmentId);
    }
  }, [appointmentId, getAppointmentDetails]);

  useEffect(() => {
    if (selectedAppointment?.datetime) {
      const appointmentDate = parseISO(selectedAppointment.datetime);
      const now = new Date();
      setShowReviewSection(isAfter(now, appointmentDate));
    }
  }, [selectedAppointment]);

  const handleRatingChange = (rating) => {
    setReview({ ...review, rating });
  };

  const handleHoverRating = (rating) => {
    setReview({ ...review, hoverRating: rating });
  };

  const handleCommentChange = (e) => {
    setReview({ ...review, comment: e.target.value });
  };

  const handleSubmitReview = () => {
    if (review.rating === 0) {
      toast.warning("Please select a rating");
      return;
    }

    setReview({ ...review, isSubmitting: true });

    // Simulate API call with timeout
    setTimeout(() => {
      toast.success("Thank you for your feedback!");
      setReview({
        rating: 0,
        comment: "",
        hoverRating: 0,
        isSubmitting: false
      });
    }, 1500);
  };

  if (isAppointmentLoading || !selectedAppointment) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#243954]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-row mx-5 mb-5 h-full overflow-y-auto" style={{ zoom: "100%" }}>
      {/* Left side - Appointment details */}
      <div className="flex flex-col w-[75%] h-full space-y-6 space-x-8">
        {/* Header card */}
        <div className="bg-white border border-gray-300 rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-[#243954]">Appointment Details</h1>
              <div className="flex items-center text-gray-600">
                <span>Appointment ID:</span>
                <span className="ml-2 font-medium text-gray-700">{selectedAppointment._id}</span>
              </div>
            </div>

            <div className="flex items-end">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${selectedAppointment.status === "confirmed" ? "bg-green-100 text-green-800" :
                  selectedAppointment.status === "completed" ? "bg-blue-100 text-blue-800" :
                    selectedAppointment.status === "cancelled" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                }`}>
                {selectedAppointment.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <div>
                <span className="block text-gray-600">Appointment Date</span>
                <span className="text-lg font-semibold text-gray-700">
                  {format(parseISO(selectedAppointment.datetime), "EEEE, MMMM d, yyyy")}
                </span>
              </div>
              <div>
                <span className="block text-gray-600">Time</span>
                <span className="text-lg font-semibold text-gray-700">
                  {format(parseISO(selectedAppointment.datetime), "h:mm a")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description and Notes Container */}
        <div className="flex flex-row w-full h-[48%] gap-6">
          {/* Description */}
          <div className="flex flex-col w-[28%] border-2 border-gray-300 rounded-2xl p-5 h-[111%] bg-white">
            <span className="text-lg font-semibold text-[#243954] text-center border-b border-gray-300 pb-3 mb-4">
              Description
            </span>
            <div className="flex-1 overflow-y-auto">
              {selectedAppointment.description ? (
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedAppointment.description}
                </p>
              ) : (
                <p className="text-gray-500 italic">No description provided for this appointment.</p>
              )}
            </div>
          </div>

          {/* Patient Notes */}
          <div className="flex flex-col w-[67%] border-2 border-gray-300 rounded-2xl p-5 h-[111%] bg-white">
            <div className="flex justify-between items-center mb-5 border-b border-gray-300 pb-3">
              <span className="text-lg font-semibold text-[#243954]">
                Patient Notes
              </span>
            </div>
            <div className="grid grid-cols-3 gap-5 overflow-y-auto">
              {patientNotes.map(note => (
                <div key={note.id} className="border border-gray-300 rounded-lg p-4 h-full flex flex-col">
                  <p className="text-gray-500 text-sm mb-2">{note.date}</p>
                  <h3 className="text-md font-semibold text-[#243954] mb-3">{note.title}</h3>
                  <p className="text-gray-700 text-sm flex-grow">{note.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Doctor info and Review */}
      <div className="flex flex-col w-[25%] h-full space-y-6">
        {/* Doctor info */}
        <div className="bg-gray-50 rounded-2xl p-6 h-[30%] border border-gray-200">
          <span className="text-lg font-semibold text-[#243954] mb-4">
            Doctor Information
          </span>
          <div className="flex items-center gap-4">
            <img
              src={selectedAppointment.DoctorProfilePic || "/default-doctor.png"}
              className="size-16 rounded-xl"
              alt="Doctor"
            />
            <div>
              <h3 className="text-lg font-semibold text-[#243954]">
                Dr. {selectedAppointment.doctorId.firstName} {selectedAppointment.doctorId.lastName}
              </h3>

              <p className="text-sm text-gray-600">{selectedAppointment.doctorSpecialization}</p>
            </div>
          </div>
        </div>

        {/* Review Section - Only shown if appointment is in the past */}
        {showReviewSection && (
          <div className="bg-gray-50 rounded-2xl shadow-sm h-[60%] p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#243954] mb-5">Rate Your Experience</h3>

            {/* Star Rating */}
            <div className="mb-5">
              <p className="text-gray-600 mb-3">How would you rate this appointment?</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    onMouseEnter={() => handleHoverRating(star)}
                    onMouseLeave={() => handleHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <StarIcon
                      className={`h-9 w-9 ${star <= (review.hoverRating || review.rating)
                          ? "text-yellow-400"
                          : "text-gray-300"
                        }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                {review.rating > 0 ? `You rated this ${review.rating} star${review.rating > 1 ? 's' : ''}` : 'Select a rating'}
              </p>
            </div>

            {/* Review Comment */}
            <div className="mb-2">
              <label htmlFor="comment" className="block text-gray-600 mb-3">
                Share your feedback (optional):
              </label>
              <textarea
                id="comment"
                rows="5"
                value={review.comment}
                onChange={handleCommentChange}
                className="w-full p-4 border border-gray-300 rounded-lg outline-neutral-500 text-sm"
                placeholder="How was your experience with the doctor?"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitReview}
              disabled={review.rating === 0 || review.isSubmitting}
              className={`w-full py-3 px-5 rounded-lg font-medium transition-colors ${review.rating === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#243954] text-white hover:bg-[#1e2e4a]"
                }`}
            >
              {review.isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        )}

        {/* Message if review section shouldn't be shown */}
        {!showReviewSection && (
          <div className="bg-gray-50 rounded-2xl shadow-sm h-[60%] p-6 border border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Appointment Not Completed</h3>
              <p className="mt-1 text-gray-500">
                You can submit your review after the appointment time has passed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientAppointmentDetails;