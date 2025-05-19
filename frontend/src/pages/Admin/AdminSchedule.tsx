import React, { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays, addWeeks, subWeeks } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useScheduleStore, Doctor, WorkScheduleItem, CalendarEvent } from "../../store/useAdminScheduleStore";
// Date-fns localizer for the calendar
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom event component for rendering appointments with enhanced visibility
const EventComponent = ({ event }: { event: CalendarEvent }) => {
  // Set background color based on status
  let bgColor = "";
  let textColor = "text-white";
  
  if (event.resource.type === "workingHours") {
    bgColor = "bg-gray-100";
    textColor = "text-gray-700";
  } else {
    switch (event.status) {
      case "confirmed":
        bgColor = "bg-blue-500";
        break;
      case "completed":
        bgColor = "bg-green-500";
        break;
      case "cancelled":
        bgColor = "bg-red-500";
        break;
      case "pending":
      default:
        bgColor = "bg-yellow-500";
        break;
    }
  }

  return (
    <div className={`flex flex-col p-1 overflow-hidden h-full ${bgColor} ${textColor} rounded`}>
      <div className="font-semibold truncate text-sm">{event.title}</div>
      {event.patientName && (
        <div className="text-xs truncate">{event.patientName}</div>
      )}
      {event.status && (
        <div className="text-xs font-medium truncate capitalize">
          {event.status}
        </div>
      )}
    </div>
  );
};

