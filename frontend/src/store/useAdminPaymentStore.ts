// src/store/useAdminPaymentStore.ts
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

// Define the Payment interface
interface Payment {
  _id: string;
  invoiceId: string;
  patientId: string;
  patientName: string;
  treatment: string;
  displayTreatment?: string;
  date: string;
  amount: number;
  status: string;
  createdAt: string;
}

// Define the Summary interface
interface Summary {
  overall: {
    totalAmount: number;
    totalCount: number;
    approvedAmount: number;
    pendingAmount: number;
  };
  statusCounts: {
    _id: string;
    count: number;
    amount: number;
  }[];
  categoryTotals: {
    _id: string;
    total: number;
    count: number;
  }[];
}

// Define pagination interface
interface Pagination {
  currentPage: number;
  hasMore: boolean;
  isPageLoading: boolean;
  totalPages: number;
}

// Define the store interface
interface AdminPaymentStore {
  payments: {
    data: Payment[];
    pagination: Pagination;
  };
  summary: Summary | null;
  isPaymentsLoading: boolean;
  isSummaryLoading: boolean;
  error: string | null;
  
  getPayments: (page?: number, limit?: number) => Promise<void>;
  getSummary: () => Promise<void>;
  updatePaymentStatus: (id: string, newStatus: string) => Promise<void>;
}

// Create the store
export const useAdminPaymentStore = create<AdminPaymentStore>((set, get) => ({
  // Initial state
  payments: {
    data: [],
    pagination: {
      currentPage: 1,
      hasMore: false,
      isPageLoading: false,
      totalPages: 1,
    },
  },
  summary: null,
  isPaymentsLoading: false,
  isSummaryLoading: false,
  error: null,
  
  // Get payments function
  getPayments: async (page = 1, limit = 20) => {
    try {
      set({ isPaymentsLoading: true });
      console.log('Fetching payments data...');
      
      // Make API request
      const response = await axiosInstance.get(`/admin/payments?page=${page}&limit=${limit}`, {
        withCredentials: true
      });
      
      console.log('Payments API response:', response.data);
      
      // Handle successful response
      if (response.data && response.data.data) {
        set({
          payments: {
            data: response.data.data,
            pagination: {
              currentPage: response.data.pagination?.currentPage || 1,
              hasMore: response.data.pagination?.hasMore || false,
              isPageLoading: false,
              totalPages: response.data.pagination?.totalPages || 1,
            },
          },
          isPaymentsLoading: false,
          error: null
        });
      } else {
        console.warn('Invalid payment data format:', response.data);
        set({ 
          isPaymentsLoading: false,
          error: 'Invalid payment data format'
        });
        toast.error('Invalid data format received from server');
      }
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      
      set({ 
        isPaymentsLoading: false,
        error: error?.response?.data?.message || 'Failed to fetch payments'
      });
      
      toast.error('Failed to fetch payment data');
    }
  },
  
  // Get summary function
  getSummary: async () => {
    try {
      set({ isSummaryLoading: true });
      console.log('Fetching payment summary...');
      
      // Make API request
      const response = await axiosInstance.get('/admin/payments/summary', {
        withCredentials: true
      });
      
      console.log('Summary API response:', response.data);
      
      // Handle successful response
      if (response.data && response.data.data) {
        set({ 
          summary: response.data.data,
          isSummaryLoading: false,
          error: null
        });
      } else {
        console.warn('Invalid summary data format:', response.data);
        set({ 
          isSummaryLoading: false,
          error: 'Invalid summary data format'
        });
        toast.error('Invalid summary data format received');
      }
    } catch (error: any) {
      console.error('Error fetching payment summary:', error);
      
      set({ 
        isSummaryLoading: false,
        error: error?.response?.data?.message || 'Failed to fetch payment summary'
      });
      
      toast.error('Failed to fetch payment summary');
    }
  },
  
  // Update payment status function
  updatePaymentStatus: async (id: string, newStatus: string) => {
    try {
      // Map display status to backend status
      const statusMap: Record<string, string> = {
        'Pending': 'unpaid',
        'Paid': 'paid',
        'Failed': 'failed'
      };
      
      const backendStatus = statusMap[newStatus] || newStatus.toLowerCase();
      console.log(`Updating payment ${id} to status ${backendStatus}`);
      
      // Make API request
      const response = await axiosInstance.patch(`/admin/payments/${id}/status`, {
        status: backendStatus
      }, {
        withCredentials: true
      });
      
      console.log('Update response:', response.data);
      
      // Update local state
      set((state) => ({
        payments: {
          ...state.payments,
          data: state.payments.data.map(payment => 
            payment._id === id 
              ? { ...payment, status: newStatus } 
              : payment
          )
        }
      }));
      
      // Show success message
      toast.success(`Payment status updated to ${newStatus}`);
      
      // Refresh summary
      const store = get();
      store.getSummary();
      
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast.error(error?.response?.data?.message || 'Failed to update payment status');
    }
  }
}));