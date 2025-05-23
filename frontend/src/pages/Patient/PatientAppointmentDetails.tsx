import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppointmentStore } from "../../store/useAppointmentStore";
import { useNotesStore } from "../../store/useNotesStore";
import { useReviewsStore } from "../../store/useReviewsStore";
import { format, parseISO, isAfter } from "date-fns";
import { StarIcon } from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast";

function PatientAppointmentDetails() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const {
    selectedAppointment,
    getAppointmentDetails,
    isAppointmentLoading,
  } = useAppointmentStore();

  const { getNotesbyAppointmentId, appointmentNotes } = useNotesStore();
  const { createReviews, getReviews, givenReviews, isReviewsLoading } = useReviewsStore();

  const [review, setReview] = useState({
    rating: 0,
    comment: "",
    hoverRating: 0,
    isSubmitting: false
  });

  useEffect(() => {
    if (appointmentId) {
      getAppointmentDetails(appointmentId);
      getNotesbyAppointmentId(appointmentId);
      getReviews(appointmentId)
    }
  }, [appointmentId, getAppointmentDetails, getNotesbyAppointmentId, getReviews]);

  const [hasSubmittedReview, setHasSubmittedReview] = useState(false);

  useEffect(() => {
    if (selectedAppointment?.datetime) {
      const appointmentDate = parseISO(selectedAppointment.datetime);
      const now = new Date();
      const isPastAppointment = isAfter(now, appointmentDate);

      // Check if review exists in the appointment data or in your store
      const hasExistingReview = selectedAppointment.review || false;

      setHasSubmittedReview(hasExistingReview);
    }
  }, [selectedAppointment]);

  const handleRatingChange = (rating) => {
    setReview({ ...review, rating });
  };

  const renderNotes = () => {
    if (!appointmentNotes) return (<div className="flex items-center justify-center h-full">
      <p className="text-gray-500 italic">No notes available for this appointment</p>
    </div>)

    return (
      <div className="border border-gray-300 rounded-lg p-3 h-full">
        <p className="text-gray-500 text-sm mb-1">
          {appointmentNotes.createdAt && format(new Date(appointmentNotes.createdAt), "MMM d, yyyy")}
        </p>
        <h3 className="text-md font-bold text-[#243954] mb-2">{appointmentNotes.header}</h3>
        <p className="text-gray-700 text-md">{appointmentNotes.text}</p>
      </div>
    );
  };

  const handleHoverRating = (rating) => {
    setReview({ ...review, hoverRating: rating });
  };

  const handleCommentChange = (e) => {
    setReview({ ...review, comment: e.target.value });
  };

  const handleSubmitReview = async () => {
    if (review.rating === 0) {
      toast.warning("Please select a rating");
      return;
    }

    setReview({ ...review, isSubmitting: true });

    try {
      const reviewsData = {
        rating: review.rating,
        reviewText: review.comment
      };

      await createReviews(appointmentId, reviewsData);

      setReview({
        rating: 0,
        comment: "",
        hoverRating: 0,
        isSubmitting: false
      });

      // Update the review status
      setHasSubmittedReview(true);
    } catch (error) {
      setReview({ ...review, isSubmitting: false });
    }
  };

  if (isAppointmentLoading || !selectedAppointment || isReviewsLoading) {
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
          <div className="flex flex-col w-[67%] border-2 border-gray-300 rounded-2xl p-4 h-[111%] bg-white">
            <div className="flex justify-between items-center mb-4 border-b border-[#E6E6E8] pb-2">
              <span className="text-lg font-semibold text-[#04080B]">
                Patient Notes
              </span>
            </div>
            {renderNotes()}
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
          <div className="flex items-center">
            <img
              src={selectedAppointment.doctorId.profilePic}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              alt={`${selectedAppointment.doctorId.firstName} ${selectedAppointment.doctorId.lastName}`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h3 className="text-lg font-semibold text-[#243954]">
                Dr. {selectedAppointment.doctorId.firstName} {selectedAppointment.doctorId.lastName}
              </h3>

              <p className="text-sm text-gray-600">{selectedAppointment.doctorSpecialization}</p>
            </div>
          </div>
        </div>

        {/* Review Section - Only shown if appointment is in the past and no review exists */}
        {(!givenReviews && isAfter(new Date(), parseISO(selectedAppointment.datetime))) && (
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

        {givenReviews && (
          <div className="bg-gray-50 rounded-2xl shadow-sm h-[60%] p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#243954] mb-5">Your Review</h3>

            {/* Rating Display */}
            <div className="mb-5">
              <p className="text-gray-600 mb-3">Your rating:</p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`h-9 w-9 ${star <= givenReviews.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                  />
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 mt-2">
                You rated this {givenReviews.rating} star{givenReviews.rating !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Review Text Display */}
            {givenReviews.reviewText && (
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Your feedback:</p>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800">{givenReviews.reviewText}</p>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-400 text-center mt-4">
              Submitted on {new Date(givenReviews.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientAppointmentDetails;