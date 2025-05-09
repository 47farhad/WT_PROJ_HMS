// store/requestStore.ts
import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

export interface LeaveDetails {
  startDate: string;
  endDate: string;
  reason: string;
}

export interface CommissionDetails {
  currentRate: number;
  requestedRate: number;
  justification: string;
}

export interface DoctorRequest {
  _id: string;
  doctorId: string;
  doctorName: string;
  type: 'leave' | 'commission_change';
  status: 'pending' | 'approved' | 'rejected';
  leaveDetails?: LeaveDetails;
  commissionDetails?: CommissionDetails;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestFilters {
  type?: 'leave' | 'commission_change';
  status?: 'pending' | 'approved' | 'rejected';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface RequestStore {
  requests: DoctorRequest[];
  doctorRequests: DoctorRequest[];
  selectedRequest: DoctorRequest | null;
  loading: boolean;
  error: string | null;
  filters: RequestFilters;
  
  fetchAllRequests: (filters?: RequestFilters) => Promise<void>;
  fetchDoctorRequests: (doctorId: string) => Promise<void>;
  updateRequestStatus: (
    requestId: string, 
    status: 'approved' | 'rejected', 
    adminNotes?: string
  ) => Promise<void>;
  setFilters: (filters: RequestFilters) => void;
  clearFilters: () => void;
}

export const useRequestStore = create<RequestStore>((set, get) => ({
  requests: [],
  doctorRequests: [],
  selectedRequest: null,
  loading: false,
  error: null,
  filters: {},
  
  fetchAllRequests: async (filters?: RequestFilters) => {
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
      
      const response = await axiosInstance.get(`/api/admin/requests?${queryString}`);
      set({ requests: response.data.data, loading: false });
    } catch (error) {
      set({ 
        error: (error as Error).message || 'Failed to fetch requests', 
        loading: false 
      });
    }
  },
  
  fetchDoctorRequests: async (doctorId: string) => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.get(`/api/admin/requests/doctor/${doctorId}`);
      set({ doctorRequests: response.data.data, loading: false });
    } catch (error) {
      set({ 
        error: (error as Error).message || 'Failed to fetch doctor requests', 
        loading: false 
      });
    }
  },
  
  updateRequestStatus: async (requestId: string, status: 'approved' | 'rejected', adminNotes?: string) => {
    try {
      set({ loading: true, error: null });
      
      await axiosInstance.patch(`/api/admin/requests/${requestId}/status`, {
        status,
        adminNotes
      });
      
      // Update request in the lists
      const updateRequestInList = (list: DoctorRequest[]): DoctorRequest[] => {
        return list.map(request => 
          request._id === requestId 
            ? { ...request, status, adminNotes: adminNotes || request.adminNotes } 
            : request
        );
      };
      
      const updatedRequests = updateRequestInList(get().requests);
      const updatedDoctorRequests = updateRequestInList(get().doctorRequests);
      
      set({ 
        requests: updatedRequests, 
        doctorRequests: updatedDoctorRequests,
        loading: false 
      });
      
      // If this request is the selected request, update it too
      if (get().selectedRequest?._id === requestId) {
        const updatedRequest = { 
          ...get().selectedRequest as DoctorRequest, 
          status, 
          adminNotes: adminNotes || get().selectedRequest?.adminNotes 
        };
        set({ selectedRequest: updatedRequest });
      }
    } catch (error) {
      set({ 
        error: (error as Error).message || 'Failed to update request status', 
        loading: false 
      });
    }
  },
  
  setFilters: (filters) => {
    set({ filters });
    get().fetchAllRequests(filters);
  },
  
  clearFilters: () => {
    set({ filters: {} });
    get().fetchAllRequests({});
  }
}));