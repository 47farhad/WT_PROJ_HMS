import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useReviewsStore = create((set, get) => ({
    givenReviews: [],
    isReviewsLoading: false,
    isCreatingReviews: false,

    createReviews: async (appointmentId,reviewsData) => {
        try {
            set({ isCreatingReviews: true });
            const res = await axiosInstance.post(`/reviews/createReviews/${appointmentId}`,reviewsData);
            
            // Update state with the new reviews
            set((state) => ({
                isCreatingReviews: false,
                givenReviews: [res.data, ...state.givenReviews]
            }));

            toast.success("Reviews created successfully");
            return res.data; // Return the created reviews
        } catch (error) {
            set({ isCreatingReviews: false });
            const errorMessage = error.response?.data?.message || "Failed to create reviews";
            toast.error(errorMessage);
            throw error; // Re-throw to allow component-level handling
        }
    },

    // Add this function to fetch reviews by appointment
    getReviews: async (appointmentId) => {
        try {
            set({ isReviewsLoading: true });
            const res = await axiosInstance.get(`/reviews/getReviews/${appointmentId}`);
            
            set({
                givenReviews: res.data,
                isReviewsLoading: false
            });
            
            return res.data;
        } catch (error) {
            set({ isReviewsLoading: false });
            const errorMessage = error.response?.data?.message || "Failed to fetch reviews";
            toast.error(errorMessage);
            throw error;
        }
    }
}));