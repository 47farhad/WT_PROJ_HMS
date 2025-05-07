import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAdminStore = create((set, get) => ({
    patients: {
        data: [],
        pagination: {
            currentPage: 1,
            hasMore: true,
            isPageLoading: false,
        }
    },
    patient: null,
    isPatientLoading: false,
    isPatientsLoading: false,

    getPatients: async (page = 1, limit = 20) => {
        const isInitialLoad = page === 1;

        if (isInitialLoad) {
            set({ isPatientsLoading: true });
        }
        else {
            set(state => ({
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

            set(state => ({
                patients: {
                    data: isInitialLoad
                        ? res.data.patients
                        : [...state.patients.data, ...res.data.patients],
                    pagination: {
                        currentPage: res.data.pagination.currentPage,
                        hasMore: res.data.pagination?.hasMore || false,
                        isPageLoading: false,
                    }
                },
                isPatientsLoading: false
            }));
        } 
        catch (error) {
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

    getPatientDetails: async (patientId) => {
        try {
            set({isPatientLoading: true})
            const res = await axiosInstance.get(`/admin/getPatientDetails/${patientId}`);

            set({patient: res.data})
            set({isPatientLoading: false})
        }
        catch (error) {
            set({isPatientLoading: false})
            toast.error(error.response?.data?.message || "Failed to fetch patient data");
        }
    }
}));