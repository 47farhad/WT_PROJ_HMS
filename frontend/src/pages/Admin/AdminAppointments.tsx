import React, { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views, View, Event as RBCEvent } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US"; 
import "react-big-calendar/lib/css/react-big-calendar.css";
import { addDays, addWeeks, subWeeks } from "date-fns";
import { useAdminStore } from "../../store/useAdminStore"; 


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
  

// Define interfaces for our data types
export interface Doctor {
    _id: string;
    name: string;
    workSchedule: WorkScheduleItem[];
  }
  
  export interface Patient {
    _id: string;
    firstName: string;
    lastName: string;
  }
  
  export interface WorkScheduleItem {
    day: string;
    isWorking: boolean;
    startTime: string;
    endTime: string;
    slotDuration: number;
  }
  
  interface Appointment {
    _id: string;
    description: string;
    datetime: Date; 
    date: Date; 
    startTime: string;
    endTime: string;
    status: "pending" | "confirmed" | "cancelled" | "completed" | "no-show";
    patientId: Patient | string;
    doctorId: Doctor | string;
    reason?: string;
    paymentStatus?: "pending" | "completed" | "refunded";
    paymentAmount?: number;
  }
  
  export interface DoctorScheduleData {
    doctor: Doctor;
    appointments: Appointment[];
  }
  
  export interface DoctorScheduleWithAppointments {
    doctor: Doctor;
    appointments: Appointment[];
  }
  
  // Custom event for react-big-calendar
  export interface CalendarEvent extends RBCEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    patientName?: string;
    status?: string;
    resource: {
      doctorId: string;
      doctorName: string;
      type: "workingHours" | "appointment";
      appointmentId?: string;
      patientId?: string;
      patientName?: string;
    };
  }
  

// Custom event component for rendering appointments
const EventComponent = ({ event }: { event: CalendarEvent }) => {
  return (
    <div className="flex flex-col p-1 overflow-hidden h-full">
      <div className="font-semibold truncate text-sm">{event.title}</div>
      <div className="text-xs truncate">{event.patientName}</div>
      <div className={`text-xs truncate ${
        event.status === 'confirmed' ? 'text-green-600' :
        event.status === 'cancelled' ? 'text-red-600' :
        event.status === 'pending' ? 'text-yellow-600' :
        event.status === 'completed' ? 'text-blue-600' : ''
      }`}>
        {event.status}
      </div>
    </div>
  );
};

