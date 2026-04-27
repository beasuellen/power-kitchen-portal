"use client";

import { useState } from "react";
import { mockMeals, mockOrders, type Meal, type MealCategory } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { DietaryPills } from "@/components/ui/DietaryPills";
import { AddSwapPanel } from "@/components/meals/AddSwapPanel";
import Image from "next/image";
import { Plus, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs: { id: MealCategory; label: string; emoji: string }[] = [
  { id: "breakfast", label: "Breakfast",       emoji: "🌅" },
  { id: "shakes",    label: "Protein Shakes",   emoji: "🥤" },
  { id: "snacks",    label: "Snacks & Desserts", emoji: "🍫" },
];

export function ProductSuggestions() {
  const [activeTab, setActiveTab] = useState<MealCategory>("breakfast");
  const [panelOpen, setPanelOpen] = useState(false);

  const nextOrder = mockOrders.find((o) => o.status === "customizable");
  const meals = mockMeals.filter((m) => m.category === activeTab);

  const handleAdd = (meals: Meal[]) => {
    console.log("Adding to order:", meals.map((m) => m.name));
    setPanelOpen(false);
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
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-0.5 text-xs text-[#004945] font-medium hover:underline shrink-0"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category tabs — all in one row */}
        <div className="flex gap-2 mb-3">
          {tabs.map(({ id, label, emoji }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all shrink-0",
                activeTab === id
                  ? "bg-[#004945] text-white border-[#004945]"
                  : "bg-white text-[#6B6B6B] border-[#E8E4DC] hover:border-[#B9EA91] hover:text-[#004945]"
              )}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Single carousel for active category */}
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
                    <span className="bg-[#7ED22A] text-[#004945] text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
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
                      onClick={() => setPanelOpen(true)}
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
      </section>

      {/* Panel opens filtered to active category */}
      {panelOpen && (
        <AddSwapPanel
          mode="add"
          defaultCategory={activeTab}
          onAdd={handleAdd}
          onSwap={() => {}}
          onClose={() => setPanelOpen(false)}
        />
      )}
    </>
  );
}
