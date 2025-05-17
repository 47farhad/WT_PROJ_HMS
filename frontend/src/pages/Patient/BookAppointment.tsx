import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppointmentStore } from "../../store/useAppointmentStore";

function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { getDoctor, appointmentDoctor, createAppointment } = useAppointmentStore();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [description, setDescription] = useState("");

  const availableTimeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
  ];

  useEffect(() => {
    getDoctor(doctorId);
  }, [getDoctor, doctorId]);

  const handleBookNow = async () => {
    if (!selectedDate || !selectedTime || !description) {
      alert("Please fill all fields before booking.");
      return;
    }

    const localDateTimeString = `${selectedDate} ${selectedTime}`;
    const localDate = new Date(localDateTimeString);

    const combinedDateTime = localDate.toISOString();

    const appointmentData = {
      doctorId,
      datetime: combinedDateTime,
      description,
    };

    await createAppointment(appointmentData);
    navigate('/Dashboard');
  };

  if (!appointmentDoctor) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#243954]"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100"style={{ zoom: "120%" }}>
      {/* Main Container */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full z-10 mx-6 flex overflow-hidden">
        {/* Left Side - Doctor Details */}
        <div className="w-2/5 bg-gray-50 p-6 flex flex-col">
          {/* Doctor Profile */}
          <div className="flex items-center mb-8">
            <img 
              src={appointmentDoctor.profilePic || "/default-doctor.png"} 
              alt="Doctor" 
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div className="ml-4">
              <h2 className="text-xl font-bold text-[#243954]">
                Dr. {appointmentDoctor.firstName} {appointmentDoctor.lastName}
              </h2>
              <p className="text-[#4b5563] text-sm font-medium">{appointmentDoctor.specialization}</p>
              <div className="flex items-center mt-1">
                <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm text-gray-600">4.8 (120 reviews)</span>
              </div>
            </div>
          </div>

          {/* Doctor Information */}
          <div className="space-y-5 flex-grow">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-[#243954] mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#4b5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Contact Information
              </h3>
              <div className="space-y-3">
                <p className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {appointmentDoctor.email}
                </p>
                <p className="flex items-center text-sm text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {appointmentDoctor.contact || "Not provided"}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-[#243954] mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#4b5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Professional Details
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-600">Specialization:</span> {appointmentDoctor.specialization}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-600">Experience:</span> {appointmentDoctor.experience || "Not specified"} years
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-600">Qualification:</span> {appointmentDoctor.qualification}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-semibold text-[#243954] mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#4b5563]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Availability
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-600">Working Days:</span> Monday - Friday
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-600">Hours:</span> 9:00 AM - 5:00 PM
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-600">Consultation:</span> 30 mins per patient
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Appointment Form */}
        <div className="w-3/5 p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-[#243954] mb-2">
            Book Appointment
          </h2>
          {/* Date Picker */}
          <div className="pt-15 mb-5">
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Appointment Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="date"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] focus:border-[#243954] outline-none transition"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]} 
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              
            </div>
          </div>

          {/* Time Slots */}
          <div className="mb-5">
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Time Slot
            </label>
            <div className="relative">
              <select
                id="time"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] focus:border-[#243954] outline-none appearance-none transition"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              >
                <option value="">Select a time slot</option>
                {availableTimeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Reason for Visit
            </label>
            <textarea
              id="description"
              rows="4"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] focus:border-[#243954] outline-none transition"
              placeholder="Describe your symptoms or reason for appointment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-auto">
            <button
              onClick={() => navigate("/Dashboard")}
              className="w-1/2 bg-[#e0f2fe] text-[#243954] px-4 py-3 rounded-lg hover:bg-sky-200 transition border border-sky-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleBookNow}
              className="w-1/2 bg-[#243954] text-white px-4 py-3 rounded-lg hover:bg-[#1e2e4a] transition font-medium shadow-md"
            >
              Confirm Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;