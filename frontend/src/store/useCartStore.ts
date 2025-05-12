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
            set({isCreatingOrder: true});
            const res = await axiosInstance.post('/order/createOrder', items)
            set({isCreatingOrder: false});
            toast.success("Order created successfully. Please pay in the payments tab")
        }
        catch (error) {
            set({isCreatingOrder: false});
            toast.error(error.response?.data?.message || "Failed to create order");
        }
    }
}));