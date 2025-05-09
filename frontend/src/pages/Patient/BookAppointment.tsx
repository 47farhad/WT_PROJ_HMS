import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppointmentStore } from "../../store/useAppointmentStore";


function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const {getDoctor, appointmentDoctor, createAppointment } = useAppointmentStore();
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
    getDoctor(doctorId)
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
    navigate('/Dashboard')
  };


  if (!appointmentDoctor) {
    return (
      <div>
        Loading
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 50%, #f5f3ff 100%)",
        }}
      ></div>

      {/* Appointment Form */}
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-lg w-full z-10">
        <h2 className="text-2xl font-bold text-[#243954] mb-6 text-center">
          Book Appointment with Dr.{" "}
          <span className="text-[#243954]">{(appointmentDoctor.firstName + ' ' + appointmentDoctor.lastName) || "Loading..."}</span>
        </h2>

        {/* Date Picker */}
        <div className="mb-6">
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Date
          </label>
          <input
            type="date"
            id="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* Time Slots */}
        <div className="mb-6">
          <label
            htmlFor="time"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Time Slot
          </label>
          <select
            id="time"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
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
        </div>

        {/* Description */}
        <div className="mb-6">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
            placeholder="Enter a brief description of your appointment"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4">
          {/* Book Now Button */}
          <button
            onClick={handleBookNow}
            className="w-full bg-[#243954] text-white px-4 py-2 rounded-lg hover:bg-[#4c6280] transition"
          >
            Book Now
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => {
              navigate("/Dashboard");
            }}
            className="w-full bg-[#e0f2fe] text-[#243954] px-4 py-2 rounded-lg hover:bg-[#cfe8f9] transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;