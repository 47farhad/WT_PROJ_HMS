import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';

export interface Payment {
  _id: string;
  transactionId: string;
  patientId: string;
  patientName: string;
  doctorId?: string;
  doctorName?: string;
  amount: number;
  category: 'appointment' | 'labtest' | 'medicine' | 'salary' | 'refund' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  paymentMethod: 'cash' | 'credit' | 'debit' | 'insurance' | 'bank_transfer' | 'other';
  notes?: string;
  originalTransactionId?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSummary {
  categoryTotals: {
    _id: string;
    total: number;
    count: number;
  }[];
  statusCounts: {
    _id: string;
    count: number;
    amount: number;
  }[];
  overall: {
    totalAmount: number;
    totalCount: number;
    approvedAmount: number;
    pendingAmount: number;
  };
}

export interface PaymentFilters {
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  patientId?: string;
  doctorId?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface PaymentStore {
  payments: Payment[];
  currentPayment: Payment | null;
  summary: PaymentSummary | null;
  loading: boolean;
  error: string | null;
  filters: PaymentFilters;
  
  fetchPayments: (filters?: PaymentFilters) => Promise<void>;
  fetchPaymentById: (id: string) => Promise<void>;
  fetchPaymentSummary: () => Promise<void>;
  updatePaymentStatus: (id: string, status: Payment['status']) => Promise<void>;
  createPayment: (paymentData: Partial<Payment>) => Promise<void>;
  setFilters: (filters: PaymentFilters) => void;
  clearFilters: () => void;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: [],
  currentPayment: null,
  summary: null,
  loading: false,
  error: null,
  filters: {},
  
  fetchPayments: async (filters?: PaymentFilters) => {
    try {
      set({ loading: true, error: null });
      
      // Use provided filters or get from store
      const queryParams = filters || get().filters;
      
      // Build query string
      const queryString = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value) queryString.append(key, String(value));
      });
      
      const response = await axiosInstance.get(`/payments?${queryString}`);
      set({ payments: response.data.data, loading: false });
    } catch (error) {
      set({ 
        error: (error as Error).message || 'Failed to fetch payments', 
        loading: false 
      });
    }
  },
  
  fetchPaymentById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.get(`/payments/${id}`);
      set({ currentPayment: response.data.data, loading: false });
    } catch (error) {
      set({ 
        error: (error as Error).message || 'Failed to fetch payment', 
        loading: false 
      });
    }
  },
  
  fetchPaymentSummary: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.get('/payments/summary');
      set({ summary: response.data.data, loading: false });
    } catch (error) {
      set({ 
        error: (error as Error).message || 'Failed to fetch payment summary', 
        loading: false 
      });
    }
  },
  
  updatePaymentStatus: async (id: string, status: Payment['status']) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.patch(`/payments/${id}/status`, { status });
      
      // Update the payment in the list
      const payments = get().payments.map(payment => 
        payment._id === id ? { ...payment, status } : payment
      );
      
      // Update current payment if it's the one being updated
      const currentPayment = get().currentPayment;
      if (currentPayment && currentPayment._id === id) {
        set({ currentPayment: { ...currentPayment, status } });
      }
      
      set({ payments, loading: false });
      
      // Refresh summary data
      get().fetchPaymentSummary();
    } catch (error) {
      set({ 
        error: (error as Error).message || 'Failed to update payment status', 
        loading: false 
      });
    }
  },
  
  createPayment: async (paymentData: Partial<Payment>) => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.post('/payments', paymentData);
      
      // Add new payment to the list
      const payments = [response.data.data, ...get().payments];
      set({ payments, loading: false });
      
      // Refresh summary
      get().fetchPaymentSummary();
    } catch (error) {
      set({ 
        error: (error as Error).message || 'Failed to create payment', 
        loading: false 
      });
    }
  },
  
  setFilters: (filters) => {
    set({ filters });
    get().fetchPayments(filters);
  },
  
  clearFilters: () => {
    set({ filters: {} });
    get().fetchPayments({});
  }
}));