function AdminSchedule() {
  const { 
    doctors, 
    appointments, 
    isLoading, 
    error, 
    calendarEvents, 
    fetchDoctors, 
    fetchAppointments, 
    updateAppointment, 
    updateDoctorSchedule, 
    generateCalendarEvents 
  } = useScheduleStore();

  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">(Views.WEEK);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [visibleDates, setVisibleDates] = useState({
    start: subWeeks(new Date(), 1),
    end: addWeeks(new Date(), 1),
  });
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState<boolean>(false);
  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState<boolean>(false);
  
  // Fetch initial data
  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, [fetchDoctors, fetchAppointments]);

  // Calculate the visible date range based on current view
  useEffect(() => {
    let start: Date, end: Date;
    const today = currentDate;

    switch (calendarView) {
      case Views.DAY:
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case Views.WEEK:
        const weekStart = startOfWeek(today, { weekStartsOn: 0 });
        start = weekStart;
        end = addDays(weekStart, 6);
        break;
      case Views.MONTH:
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      default:
        start = subWeeks(today, 1);
        end = addWeeks(today, 1);
    }

    setVisibleDates({ start, end });
  }, [currentDate, calendarView]);

  // Generate calendar events when relevant state changes
  useEffect(() => {
    if (doctors.length && appointments.length) {
      generateCalendarEvents(selectedDoctor, visibleDates.start, visibleDates.end);
    }
  }, [doctors, appointments, selectedDoctor, visibleDates, generateCalendarEvents]);

  // Handle calendar navigation
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  // Handle view change
  const handleViewChange = useCallback((newView: View) => {
    setCalendarView(newView as "day" | "week" | "month");
  }, []);

  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (event.resource.type === "appointment") {
      setSelectedEvent(event);
      setIsAppointmentModalOpen(true);
    }
  }, []);

  // Handle appointment update
  const handleUpdateAppointment = async (appointmentId: string, updates: any) => {
    try {
      await updateAppointment(appointmentId, {
        description: updates.description,
        status: updates.status
      });
      
      setIsAppointmentModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  // Handle doctor schedule updates
  const handleUpdateDoctorSchedule = async (doctorId: string, workSchedule: WorkScheduleItem[]) => {
    try {
      await updateDoctorSchedule(doctorId, workSchedule);
      setIsScheduleEditorOpen(false);
    } catch (error) {
      console.error("Error updating doctor schedule:", error);
    }
  };

  // Event style customization
  const eventPropGetter = (event: CalendarEvent) => {
    let style: React.CSSProperties = {};
    
    if (event.resource.type === "workingHours") {
      style = {
        backgroundColor: "#F3F4F6", // Light gray for working hours
        borderColor: "#E5E7EB",
        color: "#374151",
        opacity: 0.5
      };
    } else {
      // Appointment styling based on status
      switch (event.status) {
        case "confirmed":
          style = {
            backgroundColor: "#3B82F6", // Blue
            borderColor: "#2563EB"
          };
          break;
        case "completed":
          style = {
            backgroundColor: "#10B981", // Green
            borderColor: "#059669"
          };
          break;
        case "cancelled":
          style = {
            backgroundColor: "#EF4444", // Red
            borderColor: "#DC2626"
          };
          break;
        case "pending":
        default:
          style = {
            backgroundColor: "#F59E0B", // Yellow
            borderColor: "#D97706"
          };
          break;
      }
    }
    
    return { style };
  };

  // Day cell styling
  const dayPropGetter = (date: Date) => {
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();
    
    return {
      className: isToday ? "rbc-today bg-blue-50" : ""
    };
  };

  return (
    <div className="flex flex-col h-[calc(100vh-88px)] mx-5">
      {/* Header with controls */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-[#243954]">Appointments Calendar</h2>
        
        <div className="flex items-center gap-4">
          {/* Doctor selector */}
          <div className="flex items-center">
            <label htmlFor="doctor-select" className="mr-2 text-sm font-medium">
              Doctor:
            </label>
            <select
              id="doctor-select"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#243954]"
            >
              <option value="all">All Doctors</option>
              {doctors.map((doctor: Doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.firstName} {doctor.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Edit Schedule button */}
          <button
            onClick={() => setIsScheduleEditorOpen(true)}
            className="px-4 py-1.5 bg-[#243954] text-white rounded-md text-sm hover:bg-[#1A2A40] transition-colors"
          >
            Edit Schedules
          </button>
        </div>
      </div>

      {/* Navigation buttons and date display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate(new Date())}
            className="px-4 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => handleNavigate(subWeeks(currentDate, 1))}
            className="px-4 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => handleNavigate(addWeeks(currentDate, 1))}
            className="px-4 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>

        {/* Current date range display */}
        <div className="text-lg font-medium">
          {format(visibleDates.start, "MMM d")} – {format(visibleDates.end, "d, yyyy")}
        </div>

        {/* View selector */}
        <div className="flex rounded-md overflow-hidden">
          <button
            onClick={() => handleViewChange(Views.DAY)}
            className={`px-4 py-1.5 text-sm ${
              calendarView === Views.DAY
                ? "bg-[#243954] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Day
          </button>
          <button
            onClick={() => handleViewChange(Views.WEEK)}
            className={`px-4 py-1.5 text-sm ${
              calendarView === Views.WEEK
                ? "bg-[#243954] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => handleViewChange(Views.MONTH)}
            className={`px-4 py-1.5 text-sm ${
              calendarView === Views.MONTH
                ? "bg-[#243954] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading schedules...</div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      )}

      {/* Calendar */}
      {!isLoading && !error && (
        <div className="flex-grow overflow-hidden bg-white rounded-lg shadow-md">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            views={[Views.DAY, Views.WEEK, Views.MONTH]}
            view={calendarView}
            onView={handleViewChange}
            date={currentDate}
            onNavigate={handleNavigate}
            selectable={true}
            onSelectEvent={handleSelectEvent}
            dayPropGetter={dayPropGetter}
            eventPropGetter={eventPropGetter}
            components={{
              event: EventComponent as any
            }}
            className="h-full"
          />
        </div>
      )}

      {/* Appointment Details Modal */}
      {isAppointmentModalOpen && selectedEvent && (
        <AppointmentDetailsModal
          event={selectedEvent}
          onClose={() => {
            setIsAppointmentModalOpen(false);
            setSelectedEvent(null);
          }}
          onUpdate={handleUpdateAppointment}
        />
      )}

      {/* Schedule Editor Modal */}
      {isScheduleEditorOpen && (
        <ScheduleEditorModal
          doctors={doctors}
          onClose={() => setIsScheduleEditorOpen(false)}
          onUpdate={handleUpdateDoctorSchedule}
        />
      )}

      {/* Legend for color coding */}
      <div className="mt-4 bg-white p-3 rounded-lg shadow-sm flex flex-wrap gap-4">
        <div className="text-sm font-medium">Status Legend:</div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
          <span className="text-sm">Pending</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm">Confirmed</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm">Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
          <span className="text-sm">Cancelled</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-gray-300 mr-2"></div>
          <span className="text-sm">Working Hours</span>
        </div>
      </div>
    </div>
  );
}

// Appointment Details Modal Component with scrollability
function AppointmentDetailsModal({ 
  event, 
  onClose, 
  onUpdate 
}: { 
  event: CalendarEvent; 
  onClose: () => void; 
  onUpdate: (appointmentId: string, updates: any) => void; 
}) {
  const [status, setStatus] = useState(event.status || "pending");
  const [description, setDescription] = useState(event.title || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event.resource.appointmentId) return;
    
    onUpdate(event.resource.appointmentId, {
      status,
      description
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#243954] text-white py-3 px-6 rounded-t-lg">
          <h3 className="text-xl font-bold">Appointment Details</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Patient</label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              {event.patientName || "Not specified"}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Doctor</label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              {event.resource.doctorName || "Not specified"}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Date</label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              {format(event.start, "PPPP")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {format(event.start, "h:mm a")}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Time</label>
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                {format(event.end, "h:mm a")}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
              rows={3}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 sticky bottom-0 pt-3 bg-white border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#243954] text-white rounded-md hover:bg-[#1A2A40] transition-colors"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Schedule Editor Modal Component with scrollability
function ScheduleEditorModal({
  doctors,
  onClose,
  onUpdate
}: {
  doctors: Doctor[];
  onClose: () => void;
  onUpdate: (doctorId: string, workSchedule: WorkScheduleItem[]) => void;
}) {
  const [selectedDoctor, setSelectedDoctor] = useState<string>(doctors[0]?._id || "");
  const [workSchedule, setWorkSchedule] = useState<WorkScheduleItem[]>([]);

  // Initialize workSchedule when doctor selection changes
  useEffect(() => {
    if (!selectedDoctor) return;
    
    const doctor = doctors.find(d => d._id === selectedDoctor);
    if (!doctor) return;

    // Initialize with provided work schedule or create default schedule
    const schedule = doctor.doctorInfo?.workSchedule || [];
    
    // Ensure all days of the week are included
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const newSchedule = daysOfWeek.map(day => {
      const existingDay = schedule.find(s => s.day === day);
      return existingDay || {
        day,
        isWorking: day !== "Saturday" && day !== "Sunday", // Default: weekdays are working days
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 30
      };
    });
    
    setWorkSchedule(newSchedule);
  }, [selectedDoctor, doctors]);

  // Handle schedule changes
  const handleScheduleChange = (index: number, field: string, value: any) => {
    const updatedSchedule = [...workSchedule];
    
    if (field === "isWorking") {
      updatedSchedule[index].isWorking = !updatedSchedule[index].isWorking;
    } else {
      (updatedSchedule[index] as any)[field] = value;
    }
    
    setWorkSchedule(updatedSchedule);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    onUpdate(selectedDoctor, workSchedule);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#243954] text-white py-3 px-6 rounded-t-lg">
          <h3 className="text-xl font-bold">Edit Doctor Schedule</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="doctor-select" className="block text-sm font-medium mb-2">
              Select Doctor
            </label>
            <select
              id="doctor-select"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
            >
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.firstName} {doctor.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <h4 className="text-md font-medium mb-3">Weekly Schedule</h4>
            
            <div className="space-y-4">
              {workSchedule.map((schedule, index) => (
                <div key={schedule.day} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`working-${schedule.day}`}
                        checked={schedule.isWorking}
                        onChange={() => handleScheduleChange(index, "isWorking", null)}
                        className="mr-2 h-4 w-4 text-[#243954] focus:ring-[#243954] border-gray-300 rounded"
                      />
                      <label htmlFor={`working-${schedule.day}`} className="font-medium">
                        {schedule.day}
                      </label>
                    </div>
                  </div>
                  
                  {schedule.isWorking && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor={`start-${schedule.day}`} className="block text-sm mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          id={`start-${schedule.day}`}
                          value={schedule.startTime}
                          onChange={(e) => handleScheduleChange(index, "startTime", e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#243954]"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`end-${schedule.day}`} className="block text-sm mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          id={`end-${schedule.day}`}
                          value={schedule.endTime}
                          onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#243954]"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`slot-${schedule.day}`} className="block text-sm mb-1">
                          Slot Duration (mins)
                        </label>
                        <select
                          id={`slot-${schedule.day}`}
                          value={schedule.slotDuration}
                          onChange={(e) => handleScheduleChange(index, "slotDuration", parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#243954]"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={45}>45 minutes</option>
                          <option value={60}>60 minutes</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 sticky bottom-0 pt-3 bg-white border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#243954] text-white rounded-md hover:bg-[#1A2A40] transition-colors"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminSchedule;