import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

// Define the types for our store
interface Pagination {
  total: number;
  page: number;
  pages: number;
  hasMore: boolean;
  isPageLoading: boolean;
  currentPage: number;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePic?: string;
  medicalInfo?: {
    dateOfBirth?: Date;
    // other medical info
  };
  appointment?: string;
  reason?: string;
  doctor?: string;
}

interface WorkSchedule {
  day: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
}

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  department: string;
  profilePic?: string;
  workSchedule: WorkSchedule[];
}

interface Appointment {
  _id: string;
  datetime: Date;
  date: Date;
  startTime: string;
  endTime: string;
  doctorId: string | Doctor;
  patientId: string | Patient;
  description: string;
  reason?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show';
  paymentStatus?: 'pending' | 'completed' | 'refunded';
  paymentAmount?: number;
}

interface DoctorScheduleWithAppointments {
  doctor: Doctor;
  appointments: Appointment[];
}

interface AdminStore {
  // Patients section
  patients: {
    data: Patient[];
    pagination: Pagination;
  };
  isPatientsLoading: boolean;
  getPatients: (page?: number) => Promise<void>;

  // Appointments section
  appointments: {
    data: Appointment[];
    pagination: Pagination;
  };
  isAppointmentsLoading: boolean;
  getAppointments: (page?: number, filters?: any) => Promise<void>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<void>;

  // Doctors schedules section
  doctorSchedules: {
    data: DoctorScheduleWithAppointments[];
    startDate: Date | null;
    endDate: Date | null;
  };
  isDoctorSchedulesLoading: boolean;
  getDoctorSchedules: (startDate: Date, endDate: Date) => Promise<void>;
  updateDoctorSchedule: (doctorId: string, workSchedule: WorkSchedule[]) => Promise<void>;
}

// Create the store
export const useAdminStore = create<AdminStore>((set, get) => ({
  // Patients section (you already have this)
  patients: {
    data: [],
    pagination: {
      total: 0,
      page: 1,
      pages: 0,
      hasMore: false,
      isPageLoading: false,
      currentPage: 1
    }
  },
  isPatientsLoading: false,
  getPatients: async (page = 1) => {
    try {
      set((state) => ({
        isPatientsLoading: page === 1,
        patients: {
          ...state.patients,
          pagination: {
            ...state.patients.pagination,
            isPageLoading: true
          }
        }
      }));

      const response = await axios.get(`/api/admin/patients?page=${page}`);

      set((state) => ({
        patients: {
          data: page === 1 ? response.data.data : [...state.patients.data, ...response.data.data],
          pagination: response.data.pagination
        },
        isPatientsLoading: false
      }));
    } catch (error) {
      set({ isPatientsLoading: false });
      toast.error("Failed to load patients");
      console.error("Error loading patients:", error);
    }
  },

  // Appointments section
  appointments: {
    data: [],
    pagination: {
      total: 0,
      page: 1,
      pages: 0,
      hasMore: false,
      isPageLoading: false,
      currentPage: 1
    }
  },
  isAppointmentsLoading: false,
  getAppointments: async (page = 1, filters = {}) => {
    try {
      set((state) => ({
        isAppointmentsLoading: page === 1,
        appointments: {
          ...state.appointments,
          pagination: {
            ...state.appointments.pagination,
            isPageLoading: true
          }
        }
      }));

      // Build query string from filters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      
      // Add any filters to the query
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await axios.get(`/api/admin/appointments?${queryParams.toString()}`);

      set((state) => ({
        appointments: {
          data: page === 1 ? response.data.data : [...state.appointments.data, ...response.data.data],
          pagination: response.data.pagination
        },
        isAppointmentsLoading: false
      }));
    } catch (error) {
      set({ isAppointmentsLoading: false });
      toast.error("Failed to load appointments");
      console.error("Error loading appointments:", error);
    }
  },
  updateAppointment: async (id, data) => {
    try {
      const response = await axios.put(`/api/admin/appointments/${id}`, data);
      
      // Update the appointment in the local state
      set((state) => ({
        appointments: {
          ...state.appointments,
          data: state.appointments.data.map(appointment => 
            appointment._id === id ? { ...appointment, ...response.data.data } : appointment
          )
        }
      }));

      toast.success("Appointment updated successfully");
      return response.data.data;
    } catch (error) {
      toast.error("Failed to update appointment");
      console.error("Error updating appointment:", error);
      throw error;
    }
  },

  // Doctors schedules section
  doctorSchedules: {
    data: [],
    startDate: null,
    endDate: null
  },
  isDoctorSchedulesLoading: false,
  getDoctorSchedules: async (startDate, endDate) => {
    try {
      set({ isDoctorSchedulesLoading: true });

      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      const response = await axios.get(
        `/api/admin/doctors/schedules?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );

      set({
        doctorSchedules: {
          data: response.data.data,
          startDate,
          endDate
        },
        isDoctorSchedulesLoading: false
      });
    } catch (error) {
      set({ isDoctorSchedulesLoading: false });
      toast.error("Failed to load doctor schedules");
      console.error("Error loading doctor schedules:", error);
    }
  },
  updateDoctorSchedule: async (doctorId, workSchedule) => {
    try {
      const response = await axios.put(`/api/admin/doctors/${doctorId}/schedule`, { workSchedule });
      
      // Update the doctor's schedule in the local state
      set((state) => ({
        doctorSchedules: {
          ...state.doctorSchedules,
          data: state.doctorSchedules.data.map(item => 
            item.doctor._id === doctorId 
              ? { 
                  ...item, 
                  doctor: { 
                    ...item.doctor, 
                    workSchedule: response.data.data.doctorInfo.workSchedule 
                  } 
                } 
              : item
          )
        }
      }));

      toast.success("Doctor schedule updated successfully");
      return response.data.data;
    } catch (error) {
      toast.error("Failed to update doctor schedule");
      console.error("Error updating doctor schedule:", error);
      throw error;
    }
  }
}));