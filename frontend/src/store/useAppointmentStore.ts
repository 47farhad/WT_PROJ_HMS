import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

// Define interfaces for our types
interface Pagination {
  currentPage: number;
  hasMore: boolean;
  isPageLoading: boolean;
  totalPages: number;
}

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  [key: string]: any; // Allow for additional properties
}

interface Appointment {
  _id: string;
  datetime: string | Date;
  description: string;
  doctorId: string | Doctor;
  patientId: string;
  doctorFirstName?: string;
  doctorLastName?: string;
  status?: string;
  [key: string]: any; // Allow for additional properties
}

export interface AppointmentData {
  datetime: string | Date;
  doctorId: string;
  description: string;
  reason: string;
  [key: string]: any;
}

// Define store interface
interface AppointmentStore {
  appointments: {
    data: Appointment[];
    pagination: Pagination;
  };
  doctors: Doctor[];
  appointmentDoctor: Doctor | null;
  isAppointmentLoading: boolean;
  isAppointmentsLoading: boolean;
  isAppointmentBeingCreated: boolean;
  selectedAppointment: Appointment | null;
  
  getAllAppointments: (page?: number, limit?: number) => Promise<void>;
  getAppointmentDetails: (appointmentId: string) => Promise<void>;
  createAppointment: (appointmentData: AppointmentData) => Promise<void>;
  getDoctors: () => Promise<void>;
  getDoctor: (doctorId: string) => Promise<void>;
  updateAppointment: (appointmentId: string) => Promise<void>;
}

// Create the store
export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  appointments: {
    data: [],
    pagination: {
      currentPage: 1,
      hasMore: true,
      isPageLoading: false,
      totalPages: 1
    }
  },
  doctors: [],
  appointmentDoctor: null,
  isAppointmentLoading: false,
  isAppointmentsLoading: false,
  isAppointmentBeingCreated: false,
  selectedAppointment: null,

  getAllAppointments: async (page = 1, limit = 20) => {
    const isInitialLoad = page === 1;
    if (isInitialLoad) {
      set({ isAppointmentsLoading: true });
    } else {
      set((state: AppointmentStore) => ({
        appointments: {
          ...state.appointments,
          pagination: {
            ...state.appointments.pagination,
            isPageLoading: true
          }
        }
      }));
    }
    
    try {
      const res = await axiosInstance.get(`/appointments/getAllAppointments?page=${page}&limit=${limit}`);
      
      set((state: AppointmentStore) => ({
        appointments: {
          data: isInitialLoad
            ? res.data.appointmentsData
            : [...state.appointments.data, ...res.data.appointmentsData],
          pagination: {
            currentPage: page,
            hasMore: res.data.pagination?.hasMore || false,
            isPageLoading: false,
            totalPages: res.data.pagination?.totalPages || 1
          }
        },
        isAppointmentsLoading: false
      }));
    } catch (error: any) {
      set({
        isAppointmentsLoading: false,
        appointments: {
          ...get().appointments,
          pagination: {
            ...get().appointments.pagination,
            isPageLoading: false
          }
        }
      });
      toast.error(error.response?.data?.message || "Failed to fetch appointments");
    }
  },
  
  getAppointmentDetails: async (appointmentId: string) => {
    try {
      set({ isAppointmentLoading: true });
      const res = await axiosInstance.get(`/appointments/getAppointment/${appointmentId}`);
      
      set({
        selectedAppointment: res.data.appointment,
        isAppointmentLoading: false
      });
      
      console.log(get().selectedAppointment);
    } catch (error: any) {
      set({ isAppointmentLoading: false });
      toast.error(error.response?.data?.message || "Failed to fetch appointment details");
    }
  },
  
  createAppointment: async (appointmentData: AppointmentData) => {
    try {
      set({ isAppointmentBeingCreated: true });
      
      await axiosInstance.post(`/appointments/createAppointment`, appointmentData);
      
      set({ isAppointmentBeingCreated: false });
      toast.success('Appointment created successfully');
      
      // Refresh appointments list
      get().getAllAppointments(1);
    } catch (error: any) {
      set({ isAppointmentBeingCreated: false });
      
      // Handle conflict errors (409 status)
      if (error.response?.status === 409) {
        const message = error.response.data?.message;
        
        if (message === "You have already booked this appointment") {
          toast.error("You have already booked this exact appointment.");
        } else if (message === "You already have an appointment at this time with another doctor") {
          toast.error("You already have an appointment at this time with another doctor.");
        } else if (message === "Appointment already confirmed and paid for by another user") {
          toast.error("Appointment already confirmed and paid for by another user.");
        } else {
          toast.error(message || "Appointment conflict occurred.");
        }
      } else {
        // Handle all other errors
        toast.error(error.response?.data?.message || "Failed to create appointment");
      }
    }
  },
  
  getDoctors: async () => {
    try {
      const resdoctors = await axiosInstance.get('/appointments/getDoctors');
      set({ doctors: resdoctors.data });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load doctors");
    }
  },
  
  getDoctor: async (doctorId: string) => {
    try {
      const doctor = await axiosInstance.get(`/appointments/getDoctor/${doctorId}`);
      set({ appointmentDoctor: doctor.data });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load doctor details");
    }
  },
  
  updateAppointment: async (appointmentId: string) => {
    try {
      const res = await axiosInstance.put(`/appointments/updateAppointment/${appointmentId}`, {
        status: "cancelled"
      });
      
      set((state: AppointmentStore) => ({
        appointments: {
          data: state.appointments.data.filter((appointment: Appointment) => appointment._id !== appointmentId),
          pagination: {
            ...state.appointments.pagination,
            totalPages: res.data.pagination?.totalPages || state.appointments.pagination.totalPages
          }
        },
        selectedAppointment: null
      }));
      
      toast.success(res.data.message || "Appointment cancelled successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
    }
  }
}));