import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

import defaultPFP from '/pictures/avatar.png';

const BASE_URL = 'http://localhost:5001';

// Define interfaces for our types
interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePic?: string;
  userType?: string;
  medicalInfo?: Record<string, any>;
  [key: string]: any; // Allow for additional properties
}

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface ProfileUpdateData {
  personalData?: {
    firstName?: string;
    lastName?: string;
    contact?: string;
    emergencyContact?: string;
    address?: string;
    profilePic?: string;
    [key: string]: any;
  };
  medicalData?: Record<string, any>;
}

interface AuthState {
  authUser: UserData | null;
  token: string | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  socket: Socket | null;
  onlineUsers: string[];
  
  applyPFP: () => void;
  checkAuth: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  login: (data: LoginData) => Promise<UserData>;
  logout: () => Promise<void>;
  updateProfile: (personalData?: any, medicalData?: any) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  token: localStorage.getItem('authToken'), // Get stored token on initialization
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
    const token = get().token || localStorage.getItem('authToken');
    
    if (!token) {
      set({ authUser: null, isCheckingAuth: false });
      return;
    }
    
    try {
      // Make sure token is in the headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      
      // Connect socket after successful auth check
      get().connectSocket();
    }
    catch (error: any) {
      set({ authUser: null, token: null });
      localStorage.removeItem('authToken'); // Clear invalid token
      console.log("Error in checkAuth:", error);
    }
    finally {
      set({ isCheckingAuth: false });
      get().applyPFP();
    }
  },

  signup: async (data: SignupData) => {
    set({ isSigningUp: true });

    try {
      const res = await axiosInstance.post("/auth/signup", data);
      
      // Store the token if it's in the response
      const token = res.data.token || res.data.accessToken;
      if (token) {
        localStorage.setItem('authToken', token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ token });
      }
      
      set({ authUser: res.data.user || res.data });
      toast.success("Account created successfully");
      
      // Connect socket after successful signup
      get().connectSocket();
    }
    catch (error: any) {
      const errorMessage = error?.response?.data?.message || "An unexpected error occurred";
      toast.error(errorMessage);
    }
    finally {
      set({ isSigningUp: false });
      get().applyPFP();
    }
  },

  login: async (data: LoginData) => {
    set({ isLoggingIn: true });

    try {
      const res = await axiosInstance.post("/auth/login", data);
      
      // Extract and store token
      const token = res.data.token || res.data.accessToken;
      if (token) {
        localStorage.setItem('authToken', token);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ token });
      }
      
      set({ authUser: res.data.user || res.data });
      toast.success("Logged in successfully");

      // Connect socket after successful login
      get().connectSocket();
      
      return res.data; // Return the response so it can be awaited
    }
    catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || "An unexpected error occurred";
      toast.error(errorMessage);
      console.error("Login error details:", error);
      throw error; // Re-throw the error so it can be caught by the component
    }
    finally {
      set({ isLoggingIn: false });
      get().applyPFP();
    }
  },

  logout: async () => {
    try {
      set({ isLoggingOut: true });
      await axiosInstance.post("/auth/logout");
      
      // Clear token
      localStorage.removeItem('authToken');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      // Disconnect socket
      get().disconnectSocket();
      
      set({ authUser: null, token: null });
      toast.success("Logged out successfully");
    }
    catch (error: any) {
      const errorMessage = error?.response?.data?.message || "An unexpected error occurred";
      toast.error(errorMessage);
    }
    finally {
      set({ isLoggingOut: false });
    }
  },

  updateProfile: async (personalData?: any, medicalData?: any) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", {
        personalData,
        medicalData
      });

      // Update both personal and medical info in authUser
      set((state: AuthState) => ({
        authUser: {
          ...state.authUser,
          ...res.data, // Updated personal info
          medicalInfo: res.data.medicalInfo || (state.authUser?.medicalInfo || {}) // Preserve existing if not updated
        }
      }));
      
      toast.success("Profile updated successfully");
    }
    catch (error: any) {
      console.log("Error in update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
    finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    try {
      const connectionSocket = io(BASE_URL, {
        query: {
          userID: authUser._id
        }
      });
      connectionSocket.connect();

      set({ socket: connectionSocket });

      connectionSocket.on("getOnlineUsers", (usersIDs: string[]) => {
        set({ onlineUsers: usersIDs });
      });
    } catch (error: any) {
      console.error("Socket connection error:", error);
    }
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  }
}));