import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const usePrescriptionStore = create((set, get) => ({
    givenPrescription: [],
    isPrescriptionLoading: false,
    isCreatingPrescription: false,

    createPrescription: async (appointmentId,prescriptionData) => {
        try {
            set({ isCreatingPrescription: true });
            const res = await axiosInstance.post(`/prescription/createPrescription/${appointmentId}`,prescriptionData);
            
            // Update state with the new prescription
            set((state) => ({
                isCreatingPrescription: false,
                givenPrescription: [res.data, ...state.givenPrescription]
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

    // Add this function to fetch prescriptions by appointment
    getPrescription: async (appointmentId) => {
        try {
            set({ isPrescriptionLoading: true });
            const res = await axiosInstance.get(`/prescription/getByAppointment/${appointmentId}`);
            
            set({
                givenPrescription: res.data,
                isPrescriptionLoading: false
            });
            
            return res.data;
        } catch (error) {
            set({ isPrescriptionLoading: false });
            const errorMessage = error.response?.data?.message || "Failed to fetch prescriptions";
            toast.error(errorMessage);
            throw error;
        }
    }
}));