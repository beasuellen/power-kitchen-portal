import { create } from "zustand";
import { mockSubscriptions } from "./mock-data";

interface SubscriptionStore {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  activeIndex: 0,
  setActiveIndex: (index) => set({ activeIndex: index }),
}));

export const getActiveSubscription = (index: number) => mockSubscriptions[index];
