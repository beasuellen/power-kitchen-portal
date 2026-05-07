"use client";

import Image from "next/image";
import { X, Minus, Plus, Check, Info, Flame } from "lucide-react";
import { DietaryPills } from "@/components/ui/DietaryPills";
import { formatCurrency } from "@/lib/utils";
import type { Meal } from "@/lib/mock-data";
import { defaultMealPrepMethods } from "@/lib/mock-data";

// ─── Mode union ────────────────────────────────────────────────────────────
export type MealDetailMode =
  | {
      type: "order";
      itemId: string;
      qty: number;
      onQtyChange: (itemId: string, delta: number) => void;
    }
  | {
      type: "browse";
      selectedQty: number;
      onToggle: () => void;
      onQtyChange: (delta: number, e?: React.MouseEvent) => void;
    };

interface MealDetailModalProps {
  meal: Meal;
  mode: MealDetailMode;
  onClose: () => void;
}

const spiceLevelColors: Record<string, string> = {
  Mild:        "bg-amber-50 border-amber-200 text-amber-700",
  Medium:      "bg-orange-50 border-orange-200 text-orange-700",
  Hot:         "bg-red-50 border-red-200 text-red-600",
  "Extra Hot": "bg-red-100 border-red-300 text-red-700",
};

// ─── Component ─────────────────────────────────────────────────────────────
export function MealDetailModal({ meal, mode, onClose }: MealDetailModalProps) {
  const qty = mode.type === "order" ? mode.qty : mode.selectedQty;

  // All macro rows in display order (matches design)
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
        className="bg-white rounded-2xl w-full shadow-2xl overflow-hidden flex"
        style={{ maxWidth: 960, height: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left: image ─────────────────────────────────── */}
        <div className="relative w-1/2 shrink-0 bg-[#1A1A1A] hidden sm:block">
          <Image
            src={meal.imageUrl}
            alt={meal.name}
            fill
            className="object-cover"
            sizes="50vw"
          />
          {/* Qty badge — top-left of image, updates live */}
          {qty > 0 && (
            <div className="absolute top-3 left-3 bg-[#004945]/90 backdrop-blur-sm text-white rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-lg">
              <div className="w-5 h-5 rounded-full bg-[#7ED22A] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-[#004945] leading-none">{qty}</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xs font-bold">{qty}&times; in order</span>
                <span className="text-[10px] text-white/70 mt-0.5">{formatCurrency(meal.price * qty)}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: content column ───────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* ── Fixed header ── */}
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
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>

            {/* Spice level badges */}
            {meal.spiceLevel && meal.spiceLevel.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {meal.spiceLevel.map((s) => {
                  const colorClass = spiceLevelColors[s] ?? "bg-red-50 border-red-200 text-red-600";
                  return (
                    <span
                      key={s}
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold border px-2 py-0.5 rounded-full ${colorClass}`}
                    >
                      <Flame className="w-2.5 h-2.5" />
                      {s}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Scrollable body ── */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

            {/* Ingredients */}
            {meal.ingredients && meal.ingredients.length > 0 && (
              <div>
                <p className="text-xs font-bold text-[#004945] mb-1.5">
                  Ingredients
                </p>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  {meal.ingredients.join(", ")}.
                </p>
              </div>
            )}

            {/* Allergens */}
            {meal.allergens && meal.allergens.length > 0 && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                <Info className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <p className="text-xs text-red-700 leading-relaxed">
                  <span className="font-semibold">Allergies:</span>{" "}
                  {meal.allergens.join(", ")}.
                </p>
              </div>
            )}

            {/* Dietary restriction pills */}
            {meal.dietaryTags && meal.dietaryTags.length > 0 && (
              <DietaryPills tags={meal.dietaryTags} variant="full" />
            )}

            {/* ── Macros Information table ── */}
            {allMacros.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-[#E0EDD0]">
                {/* Table header */}
                <div className="bg-[#D6F0A8] px-4 py-2.5 text-center">
                  <p className="text-xs font-bold text-[#004945]">
                    Macros Information
                  </p>
                </div>
                {/* Rows */}
                <div className="divide-y divide-[#F0EBE0]">
                  {allMacros.map(({ label, value }, i) => (
                    <div
                      key={label}
                      className={`flex justify-between items-center px-4 py-2.5 ${
                        i % 2 === 0 ? "bg-white" : "bg-[#FDFBF7]"
                      }`}
                    >
                      <span className="text-xs text-[#6B6B6B]">{label}</span>
                      <span className="text-xs font-semibold text-[#1A1A1A]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── How to prepare ── */}
            {((meal.prepMethods && meal.prepMethods.length > 0) || defaultMealPrepMethods.length > 0) && (
              <div>
                <p className="text-xs font-bold text-[#004945] mb-2.5">
                  How to prepare
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(meal.prepMethods ?? defaultMealPrepMethods).map(({ method, instructions }) => (
                    <div
                      key={method}
                      className="bg-[#FDFBF7] border border-[#F0EBE0] rounded-xl px-3 py-2.5"
                    >
                      <p className="text-[10px] font-bold text-[#7ED22A] mb-1">
                        {method}
                      </p>
                      <p className="text-[10px] text-[#6B6B6B] leading-snug">
                        {instructions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom padding so last content clears the sticky bar */}
            <div className="h-2" />
          </div>

          {/* ── Sticky bottom action bar ─────────────────────── */}
          <div className="border-t border-[#F0EBE0] px-5 py-4 flex items-center gap-3 shrink-0 bg-white">

            {/* ORDER mode */}
            {mode.type === "order" && (
              <>
                {/* Stepper */}
                <div className="flex items-center gap-2.5 border border-[#E8E4DC] rounded-xl px-3.5 py-2.5 shrink-0">
                  <button
                    onClick={() => mode.onQtyChange(mode.itemId, -1)}
                    disabled={qty <= 1}
                    className="disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4 text-[#6B6B6B]" />
                  </button>
                  <span className="text-sm font-bold text-[#004945] w-5 text-center">{qty}</span>
                  <button onClick={() => mode.onQtyChange(mode.itemId, 1)}>
                    <Plus className="w-4 h-4 text-[#6B6B6B]" />
                  </button>
                </div>
                {/* Add to cart */}
                <button
                  onClick={onClose}
                  className="flex-1 bg-[#004945] hover:bg-[#003835] text-white rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-semibold">Add to cart</span>
                </button>
              </>
            )}

            {/* BROWSE mode */}
            {mode.type === "browse" && (
              qty > 0 ? (
                <>
                  <button
                    onClick={mode.onToggle}
                    className="flex-1 bg-[#004945] text-white rounded-xl py-2.5 flex flex-col items-center justify-center gap-0.5"
                  >
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span className="text-sm font-semibold">{qty} Added</span>
                    </div>
                    <span className="text-xs text-white/70">{formatCurrency(meal.price * qty)}</span>
                  </button>
                  <div className="flex items-center gap-2.5 border border-[#E8E4DC] rounded-xl px-3.5 py-2.5 shrink-0">
                    <button onClick={(e) => mode.onQtyChange(-1, e)}>
                      <Minus className="w-4 h-4 text-[#6B6B6B]" />
                    </button>
                    <span className="text-sm font-bold text-[#004945] w-5 text-center">{qty}</span>
                    <button onClick={(e) => mode.onQtyChange(1, e)}>
                      <Plus className="w-4 h-4 text-[#6B6B6B]" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={mode.onToggle}
                  className="flex-1 bg-[#004945] text-white rounded-xl py-3 flex flex-col items-center justify-center gap-0.5"
                >
                  <span className="text-sm font-semibold">Add to Order</span>
                  <span className="text-xs text-white/70">{formatCurrency(meal.price)}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
