import { create } from "zustand";
import { mockOrders, mockSubscription, type Meal, type OrderItem, type DietaryTag } from "@/lib/mock-data";

export interface DraftItem extends OrderItem {}

export interface AddMealEntry {
  meal: Meal;
  qty: number;
  orderType: 'one-time' | 'recurring';
}

interface OrderStore {
  /** Items of the next customizable order */
  draftItems: DraftItem[];
  /** Whether the next order has been skipped */
  orderSkipped: boolean;
  /** Global dietary restrictions — shared across order detail modal and My Plan page */
  globalRestrictions: DietaryTag[];

  // ── Meal actions ──────────────────────────────────────────────────
  addMeals: (entries: AddMealEntry[]) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  swapMeal: (itemId: string, newMeal: Meal) => void;
  /** Full replace — called after saving on order detail */
  syncItems: (items: DraftItem[]) => void;

  // ── Skip actions ──────────────────────────────────────────────────
  skipOrder: () => void;
  unskipOrder: () => void;

  // ── Restrictions ──────────────────────────────────────────────────
  setGlobalRestrictions: (tags: DietaryTag[]) => void;

  reset: () => void;
}

const nextOrder = mockOrders.find((o) => o.status === "customizable");
const initialItems: DraftItem[] = nextOrder ? nextOrder.items.map((i) => ({ ...i })) : [];
const initialRestrictions = [...mockSubscription.dietaryRestrictions] as DietaryTag[];

export const useOrderStore = create<OrderStore>((set) => ({
  draftItems: initialItems,
  orderSkipped: false,
  globalRestrictions: initialRestrictions,

  addMeals: (entries) =>
    set((state) => {
      const updated = state.draftItems.map((i) => ({ ...i }));
      for (const { meal, qty, orderType } of entries) {
        const existing = updated.find((i) => i.meal.id === meal.id);
        if (existing) {
          existing.quantity += qty;
        } else {
          updated.push({
            id: `draft_${Math.random().toString(36).slice(2)}`,
            meal,
            quantity: qty,
            unitPrice: meal.price,
            orderType,
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

  setGlobalRestrictions: (tags) => set({ globalRestrictions: tags }),

  reset: () => set({ draftItems: initialItems, orderSkipped: false, globalRestrictions: initialRestrictions }),
}));
