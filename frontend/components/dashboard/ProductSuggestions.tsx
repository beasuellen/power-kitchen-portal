"use client";

import { useState } from "react";
import { mockMeals, mockOrders, type Meal } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useOrderStore } from "@/lib/useOrderStore";
import { DietaryPills } from "@/components/ui/DietaryPills";
import { AddSwapPanel } from "@/components/meals/AddSwapPanel";
import { MealDetailModal } from "@/components/meals/MealDetailModal";
import Image from "next/image";
import { Plus, ChevronRight } from "lucide-react";

// 2 breakfast + 2 shakes + 2 desserts = 6 cards
const breakfastMeals = mockMeals.filter((m) => m.category === "breakfast").slice(0, 2);
const shakeMeals     = mockMeals.filter((m) => m.category === "shakes").slice(0, 2);
const dessertMeals   = mockMeals.filter((m) => m.category === "desserts").slice(0, 2);
const sliderMeals: Meal[] = [...breakfastMeals, ...shakeMeals, ...dessertMeals];

export function ProductSuggestions() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [preSelectedMeal, setPreSelectedMeal] = useState<Meal | null>(null);
  const [detailMeal, setDetailMeal] = useState<Meal | null>(null);
  const { addMeals } = useOrderStore();

  const nextOrder = mockOrders.find((o) => o.status === "customizable");

  const handleAdd = (mealsToAdd: Meal[]) => {
    addMeals(mealsToAdd);
    setPanelOpen(false);
    setPreSelectedMeal(null);
  };

  const openPanelWithMeal = (meal: Meal) => {
    setPreSelectedMeal(meal);
    setPanelOpen(true);
  };

  return (
    <>
      <section>
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-[#004945]">Have you tried our other products?</h2>
            <p className="text-xs text-[#9E9E9E] mt-0.5">Quick-add to your next order</p>
          </div>
        </div>

        {/* Single slider: 2 breakfast + 2 shakes + 2 snacks + "See all" card */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
          {sliderMeals.map((meal) => (
            <div
              key={meal.id}
              className="shrink-0 w-40 bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden flex flex-col"
            >
              <div className="relative h-28 shrink-0">
                <Image
                  src={meal.imageUrl}
                  alt={meal.name}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
              <div className="p-2.5 flex flex-col flex-1">
                <p className="text-xs font-semibold text-[#1A1A1A] leading-tight line-clamp-2">{meal.name}</p>
                <DietaryPills tags={meal.dietaryTags} className="mt-1.5" onSeeAll={() => setDetailMeal(meal)} />
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-xs font-bold text-[#004945]">{formatCurrency(meal.price)}</span>
                  {nextOrder && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openPanelWithMeal(meal); }}
                      className="w-6 h-6 rounded-full bg-[#004945] flex items-center justify-center hover:bg-[#003835] transition-colors"
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* "See all" card — last item in slider */}
          <div className="shrink-0 w-40 bg-[#FDFBF7] rounded-2xl border border-dashed border-[#B9EA91] overflow-hidden flex flex-col items-center justify-center gap-2 p-4 cursor-pointer hover:bg-[#EAF7D9] transition-colors"
            onClick={() => setPanelOpen(true)}
          >
            <div className="w-9 h-9 rounded-full bg-[#004945] flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs font-semibold text-[#004945] text-center">See all meals</p>
            <p className="text-[10px] text-[#9E9E9E] text-center">Browse full menu</p>
          </div>
        </div>
      </section>

      {panelOpen && (
        <AddSwapPanel
          mode="add"
          defaultCategories={["breakfast", "shakes", "desserts"]}
          hideMealsTab
          initialSelectedMeal={preSelectedMeal ?? undefined}
          onAdd={handleAdd}
          onSwap={() => {}}
          onClose={() => { setPanelOpen(false); setPreSelectedMeal(null); }}
        />
      )}

      {detailMeal && (
        <MealDetailModal
          meal={detailMeal}
          onClose={() => setDetailMeal(null)}
        />
      )}
    </>
  );
}
