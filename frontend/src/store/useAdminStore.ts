import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
import { axiosInstance } from "../lib/axios";

// Define the types for our store
interface Pagination {
  total?: number;
  page?: number;
  pages?: number;
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
  patient: Patient | null;
  isPatientsLoading: boolean;
  isPatientLoading: boolean;
  isConvertingPatient: boolean;
  getPatients: (page?: number, limit?: number) => Promise<void>;
  getPatientDetails: (patientId: string) => Promise<void>;
  convertToDoctor: (patientId: string) => Promise<void>;
  convertToAdmin: (patientId: string) => Promise<void>;

  // Appointments section
  appointments: {
    data: Appointment[];
    pagination: Pagination;
  };
  isAppointmentsLoading: boolean;
  getAppointments: (page?: number, filters?: Record<string, any>) => Promise<void>;
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

// Create the store with proper type
export const useAdminStore = create<AdminStore>((set, get) => ({
  // Patients section
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
  patient: null,
  isPatientsLoading: false,
  isPatientLoading: false,
  isConvertingPatient: false,
  
  getPatients: async (page = 1, limit = 20) => {
    const isInitialLoad = page === 1;
    
    if (isInitialLoad) {
      set({ isPatientsLoading: true });
    } else {
      set((state: AdminStore) => ({
        patients: {
          ...state.patients,
          pagination: {
            ...state.patients.pagination,
            isPageLoading: true
          }
        }
      }));
    }
    
    try {
      const res = await axiosInstance.get(`/admin/getPatients?page=${page}&limit=${limit}`);
      
      set((state: AdminStore) => ({
        patients: {
          data: isInitialLoad
            ? res.data.patients
            : [...state.patients.data, ...res.data.patients],
          pagination: {
            currentPage: res.data.pagination.currentPage,
            hasMore: res.data.pagination?.hasMore || false,
            isPageLoading: false,
            total: res.data.pagination?.total || 0,
            page: res.data.pagination?.page || page,
            pages: res.data.pagination?.pages || 0
          }
        },
        isPatientsLoading: false
      }));
    } catch (error: any) {
      set({
        isPatientsLoading: false,
        patients: {
          ...get().patients,
          pagination: {
            ...get().patients.pagination,
            isPageLoading: false
          }
        }
      });
      toast.error(error.response?.data?.message || "Failed to fetch patients");
    }
  },
  
  getPatientDetails: async (patientId: string) => {
    try {
      set({ isPatientLoading: true });
      const res = await axiosInstance.get(`/admin/getPatientDetails/${patientId}`);
      
      set({ patient: res.data, isPatientLoading: false });
    } catch (error: any) {
      set({ isPatientLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch patient data");
    }
  },
  
  convertToDoctor: async (patientId: string) => {
    try {
      set({ isConvertingPatient: true });
      await axiosInstance.patch(`/admin/convertPatientToDoctor/${patientId}`);
      toast.success("User converted to doctor successfully!");
      set({ isConvertingPatient: false });
    } catch (error: any) {
      set({ isConvertingPatient: false });
      toast.error(error.response?.data?.message || "Failed to convert account");
    }
  },
  
  convertToAdmin: async (patientId: string) => {
    try {
      set({ isConvertingPatient: true });
      await axiosInstance.patch(`/admin/convertPatientToAdmin/${patientId}`);
      toast.success("User converted to admin successfully!");
      set({ isConvertingPatient: false });
    } catch (error: any) {
      set({ isConvertingPatient: false });
      toast.error(error.response?.data?.message || "Failed to convert account");
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
      set((state: AdminStore) => ({
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

      const response = await axios.get(`/admin/appointments?${queryParams.toString()}`);

      set((state: AdminStore) => ({
        appointments: {
          data: page === 1 ? response.data.data : [...state.appointments.data, ...response.data.data],
          pagination: response.data.pagination
        },
        isAppointmentsLoading: false
      }));
    } catch (error: any) {
      set({ isAppointmentsLoading: false });
      toast.error("Failed to load appointments");
      console.error("Error loading appointments:", error);
    }
  },
  
  updateAppointment: async (id, data) => {
    try {
      const response = await axios.put(`/admin/appointments/${id}`, data);
      
      // Update the appointment in the local state
      set((state: AdminStore) => ({
        appointments: {
          ...state.appointments,
          data: state.appointments.data.map(appointment => 
            appointment._id === id ? { ...appointment, ...response.data.data } : appointment
          )
        }
      }));

      toast.success("Appointment updated successfully");
      return response.data.data;
    } catch (error: any) {
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
        `/admin/doctors/schedules?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );

      set({
        doctorSchedules: {
          data: response.data.data,
          startDate,
          endDate
        },
        isDoctorSchedulesLoading: false
      });
    } catch (error: any) {
      set({ isDoctorSchedulesLoading: false });
      toast.error("Failed to load doctor schedules");
      console.error("Error loading doctor schedules:", error);
    }
  },
  
  updateDoctorSchedule: async (doctorId, workSchedule) => {
    try {
      const response = await axios.put(`/admin/doctors/${doctorId}/schedule`, { workSchedule });
      
      // Update the doctor's schedule in the local state
      set((state: AdminStore) => ({
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
    } catch (error: any) {
      toast.error("Failed to update doctor schedule");
      console.error("Error updating doctor schedule:", error);
      throw error;
    }
  }
}));