function AdminAppointments() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">(Views.WEEK);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [visibleDates, setVisibleDates] = useState({
    start: subWeeks(new Date(), 1),
    end: addWeeks(new Date(), 1),
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState<boolean>(false);
  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState<boolean>(false);

  const {
    doctorSchedules,
    isDoctorSchedulesLoading,
    getDoctorSchedules,
    updateAppointment,
    updateDoctorSchedule,
  } = useAdminStore();

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

  // Fetch doctor schedules and appointments when date range changes
  useEffect(() => {
    getDoctorSchedules(visibleDates.start, visibleDates.end);
  }, [getDoctorSchedules, visibleDates]);

  // Convert doctor schedules and appointments to calendar events
  useEffect(() => {
    if (!doctorSchedules.data || !doctorSchedules.data.length) return;

    const calendarEvents: CalendarEvent[] = [];


    doctorSchedules.data.forEach((item) => {
      // Transform appointments to include datetime as a Date object
      item.appointments = item.appointments.map((appointment) => ({
        ...appointment,
        datetime: new Date(appointment.datetime),
      }));
      const { doctor, appointments } = item;
      
      // Skip this doctor if a specific doctor is selected and this isn't the one
      if (selectedDoctor !== "all" && doctor._id !== selectedDoctor) return;

      // Add working hours as background events
      doctor.workSchedule.forEach((schedule) => {
        if (!schedule.isWorking) return;

        // Get the day of week (0-6, where 0 is Sunday)
        const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(schedule.day);
        if (dayOfWeek === -1) return;

        // Calculate dates in the visible range that match this day of the week
        const dateStart = new Date(visibleDates.start);
        const dateEnd = new Date(visibleDates.end);
        const currentDay = dateStart.getDay();

        // Adjust to the next occurrence of this day of the week
        let daysDiff = (dayOfWeek - currentDay + 7) % 7;
        let currentDate = addDays(dateStart, daysDiff);

        // Add background events for each occurrence of this day in the visible range
        while (currentDate <= dateEnd) {
          const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
          const [endHour, endMinute] = schedule.endTime.split(":").map(Number);

          const start = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            startHour,
            startMinute
          );

          const end = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            endHour,
            endMinute
          );

          calendarEvents.push({
            id: `schedule-${doctor._id}-${schedule.day}-${currentDate.toISOString().split("T")[0]}`,
            title: `${doctor.name} Working Hours`,
            start,
            end,
            allDay: false,
            resource: {
              doctorId: doctor._id,
              doctorName: doctor.name,
              type: "workingHours",
            },
          });

          // Move to the next occurrence of this day of the week
          currentDate = addDays(currentDate, 7);
        }
      });

      // Add appointments as events
      appointments.forEach((appointment) => {
        const appointmentDate = new Date(appointment.datetime);
        
        // Parse start and end times
        const [startHour, startMinute] = appointment.startTime?.split(":").map(Number) || [appointmentDate.getHours(), appointmentDate.getMinutes()];
        
        // Calculate end time (if not provided, default to 30 min appointment)
        let endHour: number, endMinute: number;
        if (appointment.endTime) {
          [endHour, endMinute] = appointment.endTime.split(":").map(Number);
        } else {
          // Default to 30 min appointment
          const endTime = new Date(appointmentDate);
          endTime.setMinutes(endTime.getMinutes() + 30);
          endHour = endTime.getHours();
          endMinute = endTime.getMinutes();
        }

        const start = new Date(
          appointmentDate.getFullYear(),
          appointmentDate.getMonth(),
          appointmentDate.getDate(),
          startHour,
          startMinute
        );

        const end = new Date(
          appointmentDate.getFullYear(),
          appointmentDate.getMonth(),
          appointmentDate.getDate(),
          endHour,
          endMinute
        );

        // Get patient name
        const patient = appointment.patientId;
        const patientName = typeof patient === 'object' ? 
          `${patient.firstName} ${patient.lastName}` : 
          'Patient';

        calendarEvents.push({
          id: appointment._id,
          title: appointment.description,
          start,
          end,
          patientName,
          status: appointment.status,
          allDay: false,
          resource: {
            appointmentId: appointment._id,
            doctorId: doctor._id,
            doctorName: doctor.name,
            patientId: typeof patient === 'object' ? patient._id : patient,
            patientName,
            type: "appointment",
          },
        });
      });
    });

    setEvents(calendarEvents);
  }, [doctorSchedules.data, selectedDoctor, visibleDates]);

  // Handle calendar navigation
  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  // Handle view change
  const handleViewChange = useCallback((newView: "day" | "week" | "month") => {
    setCalendarView(newView);
  }, []);

  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (event.resource.type === "appointment") {
      setSelectedEvent(event);
      setIsAppointmentModalOpen(true);
    }
  }, []);

  // Handle event updates
  const handleUpdateAppointment = async (appointmentId: string, updates: any) => {
    try {
      await updateAppointment(appointmentId, updates);
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
              {doctorSchedules.data && doctorSchedules.data.map((item: DoctorScheduleData) => (
                <option key={item.doctor._id} value={item.doctor._id}>
                  {item.doctor.name}
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

      {/* Loading indicator */}
      {isDoctorSchedulesLoading && (
        <div className="flex-grow flex items-center justify-center">
          <div className="text-lg text-gray-600">Loading schedules...</div>
        </div>
      )}

      {/* Calendar */}
        {!isDoctorSchedulesLoading && (
        <div className="flex-grow overflow-hidden">
            {React.createElement(Calendar as any, {
            localizer: localizer,
            events: events,
            startAccessor: (event: CalendarEvent) => event.start,
            endAccessor: (event: CalendarEvent) => event.end,
            views: [Views.DAY, Views.WEEK, Views.MONTH],
            defaultView: Views.WEEK,
            view: calendarView,
            onView: handleViewChange as (view: View) => void,
            date: currentDate,
            onNavigate: handleNavigate,
            selectable: true,
            onSelectEvent: handleSelectEvent,
            dayPropGetter: (date: Date) => {
                const today = new Date();
                return {
                className: 
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
                    ? "rbc-today bg-blue-50"
                    : ""
                };
            },
            eventPropGetter: (event: CalendarEvent) => {
                const backgroundColor = 
                event.resource.type === "workingHours"
                    ? "#F3F4F6" // Light gray for working hours
                    : event.status === "confirmed"
                    ? "#10B981" // Green for confirmed
                    : event.status === "pending"
                    ? "#F59E0B" // Yellow for pending
                    : event.status === "cancelled"
                    ? "#EF4444" // Red for cancelled
                    : event.status === "completed"
                    ? "#3B82F6" // Blue for completed
                    : "#6B7280"; // Default gray
                
                return {
                style: {
                    backgroundColor,
                    borderColor: backgroundColor,
                    opacity: event.resource.type === "workingHours" ? 0.5 : 1,
                    color: event.resource.type === "workingHours" ? "#1F2937" : "white",
                }
                };
            },
            components: {
                event: EventComponent as any
            },
            className: "rounded-lg"
            })}
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
          doctors={(doctorSchedules.data || []).map((item: DoctorScheduleData) => item.doctor)}
          onClose={() => setIsScheduleEditorOpen(false)}
          onUpdate={handleUpdateDoctorSchedule}
        />
      )}
    </div>
  );
}

// Modal Props Interfaces
interface AppointmentDetailsModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onUpdate: (appointmentId: string, updates: any) => void;
}

interface ScheduleEditorModalProps {
  doctors: Doctor[];
  onClose: () => void;
  onUpdate: (doctorId: string, workSchedule: WorkScheduleItem[]) => void;
}

// AppointmentDetailsModal Component
function AppointmentDetailsModal({ event, onClose, onUpdate }: AppointmentDetailsModalProps) {
  const [status, setStatus] = useState(event.status || "pending");
  const [description, setDescription] = useState(event.title || "");
  const [startTime, setStartTime] = useState(
    format(event.start, "HH:mm") || ""
  );
  const [endTime, setEndTime] = useState(
    format(event.end, "HH:mm") || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(event.id, {
      status,
      description,
      startTime,
      endTime
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Appointment Details</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Patient</label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              {event.patientName}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Doctor</label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              {event.resource.doctorName}
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
              <label htmlFor="startTime" className="block text-sm font-medium mb-1">Start Time</label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium mb-1">End Time</label>
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
              />
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
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#243954]"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
              <option value="no-show">No Show</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
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

// ScheduleEditorModal Component
function ScheduleEditorModal({ doctors, onClose, onUpdate }: ScheduleEditorModalProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<string>(doctors[0]?._id || "");
  const [workSchedule, setWorkSchedule] = useState<WorkScheduleItem[]>([]);

  // Initialize workSchedule when doctor selection changes
  useEffect(() => {
    if (!selectedDoctor) return;
    
    const doctor = doctors.find(d => d._id === selectedDoctor);
    if (!doctor) return;

    // Initialize with provided work schedule or create default schedule
    const schedule = doctor.workSchedule || [];
    
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Edit Doctor Schedule</h3>
        
        <form onSubmit={handleSubmit}>
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
                  {doctor.name}
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

          <div className="flex justify-end gap-3">
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

export default AdminAppointments;