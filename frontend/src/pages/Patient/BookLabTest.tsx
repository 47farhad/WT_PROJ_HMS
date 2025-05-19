import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePatientLabTestStore } from "../../store/usePatientLabTestStore";

// Define interfaces for our types
interface LabTest {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  requirements?: string[];
  status?: string;
  [key: string]: any;
}

interface LabTestBookingData {
  offeredTestId: string;
  datetime: string;
}

interface PatientLabTestStore {
  getLabTestDetails: (id: string) => Promise<void>;
  bookLabTest: (data: LabTestBookingData) => Promise<void>;
  selectedLabTest: LabTest | null;
  // Add other properties as needed
}

function BookLabTest() {
  const { labTestId } = useParams<{ labTestId: string }>();
  const navigate = useNavigate();
  const { getLabTestDetails, bookLabTest } = usePatientLabTestStore() as PatientLabTestStore;
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [labTest, setLabTest] = useState<LabTest | null>(null);

  const availableTimeSlots = [
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
  ];

  useEffect(() => {
    const fetchLabTest = async () => {
      if (!labTestId) return;
      
      // Fetch the test details based on the labTestId
      await getLabTestDetails(labTestId);  // This should set the selectedLabTest in the store

      const testDetails = usePatientLabTestStore.getState().selectedLabTest;
      if (testDetails) {
        setLabTest(testDetails);  // Set labTest state to display test name
      }
    };

    fetchLabTest();
  }, [getLabTestDetails, labTestId]);

  const handleBookNow = async () => {
    if (!selectedDate || !selectedTime || !labTestId) {
      alert("Please select both a date and time.");
      return;
    }

    // Combine the selected date and time to create the full datetime string
    const localDateTimeString = `${selectedDate} ${selectedTime}`;
    const localDate = new Date(localDateTimeString);
    const combinedDateTime = localDate.toISOString();

    const labTestData: LabTestBookingData = {
      offeredTestId: labTestId,
      datetime: combinedDateTime,
    };

    // Call the bookLabTest function
    await bookLabTest(labTestData);
    navigate('/Labtests');  // Redirect to the Payments page after booking
  };

  if (!labTest) {
    return (
      <div className="text-center p-10">
        Loading test details...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"style={{ zoom: "120%" }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #e0f2fe 0%, #f0fdfa 50%, #f5f3ff 100%)",
        }}
      ></div>

      {/* LabTest Form */}
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-lg w-full z-10">
        <h2 className="text-2xl font-bold text-[#243954] mb-6 text-center">
          Book Test ({labTest.name})  {/* Display the test name */}
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={selectedDate}
            min={new Date().toISOString().split("T")[0]} 
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={handleBookNow}
            className="w-full bg-[#243954] text-white px-4 py-2 rounded-lg hover:bg-[#4c6280] transition"
          >
            Book Now
          </button>
          <button
            onClick={() => navigate("/ViewLabTests")}
            className="w-full bg-[#e0f2fe] text-[#243954] px-4 py-2 rounded-lg hover:bg-[#cfe8f9] transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookLabTest;