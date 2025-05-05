import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";


export const useAppointmentStore = create((set, get) => ({
    appointments: {
        data: [],
        pagination: {
            currentPage: 1,
            hasMore: true,
            isPageloading: false,
            totalPages: 1
        }
    },
    doctors: [],
    isAppointmentLoading: false,
    selectedAppointment: null,


    getAllAppointments: async (page = 1, limit = 20) => {
        const isInitialLoad = page === 1;
        if (isInitialLoad) {
            set({ isAppointmentLoading: true });
        } else {
            set(state => ({
                appointments: {
                    ...state.appointments,
                    pagination: {
                        ...state.appointments.pagination,
                        isPageLoading: true
                    }

                }
            }));
        }
        try {
            const res = await axiosInstance.get(`/appointments/getAllAppointments?page=${page}&limit=${limit}`);
            set(state => ({
                appointments: {
                    data: isInitialLoad
                    ? res.data.appointmentsData:
                    [...state.appointments.data, ...res.data.appointmentsData],
                    pagination: {
                        currentPage: page,
                        hasMore: res.data.pagination?.hasMore || false,
                        isPageLoading: false,
                        totalPages: res.data.pagination?.totalPages || 1
                    }
                },
                isAppointmentsLoading: false
            }));

        } catch (error) {
            set({
                isAppointmentsLoading: false,
                appointments: {
                    ...get().appointments,
                    pagination: {
                        ...get().appointments.pagination,
                        isPageLoading: false
                    }
                }
            });
            toast.error(error.response?.data?.message || "Failed to fetch users");
        }
    },
    getAppointmentDetails: async (appointmentId) => {
        try {
            set({ isAppointmentLoading: true });
            const res = await axiosInstance.get(`/appointments/${appointmentId}`);
            set({
                selectedAppointment: res.data,
                isAppointmentLoading: false,
            });
        } catch (error) {
            set({ isAppointmentLoading: false });
            toast.error(error.response?.data?.message || "Failed to fetch appointment details");
        }
    },
    createAppointment: async (datetime, doctorId, description, page = 1, limit = 50) => {
        const isInitialLoad = page === 1;

        if (isInitialLoad) {
            set({ isAppointmentLoading: true });
        } else {
            set(state => ({
                appointments: {
                    ...state.appointments,
                    pagination: {
                        ...state.appointments.pagination,
                        isPageLoading: true
                    }
                }
            }));
        }
        try {
            const appointmentData = {
                datetime,
                doctorId,
                description
            }
            const res = await axiosInstance.post(`/appointments/createAppointment}`, appointmentData);
            set(state => ({
                appointments: {
                    data: isInitialLoad
                        ? res.data.appointments
                        : [...res.data.appointments, ...state.appointments.data],
                    pagination: {
                        currentPage: page,
                        hasMore: res.data.pagination?.hasNextPage || false,
                        isPageLoading: false,
                        totalPages: res.data.pagination?.totalPages || 1
                    }
                },
                isAppointmentLoading: false
            }));

        }
        catch (error) {
            set({
                isAppointmentsLoading: false,
                appointments: {
                    ...get().appointments,
                    pagination: {
                        ...get().appointments.pagination,
                        isPageLoading: false
                    }
                }
            });
            toast.error(error.response?.data?.message || "Failed to load appointments");
        }
    },
    getDoctors: async () => {
        try {
            const resdoctors = await axiosInstance.get('/appointments/getDoctors');
            console.log(resdoctors.data)
            set({ doctors: resdoctors.data })
        }
        catch (error) {
            toast.error(error.response?.data?.message || "Failed to load doctors");
        }

    }
}));