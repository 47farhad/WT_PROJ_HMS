import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { format } from "date-fns";

// Types based on your existing schemas
export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  doctorInfo?: {
    specialization?: string;
    department?: string;
    workSchedule?: WorkScheduleItem[];
    isAvailable?: boolean;
  };
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

export interface Appointment {
  _id: string;
  datetime: string | Date;
  description: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  doctorId: string | Doctor;
  patientId: string | Patient;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
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

interface ScheduleState {
  doctors: Doctor[];
  appointments: Appointment[];
  calendarEvents: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDoctors: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  updateAppointment: (appointmentId: string, updates: Partial<Appointment>) => Promise<void>;
  updateDoctorSchedule: (doctorId: string, workSchedule: WorkScheduleItem[]) => Promise<void>;
  generateCalendarEvents: (selectedDoctor: string, visibleStartDate: Date, visibleEndDate: Date) => void;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  doctors: [],
  appointments: [],
  calendarEvents: [],
  isLoading: false,
  error: null,
  
  fetchDoctors: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Use the admin schedule route to get doctors with schedules
      const response = await axios.get("http://localhost:5001/api/admin/schedule/doctors", {
        withCredentials: true
      });
      
      if (!response.data || !response.data.success) {
        set({ 
          isLoading: false,
          error: 'No data received from API'
        });
        toast.error('No data received from API');
        return;
      }
      
