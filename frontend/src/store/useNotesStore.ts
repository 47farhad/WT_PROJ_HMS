import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useNotesStore = create((set, get) => ({
    givenNotes: [],
    isNotesLoading: false,
    isCreatingNotes: false,

    createNotes: async (appointmentId,notesData) => {
        try {
            set({ isCreatingNotes: true });
            const res = await axiosInstance.post(`/notes/createNotes/${appointmentId}`,notesData);
            
            // Update state with the new notes
            set((state) => ({
                isCreatingNotes: false,
                givenNotes: [res.data, ...state.givenNotes]
            }));

            toast.success("Notes created successfully");
            return res.data; // Return the created notes
        } catch (error) {
            set({ isCreatingNotes: false });
            const errorMessage = error.response?.data?.message || "Failed to create notes";
            toast.error(errorMessage);
            throw error; // Re-throw to allow component-level handling
        }
    },

    // Add this function to fetch notes by appointment
    getNotes: async (appointmentId) => {
        try {
            set({ isNotesLoading: true });
            const res = await axiosInstance.get(`/notes/getNotes/${appointmentId}`);
            
            set({
                givenNotes: res.data,
                isNotesLoading: false
            });
            
            return res.data;
        } catch (error) {
            set({ isNotesLoading: false });
            const errorMessage = error.response?.data?.message || "Failed to fetch notes";
            toast.error(errorMessage);
            throw error;
        }
    }
}));