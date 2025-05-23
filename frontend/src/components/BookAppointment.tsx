import { useState, FC } from "react";

interface AppointmentData {
  doctorName: string;
  date: string;
  time: string;
  description: string;
  status: string;
}

interface BookAppointmentProps {
  doctorName: string;
  onBookAppointment: (data: AppointmentData) => void;
  onCancel: () => void;
}

const BookAppointment: FC<BookAppointmentProps> = ({
  doctorName,
  onBookAppointment,
  onCancel,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const availableTimeSlots: string[] = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  ];

  const handleBookNow = () => {
    if (!selectedDate || !selectedTime || !description) {
      alert("Please fill all fields before booking.");
      return;
    }

    const appointmentData: AppointmentData = {
      doctorName,
      date: selectedDate,
      time: selectedTime,
      description,
      status: "Pending",
    };
    onBookAppointment(appointmentData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 50%, #f5f3ff 100%)",
        }}
      ></div>

      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-lg w-full z-10">
        <h2 className="text-2xl font-bold text-[#243954] mb-6 text-center">
          Book Appointment with <span className="text-[#243954]">{doctorName}</span>
        </h2>

        <div className="mb-6">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
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

        <div className="mb-6">
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
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

        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#243954] outline-none"
            placeholder="Enter a brief description of your appointment"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleBookNow}
            className="w-full bg-[#243954] text-white px-4 py-2 rounded-lg hover:bg-[#4c6280] transition"
          >
            Book Now
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-[#e0f2fe] text-[#243954] px-4 py-2 rounded-lg hover:bg-[#cfe8f9] transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
