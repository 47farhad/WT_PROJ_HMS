import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const usePrescriptionStore = create((set, get) => ({
    prescriptions: {
        data: [],
        pagination: {
            currentPage: 1,
            hasMore: false,
            isPageLoading: false,
            totalPages: 1
        }
    },
    isPrescriptionsLoading: false,
    isPrescriptionLoading: false,
    isCreatingPrescription: false,
    detailedPrescription: null,
    isDetailedPrescriptionLoading: false,
    givenPrescription: null,

    createPrescription: async (appointmentId, prescriptionData) => {
        try {
            set({ isCreatingPrescription: true });
            const res = await axiosInstance.post(`/prescription/createPrescription/${appointmentId}`, prescriptionData);

            // Update state with the new prescription
            set((state) => ({
                isCreatingPrescription: false,
            }));

            toast.success("Prescription created successfully");
            return res.data; // Return the created prescription
        } catch (error) {
            set({ isCreatingPrescription: false });
            const errorMessage = error.response?.data?.message || "Failed to create prescription";
            toast.error(errorMessage);
            throw error; // Re-throw to allow component-level handling
        }
    },

    getPrescription: async (appointmentId) => {
        try {
            set({ isPrescriptionLoading: true });
            const res = await axiosInstance.get(`/prescription/getPrescription/${appointmentId}`);

            set({
                givenPrescription: res.data,
                isPrescriptionLoading: false
            });

            return res.data;
        } catch (error) {
            set({ isPrescriptionLoading: false });
            const errorMessage = error.response?.data?.message || "Failed to fetch prescriptions";
            throw error;
        }
    },

    getPrescriptions: async (page = 1, limit = 20) => {
        const isInitialLoad = page === 1;

        if (isInitialLoad) {
            set({ isPrescriptionsLoading: true });
        } else {
            set(state => ({
                prescriptions: {
                    ...state.prescriptions,
                    pagination: {
                        ...state.prescriptions.pagination,
                        isPageLoading: true
                    }
                }
            }));
        }

        try {
            const res = await axiosInstance.get(`/prescription/getPrescriptions?page=${page}&limit=${limit}`);

            set(state => ({
                prescriptions: {
                    data: isInitialLoad
                        ? res.data.data
                        : [...state.prescriptions.data, ...res.data.data],
                    pagination: {
                        currentPage: page,
                        hasMore: res.data.pagination?.hasMore || false,
                        isPageLoading: false,
                        totalPages: res.data.pagination?.totalPages || 1
                    }
                },
                isPrescriptionsLoading: false
            }));
        } catch (error) {
            set({
                isPrescriptionsLoading: false,
                prescriptions: {
                    ...get().prescriptions,
                    pagination: {
                        ...get().prescriptions.pagination,
                        isPageLoading: false
                    }
                }
            });
            toast.error(error.response?.data?.message || "Failed to fetch prescriptions");
        }
    },

    getPrescriptionDetails: async (prescriptionId: string) => {
        try {
            set({ isDetailedPrescriptionLoading: true });

            const res = await axiosInstance.get(`/prescription/getPrescriptionDetails/${prescriptionId}`);
            set({ detailedPrescription: res.data, isDetailedPrescriptionLoading: false });
        }
        catch (error: any) {
            console.error("Failed to fetch prescription details:", error);
            set({
                isDetailedPrescriptionLoading: false,
                detailedPrescription: null,
            });
            toast.error(error.response?.data?.message || "Failed to fetch prescription");
        }
    }
}));