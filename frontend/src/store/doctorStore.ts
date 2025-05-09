// store/doctorStore.ts
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface Certification {
  name: string;
  issuingBody: string;
  year: number;
  expiryYear?: number;
}

export interface Schedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Review {
  patientId: string;
  patientName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  profileImage?: string;
  bio?: string;
  gender: 'male' | 'female' | 'other';
  
  // Professional details
  experience: number;
  education?: Education[];
  certifications?: Certification[];
  languages?: string[];
  
  // Hospital details
  department: string;
  roomNumber?: string;
  schedule?: Schedule[];
  
  // Financial information
  commissionRate: number;
  accountDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  
  // Performance metrics
  averageRating: number;
  totalReviews: number;
  totalAppointments: number;
  reviews?: Review[];
  
  // Status
  isActive: boolean;
  isOnLeave: boolean;
  joinedAt: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface DoctorFilters {
  specialty?: string;
  department?: string;
  name?: string;
  minRating?: number;
  isActive?: boolean;
  isOnLeave?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface DoctorStore {
  doctors: Doctor[];
  currentDoctor: Doctor | null;
  doctorSchedule: Schedule[] | null;
  loading: boolean;
  error: string | null;
  filters: DoctorFilters;
  
  fetchDoctors: (filters?: DoctorFilters) => Promise<void>;
  fetchDoctorById: (id: string) => Promise<void>;
  updateDoctor: (id: string, doctorData: Partial<Doctor>) => Promise<void>;
  fetchDoctorSchedule: (id: string) => Promise<void>;
  updateDoctorSchedule: (id: string, schedule: Schedule[]) => Promise<void>;
  setFilters: (filters: DoctorFilters) => void;
  clearFilters: () => void;
}

export const useDoctorStore = create<DoctorStore>((set, get) => ({
  doctors: [],
  currentDoctor: null,
  doctorSchedule: null,
  loading: false,
  error: null,
  filters: {},
  
  fetchDoctors: async (filters?: DoctorFilters) => {
    try {
      set({ loading: true, error: null });
      
      // Use provided filters or get from store
      const queryParams = filters || get().filters;
      
      // Build query string
      const queryString = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value));
        }
      });
      
      const response = await axiosInstance.get(`/api/admin/doctors?${queryString}`);
      set({ doctors: response.data.data, loading: false });
    } catch (error) {
      set({ 
        error: (error as Error).message || 'Failed to fetch doctors', 
        loading: false 
      });
    }
  },
  
  fetchDoctorById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.get(`/api/admin/doctors/${id}`);
      set({ currentDoctor: response.data.data, loading: false });
    } catch (error) {
      set({ 
        error: (error as Error).message || 'Failed to fetch doctor', 
        loading: false 
      });
    }
  },
  
  updateDoctor: async (id: string, doctorData: Partial<Doctor>) => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.put(`/api/admin/doctors/${id}`, doctorData);
      
      // Update current doctor if it's the one being updated
      if (get().currentDoctor?._id === id) {
        set({ currentDoctor: response.data.data });
      }
      
      // Update doctor in the list
      const updatedDoctors = get().doctors.map(doctor => 
        doctor._id === id ? { ...doctor, ...doctorData } : doctor
      );
      
      set({ doctors: updatedDoctors, loading: false });
    } catch (error) {
      set({ 
        error: (error as Error).message || 'Failed to update doctor', 
        loading: false 
      });
    }
  },
  
  fetchDoctorSchedule: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.get(`/api/admin/doctors/${id}/schedule`);
      set({ doctorSchedule: response.data.data, loading: false });
    } catch (error) {
      set({ 
        error: (error as Error).message || 'Failed to fetch doctor schedule', 
        loading: false 
      });
    }
  },
  
  updateDoctorSchedule: async (id: string, schedule: Schedule[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.put(`/api/admin/doctors/${id}/schedule`, { schedule });
      
      // Update schedule in store
      set({ doctorSchedule: schedule, loading: false });
      
      // If this doctor is the current doctor, update its schedule too
      if (get().currentDoctor?._id === id) {
        const updatedDoctor = { ...get().currentDoctor as Doctor, schedule };
        set({ currentDoctor: updatedDoctor });
      }
    } catch (error) {
      set({ 
        error: (error as Error).message || 'Failed to update doctor schedule', 
        loading: false 
      });
    }
  },
  
  setFilters: (filters) => {
    set({ filters });
    get().fetchDoctors(filters);
  },
  
  clearFilters: () => {
    set({ filters: {} });
    get().fetchDoctors({});
  }
}));