"use client";

import Image from "next/image";
import { X, Minus, Plus, Check, Info } from "lucide-react";
import { DietaryPills } from "@/components/ui/DietaryPills";
import { formatCurrency } from "@/lib/utils";
import type { Meal } from "@/lib/mock-data";

// ─── Mode union ────────────────────────────────────────────────────────────
// "order"  → meal already exists in the order; qty controls update the draft live
// "browse" → meal is being browsed/added from the Add Meals panel
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

// ─── Component ─────────────────────────────────────────────────────────────
export function MealDetailModal({ meal, mode, onClose }: MealDetailModalProps) {
  const qty =
    mode.type === "order" ? mode.qty : mode.selectedQty;

  const macroRows = [
    { label: "Calories (kcal)",         value: meal.calories },
    { label: "Protein (g)",              value: meal.protein },
    { label: "Carbohydrates (g)",        value: meal.carbs },
    { label: "Total Fats (g)",           value: meal.fat },
    { label: "Saturated Fats (g)",       value: meal.saturatedFat },
    { label: "Polyunsaturated fats (g)", value: meal.polyUnsaturatedFat },
    { label: "Fibre (g)",                value: meal.fiber },
    { label: "Sugar (g)",                value: meal.sugar },
    { label: "Cholesterol (mg)",         value: meal.cholesterol },
    { label: "Sodium (mg)",              value: meal.sodium },
    { label: "Net Carbs (g)",            value: meal.netCarbs },
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
        <div className="relative w-1/2 shrink-0 bg-[#1A1A1A]">
          <Image
            src={meal.imageUrl}
            alt={meal.name}
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>

        {/* ── Right: scrollable info ───────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Header */}
          <div className="px-5 py-4 border-b border-[#F0EBE0] flex items-start justify-between gap-3 shrink-0">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[#004945] text-base leading-snug">
                {meal.name}
              </h3>
              {meal.description && (
                <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                  {meal.description}
                </p>
              )}
              {meal.spiceLevel && meal.spiceLevel.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {meal.spiceLevel.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] font-semibold bg-red-50 border border-red-200 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-0.5"
                    >
                      🌶 {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0"
            >
              <X className="w-4 h-4 text-[#6B6B6B]" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

            {/* Dietary tags */}
            <DietaryPills tags={meal.dietaryTags} />

            {/* Ingredients */}
            {meal.ingredients && meal.ingredients.length > 0 && (
              <div>
                <p className="text-sm font-bold text-[#004945] mb-1.5">Ingredients</p>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  {meal.ingredients.join(", ")}.
                </p>
              </div>
            )}

            {/* Allergens */}
            {meal.allergens && meal.allergens.length > 0 && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <Info className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <p className="text-xs text-red-600">
                  <strong>Allergies:</strong> {meal.allergens.join(", ")}.
                </p>
              </div>
            )}

            {/* Macros table */}
            {macroRows.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-[#E8E4DC]">
                <div className="bg-[#7ED22A] px-4 py-2.5 text-center">
                  <p className="text-sm font-bold text-[#004945]">
                    Macros Information
                  </p>
                </div>
                <div className="divide-y divide-[#F0EBE0]">
                  {macroRows.map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center px-4 py-2.5"
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

            {/* Prep methods */}
            {meal.prepMethods && meal.prepMethods.length > 0 && (
              <div>
                <p className="text-sm font-bold text-[#004945] mb-3">
                  How to prepare
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {meal.prepMethods.map(({ method, instructions }) => (
                    <div key={method}>
                      <p className="text-xs font-bold text-[#7ED22A]">{method}</p>
                      <p className="text-[10px] text-[#6B6B6B] mt-0.5 leading-snug">
                        {instructions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Bottom action bar ─────────────────────────────── */}
          <div className="border-t border-[#F0EBE0] px-5 py-4 flex items-center gap-3 shrink-0 bg-white">

            {/* ORDER mode — meal already in the order */}
            {mode.type === "order" && (
              <>
                <div className="flex-1 bg-[#004945] text-white rounded-xl py-3 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    {qty}× in your order · {formatCurrency(meal.price * qty)}
                  </span>
                </div>
                <div className="flex items-center gap-2 border border-[#E8E4DC] rounded-xl px-3 py-2 shrink-0">
                  <button
                    onClick={() => mode.onQtyChange(mode.itemId, -1)}
                    disabled={qty <= 1}
                    className="disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4 text-[#6B6B6B]" />
                  </button>
                  <span className="text-sm font-bold text-[#004945] w-5 text-center">
                    {qty}
                  </span>
                  <button onClick={() => mode.onQtyChange(mode.itemId, 1)}>
                    <Plus className="w-4 h-4 text-[#6B6B6B]" />
                  </button>
                </div>
              </>
            )}

            {/* BROWSE mode — adding from the panel */}
            {mode.type === "browse" && (
              qty > 0 ? (
                <>
                  <button
                    onClick={mode.onToggle}
                    className="flex-1 bg-[#004945] text-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    <Check className="w-4 h-4" />
                    {qty} Added · {formatCurrency(meal.price * qty)}
                  </button>
                  <div className="flex items-center gap-2 border border-[#E8E4DC] rounded-xl px-3 py-2 shrink-0">
                    <button onClick={(e) => mode.onQtyChange(-1, e)}>
                      <Minus className="w-4 h-4 text-[#6B6B6B]" />
                    </button>
                    <span className="text-sm font-bold text-[#004945] w-5 text-center">
                      {qty}
                    </span>
                    <button onClick={(e) => mode.onQtyChange(1, e)}>
                      <Plus className="w-4 h-4 text-[#6B6B6B]" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={mode.onToggle}
                  className="flex-1 bg-[#004945] text-white rounded-xl py-3 text-sm font-semibold"
                >
                  Add to Order · {formatCurrency(meal.price)}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
