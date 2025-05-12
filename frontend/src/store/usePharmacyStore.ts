import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const usePharmacyStore = create((set, get) => ({
    offeredMedicines: [],
    isOfferedMedicinesLoading: false,
    isCreatingMedicine: false,
    isDeletingMedicine: false,
    isUpdatingMedicine: false,

    getOfferedMedicines: async () => {
        try {
            set({ isOfferedMedicinesLoading: true });
            const res = await axiosInstance.get('/pharmacy/getMedicine/');

            set({
                offeredMedicines: res.data,
                isOfferedMedicinesLoading: false
            });
        } catch (error) {
            set({ isOfferedMedicinesLoading: false });
            toast.error(error.response?.data?.message || "Failed to fetch medicines data");
        }
    },

    createMedicine: async (medicineData) => {
        try {
            set({ isCreatingMedicine: true });
            const res = await axiosInstance.post('/pharmacy/createMedicine', medicineData);

            set((state) => ({
                isCreatingMedicine: false,
                offeredMedicines: [res.data, ...state.offeredMedicines]
            }));

            toast.success("Medicine created successfully");
        } catch (error) {
            set({ isCreatingMedicine: false });
            toast.error(error.response?.data?.message || "Failed to create medicine");
        }
    },

    deleteMedicine: async (medicineId: string) => {
        try {
            set({ isDeletingMedicine: true });

            await axiosInstance.delete(`/pharmacy/deleteMedicine/${medicineId}`);

            set((state) => ({
                offeredMedicines: state.offeredMedicines.filter(medicine => medicine._id !== medicineId),
                isDeletingMedicine: false
            }));

            toast.success('Medicine deleted successfully');
        } catch (error) {
            console.error('Failed to delete medicine:', error);
            set({ isDeletingMedicine: false });
            toast.error(error.response?.data?.message || 'Failed to delete medicine');
        }
    },

    updateMedicine: async (medicineId, updatedData) => {
        try {
            set({ isUpdatingMedicine: true });

            const response = await axiosInstance.put(
                `/pharmacy/updateMedicine/${medicineId}`,
                updatedData
            );

            set((state) => ({
                offeredMedicines: state.offeredMedicines.map(medicine =>
                    medicine._id === medicineId ? { ...medicine, ...response.data } : medicine
                ),
                isUpdatingMedicine: false
            }));

            toast.success('Medicine updated successfully');
        } catch (error) {
            console.error('Failed to update medicine:', error);
            set({ isUpdatingMedicine: false });
            toast.error(error.response?.data?.message || 'Failed to update medicine');
        }
    }
}));