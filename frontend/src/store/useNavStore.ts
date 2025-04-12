import { create } from "zustand";

export const useNavStore = create((set) => ({
    selectedNavPage: String,

    setSelectedNavPage: (page: string) => {
        set({selectedNavPage: page});
    }
}));