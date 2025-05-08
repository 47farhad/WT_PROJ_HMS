import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useLabTestStore = create((set, get) => ({
    offeredLabTests: [],
    isOfferedLabTestsLoading: false,
    isCreatingLabTest: false,
    isDeletingLabTest: false,
    isUpdatingLabTest: false,

    getOfferedLabTest: async () => {
        try {
            set({ isOfferedLabTestsLoading: true })
            const res = await axiosInstance.get('/labTests/getTests/');

            set({ offeredLabTests: res.data })
            set({ isOfferedLabTestsLoading: false })
        }
        catch (error) {
            set({ isOfferedLabTestsLoading: false })
            toast.error(error.response?.data?.message || "Failed to fetch lab tests data");
        }
    },

    createLabTest: async () => {
        try {
            set({ isCreatingLabTest: true });
            const res = await axiosInstance.post('labTests/createTest');

            set((state) => ({
                isCreatingLabTest: false,
                offeredLabTests: [res.data, ...state.offeredLabTests]
            }));

            toast.success("Lab test created successfully");
        } catch (error) {
            set({ isCreatingLabTest: false });
            toast.error(error.response?.data?.message || "Failed to create lab test");
        }
    },

    deleteLabTest: async (testId: string) => {
        try {
            set({ isDeletingLabTest: true });

            await axiosInstance.delete(`/labTests/deleteTest/${testId}`);

            set((state) => ({
                offeredLabTests: state.offeredLabTests.filter(test => test._id !== testId),
                isDeletingLabTest: false
            }));

            toast.success('Lab test deleted successfully');
        } catch (error) {
            console.error('Failed to delete lab test:', error);
            set({ isDeletingLabTest: false });
            toast.error(error.response?.data?.message || 'Failed to delete lab test');
        }
    },

    updateLabTest: async (testId, updatedData) => {
        try {
            set({ isUpdatingLabTest: true });

            const response = await axiosInstance.put(`/labTests/updateTest/${testId}`, updatedData);

            set((state) => ({
                offeredLabTests: state.offeredLabTests.map(test =>
                    test._id === testId ? { ...test, ...response.data } : test
                ),
                isUpdatingLabTest: false
            }));

            toast.success('Lab test updated successfully');
        } catch (error) {
            console.error('Failed to update lab test:', error);
            set({ isUpdatingLabTest: false });
            toast.error(error.response?.data?.message || 'Failed to update lab test');
        }
    }
}));