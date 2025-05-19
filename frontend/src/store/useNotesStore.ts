import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useNotesStore = create((set, get) => ({
    appointmentNotes: null,
    patientNotes: {},     // Notes mapped by patientId
    pagination: {},       // Pagination for patient notes
    isNotesLoading: false,
    isCreatingNotes: false,

    // Create a new note
    createNotes: async (appointmentId, notesData) => {
        try {
            set({ isCreatingNotes: true });
            const res = await axiosInstance.post(`/note/createNote/${appointmentId}`, notesData);

            toast.success("Notes created successfully");
            return res.data;
        } catch (error) {
            set({ isCreatingNotes: false });
            const errorMessage = error.response?.data?.message || "Failed to create notes";
            toast.error(errorMessage);
            throw error;
        }
    },

    // Get notes by appointmentId
    getNotesbyAppointmentId: async (appointmentId) => {
        try {
            set({ isNotesLoading: true });
            const res = await axiosInstance.get(`/note/getNote/${appointmentId}`);

            set((state) => ({
                isNotesLoading: false,
                appointmentNotes: res.data
            }));

            return res.data;
        } catch (error) {
            set({ isNotesLoading: false, appointmentNotes: null });
            const errorMessage = error.response?.data?.message || "Failed to fetch notes";
            toast.error(errorMessage);
            throw error;
        }
    },

    // Get notes by patientId (with pagination)
    getNotesbyPatientId: async (patientId, page = 1, limit = 20) => {
        try {
            set({ isNotesLoading: true });
            const res = await axiosInstance.get(`/note/getNotes/${patientId}`, {
                params: { page, limit }
            });

            set((state) => ({
                isNotesLoading: false,
                patientNotes: {
                    ...state.patientNotes,
                    [patientId]: res.data.notesData
                },
                pagination: {
                    ...state.pagination,
                    [patientId]: res.data.pagination
                }
            }));

            return {
                notes: res.data.notesData,
                pagination: res.data.pagination
            };
        } catch (error) {
            set({ isNotesLoading: false });
            const errorMessage = error.response?.data?.message || "Failed to fetch notes";
            toast.error(errorMessage);
            throw error;
        }
    }
}));
