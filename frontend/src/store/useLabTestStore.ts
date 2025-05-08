import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useLabTestStore = create((set, get) => ({
    offeredLabTests: [],
    isOfferedLabTestsLoading: false,
    isCreatingLabTest: false,
    isDeletingLabTest: false,

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

            await axios.delete(`/api/labTests/deleteTest/${testId}`);

            set((state) => ({
                offeredLabTests: state.offeredLabTests.filter(test => test.id !== testId),
                isDeletingLabTest: false
            }));

            toast.success('Lab test deleted successfully');
        } catch (error) {
            console.error('Failed to delete lab test:', error);
            set({ isDeletingLabTest: false });
            toast.error(error.response?.data?.message || 'Failed to delete lab test');
        }
    }
}));