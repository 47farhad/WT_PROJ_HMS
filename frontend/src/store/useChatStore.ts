import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import defaultPFP from '/pictures/avatar.png';

export const useChatStore = create((set, get) => ({
    messages: {
        data: [],
        pagination: {
            currentPage: 1,
            hasMore: true,
            isPageLoading: false,
            totalPages: 1
        }
    },
    isChatLoading: false,
    users: {
        data: [],
        pagination: {
            currentPage: 1,
            hasMore: true,
            isPageLoading: false,
            totalPages: 1
        }
    },
    selectedUser: null,
    isUsersLoading: false,

    getUsers: async (page = 1, limit = 12) => {
        const isInitialLoad = page === 1;

        if (isInitialLoad) {
            set({ isUsersLoading: true });
        } else {
            set(state => ({
                users: {
                    ...state.users,
                    pagination: {
                        ...state.users.pagination,
                        isPageLoading: true
                    }
                }
            }));
        }

        try {
            const res = await axiosInstance.get(`/messages/users?page=${page}&limit=${limit}`);
            const usersWithDefaultPFP = res.data.users.map(user => ({
                ...user,
                profilePic: user.profilePic === '' ? defaultPFP : user.profilePic
            }));

            set(state => ({
                users: {
                    data: isInitialLoad
                        ? usersWithDefaultPFP
                        : [...state.users.data, ...usersWithDefaultPFP],
                    pagination: {
                        currentPage: page,
                        hasMore: res.data.pagination?.hasMore || false,
                        isPageLoading: false,
                        totalPages: res.data.pagination?.totalPages || 1
                    }
                },
                isUsersLoading: false
            }));
        } catch (error) {
            set({
                isUsersLoading: false,
                users: {
                    ...get().users,
                    pagination: {
                        ...get().users.pagination,
                        isPageLoading: false
                    }
                }
            });
            toast.error(error.response?.data?.message || "Failed to fetch users");
        }
    },

    getMessages: async (userId, page = 1, limit = 50) => {
        const isInitialLoad = page === 1;

        if (isInitialLoad) {
            set({ isChatLoading: true });
        } else {
            set(state => ({
                messages: {
                    ...state.messages,
                    pagination: {
                        ...state.messages.pagination,
                        isPageLoading: true
                    }
                }
            }));
        }

        try {
            const res = await axiosInstance.get(`/messages/${userId}?page=${page}&limit=${limit}`);

            set(state => ({
                messages: {
                    data: isInitialLoad
                        ? res.data.messages
                        : [...res.data.messages, ...state.messages.data],
                    pagination: {
                        currentPage: page,
                        hasMore: res.data.pagination?.hasNextPage || false,
                        isPageLoading: false,
                        totalPages: res.data.pagination?.totalPages || 1
                    }
                },
                isChatLoading: false
            }));
        } catch (error) {
            set({
                isChatLoading: false,
                messages: {
                    ...get().messages,
                    pagination: {
                        ...get().messages.pagination,
                        isPageLoading: false
                    }
                }
            });
            toast.error(error.response?.data?.message || "Failed to load messages");
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set(state => ({
                messages: {
                    ...state.messages,
                    data: [...state.messages.data, res.data]
                }
            }));
        }
        catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
            console.error(error);
        }
    },

    setSelectedUser: (selectedUser) => {
        set({
            selectedUser,
            messages: {
                data: [],
                pagination: {
                    currentPage: 1,
                    hasMore: true,
                    totalPages: 1
                }
            }
        });
    }
}));