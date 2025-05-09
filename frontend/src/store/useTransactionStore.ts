import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useTransactionStore = create((set, get) => ({
    transactions: {
        data: [],
        pagination: {
            currentPage: 1,
            hasMore: true,
            isPageLoading: false,
            totalPages: 1
        }
    },

    isTransactionLoading:false,
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
            console.log(get().selectedTransaction);
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
    updateTransaction: async (transactionId, status) => {
        try {
            // Prepare the data to be sent to the backend
            const transactionData = {
                status
            };

            // Send PUT request to the backend to update the transaction status
            const response = await axiosInstance.put(`/transactions/updateTransaction/${transactionId}`, transactionData);

            // If successful, show success toast and update state with the updated transaction
            toast.success('Transaction updated successfully');

            // Optionally, update the transaction list in state if needed
            set(state => ({
                transactions: {
                    data: state.transactions.data.map(transaction => 
                        transaction._id === transactionId
                            ? { ...transaction, status: response.data.transaction.status }
                            : transaction
                    )
                }
            }));
        } catch (error) {
            // Handle errors and display appropriate messages
            if (error.response?.status === 400) {
                toast.error(error.response?.data?.message || "Transaction failed. Please try again.");
            } else {
                toast.error("Failed to update transaction. Please try again later.");
            }
        }
    }
}));

