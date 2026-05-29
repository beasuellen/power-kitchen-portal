"use client";

import Image from "next/image";
import { X, Info, Flame } from "lucide-react";
import { DietaryPills } from "@/components/ui/DietaryPills";
import type { Meal } from "@/lib/mock-data";
import { defaultMealPrepMethods } from "@/lib/mock-data";

interface MealDetailModalProps {
  meal: Meal;
  onClose: () => void;
}

const spiceLevelColors: Record<string, string> = {
  Mild:        "bg-amber-50 border-amber-200 text-amber-700",
  Medium:      "bg-orange-50 border-orange-200 text-orange-700",
  Hot:         "bg-red-50 border-red-200 text-red-600",
  "Extra Hot": "bg-red-100 border-red-300 text-red-700",
};

export function MealDetailModal({ meal, onClose }: MealDetailModalProps) {
  const allMacros = [
    { label: "Calories (kcal)",           value: meal.calories },
    { label: "Protein (g)",               value: meal.protein },
    { label: "Carbohydrates (g)",         value: meal.carbs },
    { label: "Total Fats (g)",            value: meal.fat },
    { label: "Saturated Fats (g)",        value: meal.saturatedFat },
    { label: "Polyunsaturated fats (g)",  value: meal.polyUnsaturatedFat },
    { label: "Fibre (g)",                 value: meal.fiber },
    { label: "Sugar (g)",                 value: meal.sugar },
    { label: "Cholesterol (mg)",          value: meal.cholesterol },
    { label: "Sodium (mg)",               value: meal.sodium },
    { label: "Net Carbs",                 value: meal.netCarbs },
  ].filter(({ value }) => value !== undefined);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full shadow-2xl overflow-hidden flex flex-col sm:flex-row"
        style={{ maxWidth: 960, maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Image: top on mobile, left column on desktop ── */}
        <div className="relative w-full h-52 shrink-0 bg-[#1A1A1A] sm:w-1/2 sm:h-auto">
          <Image
            src={meal.imageUrl}
            alt={meal.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
          {/* Mobile close button over image */}
          <button
            onClick={onClose}
            className="sm:hidden absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* ── Content column ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Fixed header */}
          <div className="px-5 pt-5 pb-4 border-b border-[#F0EBE0] shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#004945] text-base leading-snug">
                  {meal.name}
                </h3>
                {meal.description && (
                  <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                    {meal.description}
                  </p>
                )}
              </div>
              {/* Desktop-only close button (mobile uses the one over the image) */}
              <button
                onClick={onClose}
                className="hidden sm:block p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>

            {meal.spiceLevel && meal.spiceLevel.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {meal.spiceLevel.map((s) => {
                  const colorClass = spiceLevelColors[s] ?? "bg-red-50 border-red-200 text-red-600";
                  return (
                    <span
                      key={s}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold border px-2 py-0.5 rounded-full ${colorClass}`}
                    >
                      <Flame className="w-2.5 h-2.5" />
                      {s}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

            {meal.ingredients && meal.ingredients.length > 0 && (
              <div>
                <p className="text-xs font-bold text-[#004945] mb-1.5">Ingredients</p>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  {meal.ingredients.join(", ")}.
                </p>
              </div>
            )}

            {meal.allergens && meal.allergens.length > 0 && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                <Info className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <p className="text-xs text-red-700 leading-relaxed">
                  <span className="font-semibold">Allergies:</span>{" "}
                  {meal.allergens.join(", ")}.
                </p>
              </div>
            )}

            {meal.dietaryTags && meal.dietaryTags.length > 0 && (
              <DietaryPills tags={meal.dietaryTags} variant="full" />
            )}

            {allMacros.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-[#E0EDD0]">
                <div className="bg-[#D6F0A8] px-4 py-2.5 text-center">
                  <p className="text-xs font-bold text-[#004945]">Macros Information</p>
                </div>
                <div className="divide-y divide-[#F0EBE0]">
                  {allMacros.map(({ label, value }, i) => (
                    <div
                      key={label}
                      className={`flex justify-between items-center px-4 py-2.5 ${
                        i % 2 === 0 ? "bg-white" : "bg-[#FDFBF7]"
                      }`}
                    >
                      <span className="text-xs text-[#6B6B6B]">{label}</span>
                      <span className="text-xs font-semibold text-[#1A1A1A]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {((meal.prepMethods && meal.prepMethods.length > 0) || defaultMealPrepMethods.length > 0) && (
              <div>
                <p className="text-xs font-bold text-[#004945] mb-2.5">How to prepare</p>
                <div className="grid grid-cols-3 gap-2">
                  {(meal.prepMethods ?? defaultMealPrepMethods).map(({ method, instructions }) => (
                    <div
                      key={method}
                      className="bg-[#FDFBF7] border border-[#F0EBE0] rounded-xl px-3 py-2.5"
                    >
                      <p className="text-[11px] font-bold text-[#7ED22A] mb-1">{method}</p>
                      <p className="text-[11px] text-[#6B6B6B] leading-snug">{instructions}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="h-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
