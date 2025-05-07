import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";


export const useAppointmentStore = create((set, get) => ({
    appointments: {
        data: [],
        pagination: {
            currentPage: 1,
            hasMore: true,
            isPageLoading: false,
            totalPages: 1
        }
    },
    doctors: [],
    isAppointmentLoading: false,
    isAppointmentsLoading: false,
    selectedAppointment: null,
    

    getAllAppointments: async (page = 1, limit = 20) => {
        const isInitialLoad = page === 1;
        if (isInitialLoad) {
            set({ isAppointmentsLoading: true });
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
            const res = await axiosInstance.get(`/appointments/getAppointment/${appointmentId}`);
            set({
                selectedAppointment: res.data.appointment,
                isAppointmentLoading: false,
            });
            console.log(get().selectedAppointment);
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
            set({ doctors: resdoctors.data })
        }
        catch (error) {
            toast.error(error.response?.data?.message || "Failed to load doctors");
        }

    },
    setSelectedAppointment: (appointment:any) => {
        set({selectedAppointment: appointment});
    },
    deleteAppointment: async (appointmentId) => {
        try {
            const res = await axiosInstance.delete(`/appointments/deleteAppointment/${appointmentId}`);
            set(state => ({
                appointments: {
                    data: state.appointments.data.filter(appointment => appointment._id !== appointmentId),
                    pagination: {
                        ...state.appointments.pagination,
                        totalPages: res.data.pagination?.totalPages || 1
                    }
                },
                selectedAppointment: null,
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete appointment");
        }
    },
}));
