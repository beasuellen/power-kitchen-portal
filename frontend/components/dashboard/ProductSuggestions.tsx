"use client";

import { useState } from "react";
import { mockMeals, mockOrders, type Meal, type MealCategory } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { DietaryPills } from "@/components/ui/DietaryPills";
import { AddSwapPanel } from "@/components/meals/AddSwapPanel";
import Image from "next/image";
import { Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const categoryConfig: {
  id: MealCategory;
  label: string;
  emoji: string;
  tagline: string;
}[] = [
  { id: "breakfast", label: "Breakfast",      emoji: "🌅", tagline: "Start your day right" },
  { id: "shakes",    label: "Protein Shakes",  emoji: "🥤", tagline: "Fuel your performance" },
  { id: "snacks",    label: "Snacks & Desserts", emoji: "🍫", tagline: "Guilt-free treats" },
];

export function ProductSuggestions() {
  const [openCategory, setOpenCategory] = useState<MealCategory | null>(null);

  // next customizable order for adding meals
  const nextOrder = mockOrders.find((o) => o.status === "customizable");

  const handleAdd = (meals: Meal[]) => {
    // In production this would call the BFF to add to draft
    console.log("Adding to order:", meals.map((m) => m.name));
    setOpenCategory(null);
  };

  return (
    <>
      <section className="space-y-5">
        {/* Section header */}
        <div>
          <h2 className="font-semibold text-[#004945]">Have you tried our other products?</h2>
          <p className="text-xs text-[#9E9E9E] mt-0.5">Quick-add to your next order</p>
        </div>

        {/* One row per category */}
        {categoryConfig.map(({ id, label, emoji, tagline }) => {
          const meals = mockMeals.filter((m) => m.category === id);
          if (meals.length === 0) return null;

          return (
            <div key={id}>
              {/* Category header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{label}</p>
                    <p className="text-[10px] text-[#9E9E9E]">{tagline}</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpenCategory(id)}
                  className="flex items-center gap-0.5 text-xs text-[#004945] font-medium hover:underline shrink-0"
                >
                  See all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Horizontal carousel */}
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
                {meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="shrink-0 w-40 bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden"
                  >
                    <div className="relative h-28">
                      <Image
                        src={meal.imageUrl}
                        alt={meal.name}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                      {meal.isNew && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-[#7ED22A] text-[#004945] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            New
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-[#1A1A1A] leading-tight line-clamp-2">{meal.name}</p>
                      <DietaryPills tags={meal.dietaryTags} className="mt-1.5" />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-[#004945]">{formatCurrency(meal.price)}</span>
                        {nextOrder && (
                          <button
                            onClick={() => setOpenCategory(id)}
                            className="w-6 h-6 rounded-full bg-[#004945] flex items-center justify-center hover:bg-[#003835] transition-colors"
                          >
                            <Plus className="w-3 h-3 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {/* Half-card reveal */}
                <div className="shrink-0 w-8" aria-hidden />
              </div>
            </div>
          );
        })}
      </section>

      {/* Side panel — opens filtered to the selected category */}
      {openCategory && (
        <AddSwapPanel
          mode="add"
          defaultCategory={openCategory}
          onAdd={handleAdd}
          onSwap={() => {}}
          onClose={() => setOpenCategory(null)}
        />
      )}
    </>
  );
}
