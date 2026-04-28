import { create } from "zustand";
import { mockOrders, type Meal, type OrderItem } from "@/lib/mock-data";

interface DraftItem extends OrderItem {}

interface OrderStore {
  // items for the next customizable order (starts from mock, can grow)
  draftItems: DraftItem[];
  addMeals: (meals: Meal[]) => void;
  removeItem: (itemId: string) => void;
  syncItems: (items: DraftItem[]) => void;
  reset: () => void;
}

const nextOrder = mockOrders.find((o) => o.status === "customizable");
const initialItems: DraftItem[] = nextOrder ? nextOrder.items.map((i) => ({ ...i })) : [];

export const useOrderStore = create<OrderStore>((set) => ({
  draftItems: initialItems,

  addMeals: (meals) =>
    set((state) => {
      const newItems: DraftItem[] = meals.map((meal) => ({
        id: `draft_${Math.random().toString(36).slice(2)}`,
        meal,
        quantity: 1,
        unitPrice: meal.price,
      }));
      return { draftItems: [...state.draftItems, ...newItems] };
    }),

  removeItem: (itemId) =>
    set((state) => ({
      draftItems: state.draftItems.filter((i) => i.id !== itemId),
    })),

  syncItems: (items) => set({ draftItems: items }),

  reset: () => set({ draftItems: initialItems }),
}));
