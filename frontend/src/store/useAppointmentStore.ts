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
    appointmentDoctor: null,
    isAppointmentLoading: false,
    isAppointmentsLoading: false,
    isAppointmentBeingCreated: false,
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
                        ? res.data.appointmentsData :
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
        } catch (error) {
            set({ isAppointmentLoading: false });
            toast.error(error.response?.data?.message || "Failed to fetch appointment details");
        }
    },
   createAppointment: async (appointmentData) => {
    try {
        set({ isAppointmentbeingCreated: true });

        const res = await axiosInstance.post(`/appointments/createAppointment`, appointmentData);

        set({ isAppointmentbeingCreated: false });

        toast.success('Appointment created successfully');
    }
    catch (error) {
        set({ isAppointmentbeingCreated: false });

        // Handle conflict errors (409 status)
        if (error.response?.status === 409) {
            const message = error.response.data?.message;

            if (message === "You have already booked this appointment") {
                toast.error("You have already booked this exact appointment.");
            } else if (message === "You already have an appointment at this time with another doctor") {
                toast.error("You already have an appointment at this time with another doctor.");
            } else if (message === "Appointment already confirmed and paid for by another user") {
                toast.error("Appointment already confirmed and paid for by another user.");
            } else {
                toast.error(message || "Appointment conflict occurred.");
            }
        } else {
            // Handle all other errors
            toast.error(error.response?.data?.message || "Failed to create appointment");
        }
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
    getDoctor: async (doctorId) => {
        try {
            const doctor = await axiosInstance.get(`/appointments/getDoctor/${doctorId}`);
            set({ appointmentDoctor: doctor.data })
        }
        catch (error) {
            toast.error(error.response?.data?.message || "Failed to load doctors");
        }
    },

    updateAppointment: async (appointmentId) => {
        try {
            const res = await axiosInstance.put(`/appointments/updateAppointment/${appointmentId}`, {
                status: "cancelled"
            });

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

            toast.success(res.data.message || "Appointment cancelled successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to cancel appointment");
        }
    }

}));
