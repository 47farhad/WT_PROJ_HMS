import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const saveCartToStorage = (cartItems) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
};

const loadCartFromStorage = () => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
};

export const useCartStore = create((set, get) => ({
    cartItems: loadCartFromStorage(),
    isCreatingOrder: false,
    orders: {
        data: [],
        pagination: {
            currentPage: 1,
            hasMore: false,
            isPageLoading: false,
            totalPages: 1
        }
    },
    isOrdersLoading: false,
    detailedOrder: null,
    isLoadingDetailedOrder: false,

    addToCart: (medicineId) => {
        const items = get().cartItems;
        const existing = items.find(item => item.medicine === medicineId);

        const updated = existing
            ? items.map(item =>
                item.medicine === medicineId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
            : [...items, { medicine: medicineId, quantity: 1 }];

        saveCartToStorage(updated);
        set({ cartItems: updated });
    },

    removeFromCart: (medicineId) => {
        const updated = get().cartItems.filter(item => item.medicine !== medicineId);
        saveCartToStorage(updated);
        set({ cartItems: updated });
    },

    increaseQuantity: (medicineId) => {
        const updated = get().cartItems.map(item =>
            item.medicine === medicineId
                ? { ...item, quantity: item.quantity + 1 }
                : item
        );
        saveCartToStorage(updated);
        set({ cartItems: updated });
    },

    decreaseQuantity: (medicineId) => {
        const items = get().cartItems.map(item =>
            item.medicine === medicineId
                ? { ...item, quantity: item.quantity - 1 }
                : item
        ).filter(item => item.quantity > 0);
        saveCartToStorage(items);
        set({ cartItems: items });
    },

    loadCartFromStorage: () => {
        const cart = loadCartFromStorage();
        set({ cartItems: cart });
    },

    handleOrder: async (items) => {
        try {
            set({ isCreatingOrder: true });
            const res = await axiosInstance.post('/order/createOrder', items)
            set({ isCreatingOrder: false });
            toast.success("Order created successfully. Please pay in the payments tab")
            saveCartToStorage([])
        }
        catch (error) {
            set({ isCreatingOrder: false });
            toast.error(error.response?.data?.message || "Failed to create order");
        }
    },

    getOrders: async (page = 1, limit = 20) => {
        const isInitialLoad = page === 1;

        if (isInitialLoad) {
            set({ isOrdersLoading: true });
        } else {
            set(state => ({
                orders: {
                    ...state.orders,
                    pagination: {
                        ...state.orders.pagination,
                        isPageLoading: true
                    }
                }
            }));
        }

        try {
            const res = await axiosInstance.get(`/order/getOrders?page=${page}&limit=${limit}`);

            set(state => ({
                orders: {
                    data: isInitialLoad
                        ? res.data.ordersData
                        : [...state.orders.data, ...res.data.ordersData],
                    pagination: {
                        currentPage: page,
                        hasMore: res.data.pagination?.hasMore || false,
                        isPageLoading: false,
                        totalPages: res.data.pagination?.totalPages || 1
                    }
                },
                isOrdersLoading: false
            }));
        } catch (error) {
            set({
                isOrdersLoading: false,
                orders: {
                    ...get().orders,
                    pagination: {
                        ...get().orders.pagination,
                        isPageLoading: false
                    }
                }
            });
            toast.error(error.response?.data?.message || "Failed to fetch orders");
        }
    },

    getOrderDetails: async (orderId: string) => {
        try {
            set({ isLoadingDetailedOrder: true });

            const res = await axiosInstance.get(`/order/getOrder/${orderId}`);
            set({ detailedOrder: res.data, isLoadingDetailedOrder: false });
        }
        catch (error: any) {
            console.error("Failed to fetch order details:", error);
            set({
                isLoadingDetailedOrder: false,
                detailedOrder: null,
            });
            toast.error(error.response?.data?.message || "Failed to fetch order");
        }
    }
}));