      // Update state with doctors data
      set({ 
        doctors: response.data.data, 
        isLoading: false 
      });
    } catch (error: any) {
      console.error("Error fetching doctors:", error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch doctors', 
        isLoading: false 
      });
      toast.error('Failed to fetch doctors data');
    }
  },
  
  fetchAppointments: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Use the admin schedule route to get appointments
      const response = await axios.get("http://localhost:5001/api/admin/schedule/appointments", {
        withCredentials: true
      });
      
      if (!response.data || !response.data.success) {
        set({ 
          isLoading: false,
          error: 'No appointment data received from API'
        });
        toast.error('No appointment data received from API');
        return;
      }
      
      // Update state with appointments data
      set({ 
        appointments: response.data.data, 
        isLoading: false 
      });
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch appointments', 
        isLoading: false 
      });
      toast.error('Failed to fetch appointments data');
    }
  },
  
  updateAppointment: async (appointmentId, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      // Use the admin schedule route to update appointment
      const response = await axios.put(`http://localhost:5001/api/admin/schedule/appointments/${appointmentId}`, updates, {
        withCredentials: true
      });
      
      if (!response.data || !response.data.success) {
        set({ isLoading: false });
        toast.error('Failed to update appointment');
        return;
      }
      
      // Update local state
      set(state => ({
        appointments: state.appointments.map(appointment => 
          appointment._id === appointmentId 
            ? { ...appointment, ...updates, updatedAt: new Date().toISOString() } 
            : appointment
        ),
        isLoading: false
      }));
      
      toast.success(`Appointment updated successfully`);
      
      // Refresh calendar events
      const { selectedDoctor, visibleDates } = get() as any;
      if (selectedDoctor && visibleDates) {
        get().generateCalendarEvents(selectedDoctor, visibleDates.start, visibleDates.end);
      }
    } catch (error: any) {
      console.error("Error updating appointment:", error);
      set({ 
        error: error.response?.data?.message || 'Failed to update appointment', 
        isLoading: false 
      });
      toast.error('Failed to update appointment');
    }
  },
  
  updateDoctorSchedule: async (doctorId, workSchedule) => {
    try {
      set({ isLoading: true, error: null });
      
      // Use the admin schedule route to update doctor work schedule
      const response = await axios.put(`http://localhost:5001/api/admin/schedule/doctors/${doctorId}/workschedule`, { 
        workSchedule 
      }, {
        withCredentials: true
      });
      
      if (!response.data || !response.data.success) {
        set({ isLoading: false });
        toast.error('Failed to update doctor schedule');
        return;
      }
      
      // Update local state
      set(state => ({
        doctors: state.doctors.map(doctor => 
          doctor._id === doctorId 
            ? { 
                ...doctor, 
                doctorInfo: { 
                  ...doctor.doctorInfo, 
                  workSchedule 
                } 
              } 
            : doctor
        ),
        isLoading: false
      }));
      
      toast.success(`Doctor schedule updated successfully`);
      
      // Refresh calendar events
      const { selectedDoctor, visibleDates } = get() as any;
      if (selectedDoctor && visibleDates) {
        get().generateCalendarEvents(selectedDoctor, visibleDates.start, visibleDates.end);
      }
    } catch (error: any) {
      console.error("Error updating doctor schedule:", error);
      set({ 
        error: error.response?.data?.message || 'Failed to update doctor schedule', 
        isLoading: false 
      });
      toast.error('Failed to update doctor schedule');
    }
  },
  
  generateCalendarEvents: (selectedDoctor, visibleStartDate, visibleEndDate) => {
    const { doctors, appointments } = get();
    const calendarEvents: CalendarEvent[] = [];
    
    // Get only the selected doctor or all doctors
    const filteredDoctors = selectedDoctor === "all" 
      ? doctors 
      : doctors.filter(doctor => doctor._id === selectedDoctor);
    
    // Process working hours for each doctor
    filteredDoctors.forEach(doctor => {
      const workSchedule = doctor.doctorInfo?.workSchedule || [];
      
      workSchedule.forEach(schedule => {
        if (!schedule.isWorking) return;
        
        // Get day of week index (0-6)
        const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
          .indexOf(schedule.day);
        
        if (dayIndex === -1) return;
        
        // Get all dates that match this day in the visible range
        let currentDate = new Date(visibleStartDate);
        
        // Iterate through visible date range
        while (currentDate <= visibleEndDate) {
          if (currentDate.getDay() === dayIndex) {
            // Create event for this doctor's schedule on this day
            const [startHour, startMinute] = schedule.startTime.split(":").map(Number);
            const [endHour, endMinute] = schedule.endTime.split(":").map(Number);
            
            const start = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              startHour || 0,
              startMinute || 0
            );
            
            const end = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
              endHour || 0,
              endMinute || 0
            );
            
            // Only add if within visible range
            if (start <= visibleEndDate && end >= visibleStartDate) {
              calendarEvents.push({
                id: `schedule-${doctor._id}-${schedule.day}-${format(currentDate, 'yyyy-MM-dd')}`,
                title: `Dr. ${doctor.firstName} ${doctor.lastName} Working Hours`,
                start,
                end,
                allDay: false,
                resource: {
                  doctorId: doctor._id,
                  doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
                  type: "workingHours",
                },
              });
            }
          }
          
          // Move to next day
          currentDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() + 1
          );
        }
      });
    });
    
    // Add appointments to calendar events
    appointments.forEach(appointment => {
      // Skip appointments not in the filtered doctors list
      const appointmentDoctorId = typeof appointment.doctorId === 'object' 
        ? appointment.doctorId._id 
        : appointment.doctorId;
        
      if (selectedDoctor !== "all" && appointmentDoctorId !== selectedDoctor) {
        return;
      }
      
      // Get doctor info
      const doctor = doctors.find(d => d._id === appointmentDoctorId);
      if (!doctor) return;
      
      // Get patient info
      const patient = typeof appointment.patientId === 'object' 
        ? appointment.patientId 
        : { firstName: "Unknown", lastName: "Patient", _id: appointment.patientId };
      
      // Parse appointment datetime
      const apptDateTime = typeof appointment.datetime === 'string'
        ? new Date(appointment.datetime)
        : new Date(appointment.datetime);
        
      // Calculate end time (using default 30 min duration if not specified)
      const start = new Date(apptDateTime);
      const end = new Date(apptDateTime);
      
      // Default 30 min appointment duration
      end.setMinutes(end.getMinutes() + 30);
      
      // Skip if not in visible range
      if (start > visibleEndDate || end < visibleStartDate) {
        return;
      }
      
      calendarEvents.push({
        id: appointment._id,
        title: appointment.description,
        start,
        end,
        allDay: false,
        patientName: `${patient.firstName} ${patient.lastName}`,
        status: appointment.status,
        resource: {
          appointmentId: appointment._id,
          doctorId: appointmentDoctorId,
          doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
          patientId: typeof patient === 'string' ? patient : patient._id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          type: "appointment",
        },
      });
    });
    
    set({ calendarEvents });
  }
}));