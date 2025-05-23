import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

interface Transaction {
  _id: string;
  status: string;
  [key: string]: any;
}

interface Pagination {
  currentPage: number;
  hasMore: boolean;
  isPageLoading: boolean;
  totalPages: number;
}

interface TransactionStoreState {
  transactions: {
    data: Transaction[];
    pagination: Pagination;
  };
  isTransactionLoading: boolean;
  isTransactionsLoading: boolean;
  selectedTransaction: Transaction | null;

  getTransactionDetails: (transactionId: string) => Promise<void>;
  getAllTransactions: (page?: number, limit?: number) => Promise<void>;
  updateTransaction: (transactionId: string, status: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionStoreState>((set, get) => ({
  transactions: {
    data: [],
    pagination: {
      currentPage: 1,
      hasMore: true,
      isPageLoading: false,
      totalPages: 1,
    },
  },

    isTransactionLoading: false,
    isTransactionsLoading: false,
    selectedTransaction: null,

    getTransactionDetails: async (transactionId) => {
        try {
            set({ isTransactionLoading: true });
            const res = await axiosInstance.get(`/transactions/getTransactionDetails/${transactionId}`);
            set({
                selectedTransaction: res.data.transaction,
                isTransactionLoading: false,
            });
        } catch (error) {
            set({ isTransactionLoading: false });
            toast.error(error.response?.data?.message || "Failed to fetch transaction details");
        }
    },
    getAllTransactions: async (page = 1, limit = 20) => {
        const isInitialLoad = page === 1;
        if (isInitialLoad) {
            set({ isTransactionsLoading: true });
        } else {
            set(state => ({
                transactions: {
                    ...state.transactions,
                    pagination: {
                        ...state.transactions.pagination,
                        isPageLoading: true
                    }
                }
            }));
        }
        try {
            const res = await axiosInstance.get(`/transactions/getAllTransactions?page=${page}&limit=${limit}`);
            set(state => ({
                transactions: {
                    data: isInitialLoad
                        ? res.data.transactionsData
                        : [...state.transactions.data, ...res.data.transactionsData],
                    pagination: {
                        currentPage: page,
                        hasMore: res.data.pagination?.hasMore || false,
                        isPageLoading: false,
                        totalPages: res.data.pagination?.totalPages || 1
                    }
                },
                isTransactionsLoading: false
            }));

        } catch (error) {
            set({
                isTransactionsLoading: false,
                transactions: {
                    ...get().transactions,
                    pagination: {
                        ...get().transactions.pagination,
                        isPageLoading: false
                    }
                }
            });
            toast.error(error.response?.data?.message || "Failed to fetch transactions");
        }
    },

    // Function to update the transaction
    updateTransaction: async (transactionId) => {
        try {
            // Send PUT request to the backend to update the transaction status
            const response = await axiosInstance.put(`/transactions/updateTransaction/${transactionId}`);

            // If successful, show success toast and update state with the updated transaction
            toast.success('Transaction updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || "Transaction failed. Please try again.");
            console.log(error)
        }
    }
}));
