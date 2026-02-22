// src/store/useAdminAppointmentStore.ts
import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "axios";

// Define interface for the raw appointment data from API
interface RawAppointment {
  _id: string;
  datetime?: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  patientId?: any; // Can be string or object with firstName, lastName
  doctorId?: any; // Can be string or object with firstName, lastName
  date?: string;
  time?: string;
  reason?: string;
  patientName?: string;
  doctorName?: string;
}

// Define interface for the formatted appointment data
interface Appointment {
  _id: string;
  patientId?: string | any;
  patientName: string;
  doctorId?: string | any;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  datetime?: string;
  description?: string;
}

// Define interface for pagination
interface Pagination {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  total: number;
  isPageLoading: boolean;
}

// Define the store interface
interface AdminAppointmentStore {
  appointments: {
    data: Appointment[];
    pagination: Pagination;
  };
  isAppointmentsLoading: boolean;
  error: string | null;
  
  getAppointments: (page?: number, limit?: number) => Promise<void>;
  updateAppointment: (id: string, status: string) => Promise<void>;
}

// Create the store
export const useAdminAppointmentStore = create<AdminAppointmentStore>((set, get) => ({
  // Initial state
  appointments: {
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      hasMore: false,
      total: 0,
      isPageLoading: false
    }
  },
  isAppointmentsLoading: false,
  error: null,
  
  // Get appointments function
  getAppointments: async (page = 1, limit = 10) => {
    try {
      set({ isAppointmentsLoading: true });
      console.log('Fetching appointments data...');
      
      // Make API request with full URL
      const response = await axios.get(`/admin/appointments?page=${page}&limit=${limit}`, {
        withCredentials: true
      });
      
      console.log('Raw API response:', response);
      
      if (!response.data) {
        console.error('No data received from API');
        set({ 
          isAppointmentsLoading: false,
          error: 'No data received from API'
        });
        toast.error('No data received from API');
        return;
      }
      
      // Get appointments data
      let appointmentsData: Appointment[] = [];
      if (response.data.data && Array.isArray(response.data.data)) {
        // Process appointments data to extract patient, doctor names and format date/time
        appointmentsData = response.data.data.map((appointment: RawAppointment): Appointment => {
          // Extract patient name
          let patientName = 'Unknown Patient';
          if (appointment.patientId && typeof appointment.patientId === 'object') {
            if (appointment.patientId.firstName && appointment.patientId.lastName) {
              patientName = `${appointment.patientId.firstName} ${appointment.patientId.lastName}`;
            }
          } else if (appointment.patientName) {
            patientName = appointment.patientName;
          }
          
          // Extract doctor name
          let doctorName = 'Unknown Doctor';
          if (appointment.doctorId && typeof appointment.doctorId === 'object') {
            if (appointment.doctorId.firstName && appointment.doctorId.lastName) {
              doctorName = `${appointment.doctorId.firstName} ${appointment.doctorId.lastName}`;
            }
          } else if (appointment.doctorName) {
            doctorName = appointment.doctorName;
          }
          
          // Format date and time
          let date = appointment.date || 'No date';
          let time = appointment.time || 'No time';
          if (!appointment.date && appointment.datetime) {
            const dt = new Date(appointment.datetime);
            date = dt.toISOString().split('T')[0]; // YYYY-MM-DD
            time = dt.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
          }
          
          // Get reason/description
          const reason = appointment.reason || appointment.description || 'No reason';
          
          return {
            _id: appointment._id,
            patientId: appointment.patientId,
            patientName,
            doctorId: appointment.doctorId,
            doctorName,
            date,
            time,
            reason,
            status: appointment.status,
            createdAt: appointment.createdAt,
            updatedAt: appointment.updatedAt,
            datetime: appointment.datetime,
            description: appointment.description
          };
        });
        
        console.log('Processed appointments data:', appointmentsData);
      } else {
        console.warn('Invalid appointment data format. Expected array but got:', typeof response.data.data);
      }
      
      // Get pagination info
      const pagination = {
        currentPage: response.data.pagination?.currentPage || page,
        totalPages: response.data.pagination?.totalPages || 1,
        hasMore: response.data.pagination?.hasMore || false,
        total: response.data.pagination?.total || appointmentsData.length,
        isPageLoading: false
      };
      
      // Update state
      set({
        appointments: {
          data: appointmentsData,
          pagination
        },
        isAppointmentsLoading: false,
        error: null
      });
      
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      set({ 
        isAppointmentsLoading: false,
        error: error.response?.data?.message || error.message || 'Failed to fetch appointments'
      });
      
      toast.error('Failed to fetch appointment data');
    }
  },
  
  // Update appointment function
  updateAppointment: async (id: string, status: string) => {
    try {
      console.log(`Updating appointment ${id} to status ${status}`);
      
      // Make API request
      const response = await axios.put(`/admin/appointments/${id}`, {
        status // Only send the status field
      }, {
        withCredentials: true
      });
      
      console.log('Update response:', response.data);
      
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Failed to update appointment');
      }
      
      // Update local state
      set((state) => ({
        appointments: {
          ...state.appointments,
          data: state.appointments.data.map(appointment => 
            appointment._id === id 
              ? { ...appointment, status } 
              : appointment
          )
        }
      }));
      
      // Show success message
      toast.success(`Appointment status updated to ${status}`);
      
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      toast.error(error.response?.data?.message || error.message || 'Failed to update appointment status');
    }
  }
}));