import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

import defaultPFP from '/pictures/avatar.png'

const BASE_URL = 'http://localhost:5001';

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isLoggingOut: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    socket: null,
    onlineUsers: [],

    applyPFP: () => {
        const { authUser } = get();

        if (authUser && (!authUser.profilePic || authUser.profilePic === '')) {
            set({
                authUser: {
                    ...authUser,
                    profilePic: defaultPFP
                }
            });
        }
    },

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");

            set({ authUser: res.data })
            get().connectSocket();
        }
        catch (error) {
            set({ authUser: null })
            console.log("Error in checkAuth:", error)
        }
        finally {
            set({ isCheckingAuth: false })
            const { applyPFP } = get()
            applyPFP();
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });

        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            toast.success("Account created successfully");
            get().connectSocket();
        }
        catch (error) {
            toast.error(error.response.data.message);
        }
        finally {
            set({ isSigningUp: false });
            const { applyPFP } = get()
            applyPFP();
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });

        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            toast.success("Logged in successfully");

            get().connectSocket();
        }
        catch (error) {
            toast.error(error.message);
            console.log(error)
        }
        finally {
            set({ isLoggingIn: false });
            const { applyPFP } = get()
            applyPFP();
        }
    },

    logout: async () => {
        try {
            set({ isLoggingOut: true });
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");
            get().disconnectSocket();
        }
        catch (error) {
            toast.error(error.response.data.message);
        }
        finally {
            set({ isLoggingOut: false });
        }
    },

    connectSocket: () => {
        const { authUser, socket } = get();
        if (!authUser || socket?.connected) return;

        const connectionSocket = io(BASE_URL, {
            query: {
                userID: authUser._id
            }
        });
        connectionSocket.connect();

        set({ socket: connectionSocket });

        connectionSocket.on("getOnlineUsers", (usersIDs) => {
            set({ onlineUsers: usersIDs })
        });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket?.connected) {
            socket.disconnect();
        }
    }

}));