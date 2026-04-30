import { create } from "zustand";
import { mockOrders, type Meal, type OrderItem } from "@/lib/mock-data";

export interface DraftItem extends OrderItem {}

interface OrderStore {
  /** Items of the next customizable order */
  draftItems: DraftItem[];
  /** Whether the next order has been skipped */
  orderSkipped: boolean;

  // ── Meal actions ──────────────────────────────────────────────────
  addMeals: (meals: Meal[]) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  swapMeal: (itemId: string, newMeal: Meal) => void;
  /** Full replace — called after saving on order detail */
  syncItems: (items: DraftItem[]) => void;

  // ── Skip actions ──────────────────────────────────────────────────
  skipOrder: () => void;
  unskipOrder: () => void;

  reset: () => void;
}

const nextOrder = mockOrders.find((o) => o.status === "customizable");
const initialItems: DraftItem[] = nextOrder ? nextOrder.items.map((i) => ({ ...i })) : [];

export const useOrderStore = create<OrderStore>((set) => ({
  draftItems: initialItems,
  orderSkipped: false,

  addMeals: (meals) =>
    set((state) => {
      // Count occurrences per meal ID — AddSwapPanel sends [meal, meal, meal] for qty=3
      const counts = new Map<string, { meal: Meal; count: number }>();
      for (const meal of meals) {
        const entry = counts.get(meal.id);
        if (entry) entry.count++;
        else counts.set(meal.id, { meal, count: 1 });
      }

      const updated = state.draftItems.map((i) => ({ ...i }));
      for (const { meal, count } of counts.values()) {
        const existing = updated.find((i) => i.meal.id === meal.id);
        if (existing) {
          existing.quantity += count;
        } else {
          updated.push({
            id: `draft_${Math.random().toString(36).slice(2)}`,
            meal,
            quantity: count,
            unitPrice: meal.price,
          });
        }
      }
      return { draftItems: updated };
    }),

  removeItem: (itemId) =>
    set((state) => ({
      draftItems: state.draftItems.filter((i) => i.id !== itemId),
    })),

  updateQuantity: (itemId, delta) =>
    set((state) => ({
      draftItems: state.draftItems
        .map((i) => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
        .filter((i) => i.quantity > 0),
    })),

  swapMeal: (itemId, newMeal) =>
    set((state) => ({
      draftItems: state.draftItems.map((i) =>
        i.id === itemId ? { ...i, meal: newMeal, unitPrice: newMeal.price } : i
      ),
    })),

  syncItems: (items) => set({ draftItems: items }),

  skipOrder: () => set({ orderSkipped: true }),
  unskipOrder: () => set({ orderSkipped: false }),

  reset: () => set({ draftItems: initialItems, orderSkipped: false }),
}));
