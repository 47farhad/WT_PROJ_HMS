import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const usePatientLabTestStore = create((set, get) => ({
    labTests: {
        data: [],
        pagination: {
            currentPage: 1,
            hasMore: true,
            isPageLoading: false,
            totalPages: 1
        }
    },
    isLabTestsLoading: false,
    isLabTestLoading: false,
    isLabTestBeingCreated: false,
    selectedLabTest: null,

    getAllLabTests: async (page = 1, limit = 20) => {
        const isInitialLoad = page === 1;
        if (isInitialLoad) {
            set({ isLabTestsLoading: true });
        } else {
            set(state => ({
                labTests: {
                    ...state.labTests,
                    pagination: {
                        ...state.labTests.pagination,
                        isPageLoading: true
                    }
                }
            }));
        }

        try {
            const res = await axiosInstance.get(`/patientLabTests/getAllLabTests?page=${page}&limit=${limit}`);

            set(state => ({
                labTests: {
                    data: isInitialLoad
                        ? res.data.labTestsData
                        : [...state.labTests.data, ...res.data.labTestsData],
                    pagination: {
                        currentPage: page,
                        hasMore: res.data.pagination?.hasMore || false,
                        isPageLoading: false,
                        totalPages: res.data.pagination?.totalPages || 1
                    }
                },
                isLabTestsLoading: false
            }));
        } catch (error) {
            set({
                isLabTestsLoading: false,
                labTests: {
                    ...get().labTests,
                    pagination: {
                        ...get().labTests.pagination,
                        isPageLoading: false
                    }
                }
            });
            toast.error(error.response?.data?.message || "Failed to fetch lab tests");
        }
    },

    getLabTestDetails: async (labTestId) => {
    try {
        set({ isLabTestLoading: true });
        const res = await axiosInstance.get(`/patientLabTests/getLabTestDetails/${labTestId}`);
        
        set({
            selectedLabTest: res.data.offeredlabTest,
            isLabTestLoading: false,
        });

    } catch (error) {
        set({ isLabTestLoading: false });
        toast.error(error.response?.data?.message || "Failed to fetch lab test details");
    }
},

    bookLabTest: async (labTestData) => {
        try {
            set({ isLabTestBeingCreated: true });

            const res = await axiosInstance.post(`/patientLabTests/bookLabTest`, labTestData);

            set({ isLabTestBeingCreated: false });

            toast.success('Lab test booked successfully');
        } catch (error) {
            set({ isLabTestBeingCreated: false });

            if (error.response?.status === 409) {
                toast.error(error.response.data?.message || "Conflict occurred while creating lab test");
            } else {
                toast.error(error.response?.data?.message || "Failed to book lab test");
            }
        }
    },

 cancelLabTest: async (labTestId, updateData) => {
    try {
        // Make the API call to cancel the lab test
        const res = await axiosInstance.put(`/patientLabTests/cancelLabTest/${labTestId}`, updateData);

        // Update the lab test state with the new status
        set(state => ({
            labTests: {
                data: state.labTests.data.map(test =>
                    test._id === labTestId ? { ...test, status: 'cancelled', ...updateData } : test
                ),
                pagination: {
                    ...state.labTests.pagination,
                    totalPages: res.data.pagination?.totalPages || state.labTests.pagination.totalPages
                }
            },
            selectedLabTest: null,
        }));

        // Show success message
        toast.success(res.data.message || "Lab test cancelled successfully");
    } catch (error) {
        // Show error message if something goes wrong
        toast.error(error.response?.data?.message || "Failed to cancel lab test");
    }
}

}));
