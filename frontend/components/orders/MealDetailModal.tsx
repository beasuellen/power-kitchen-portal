"use client";

import { X, Minus, Plus } from "lucide-react";
import Image from "next/image";
import type { OrderItem } from "@/lib/mock-data";
import { DietaryPills } from "@/components/ui/DietaryPills";
import { formatCurrency } from "@/lib/utils";

interface MealDetailModalProps {
  item: OrderItem;
  isEditable: boolean;
  onClose: () => void;
  onQuantityChange: (itemId: string, delta: number) => void;
}

export function MealDetailModal({
  item,
  isEditable,
  onClose,
  onQuantityChange,
}: MealDetailModalProps) {
  const { meal, quantity, unitPrice, id } = item;

  const macros = [
    { label: "Calories", value: meal.calories, unit: "kcal" },
    { label: "Protein",  value: meal.protein,  unit: "g"    },
    { label: "Carbs",    value: meal.carbs,     unit: "g"    },
    { label: "Fat",      value: meal.fat,       unit: "g"    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left: image ─────────────────────────────────────────────── */}
        <div className="relative w-full sm:w-[44%] h-60 sm:h-auto shrink-0">
          <Image
            src={meal.imageUrl}
            alt={meal.name}
            fill
            className="object-cover"
            sizes="(max-width:640px) 100vw, 44vw"
          />
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center sm:hidden"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* ── Right: details ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Desktop close */}
          <div className="hidden sm:flex justify-end px-5 pt-4">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#F0EBE0] transition-colors"
            >
              <X className="w-4 h-4 text-[#9E9E9E]" />
            </button>
          </div>

          <div className="px-5 pb-6 space-y-4 flex-1 flex flex-col sm:pt-1 pt-5">
            {/* Name + tags */}
            <div>
              <h2 className="text-xl font-bold text-[#004945] leading-tight">
                {meal.name}
              </h2>
              <DietaryPills tags={meal.dietaryTags} className="mt-2" />
            </div>

            {/* Macros grid */}
            <div className="grid grid-cols-4 gap-2">
              {macros.map(({ label, value, unit }) => (
                <div
                  key={label}
                  className="bg-[#FDFBF7] border border-[#F0EBE0] rounded-xl p-2.5 text-center"
                >
                  <p className="text-sm font-bold text-[#004945]">{value}</p>
                  <p className="text-[9px] text-[#9E9E9E] uppercase tracking-wide leading-none mt-0.5">
                    {unit}
                  </p>
                  <p className="text-[9px] text-[#6B6B6B] mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {meal.description && (
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                {meal.description}
              </p>
            )}

            {/* Extra macros row */}
            {(meal.fiber !== undefined || meal.sodium !== undefined) && (
              <div className="flex gap-3 text-[10px] text-[#9E9E9E]">
                {meal.fiber    !== undefined && <span>Fiber <strong className="text-[#6B6B6B]">{meal.fiber}g</strong></span>}
                {meal.sugar    !== undefined && <span>Sugar <strong className="text-[#6B6B6B]">{meal.sugar}g</strong></span>}
                {meal.sodium   !== undefined && <span>Sodium <strong className="text-[#6B6B6B]">{meal.sodium}mg</strong></span>}
                {meal.netCarbs !== undefined && <span>Net carbs <strong className="text-[#6B6B6B]">{meal.netCarbs}g</strong></span>}
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-[#004945]">
                {formatCurrency(unitPrice)}
              </span>
              {quantity > 1 && (
                <span className="text-xs text-[#9E9E9E]">
                  {formatCurrency(unitPrice * quantity)} total
                </span>
              )}
            </div>

            {/* Quantity controls + "added" indicator */}
            {isEditable ? (
              <div className="flex items-center gap-3">
                {/* Stepper */}
                <div className="flex items-center gap-2 border border-[#E8E4DC] rounded-xl px-3 py-2 shrink-0">
                  <button
                    onClick={() => onQuantityChange(id, -1)}
                    disabled={quantity <= 1}
                    className="w-7 h-7 rounded-full border border-[#E8E4DC] flex items-center justify-center hover:bg-[#F0EBE0] disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3 h-3 text-[#6B6B6B]" />
                  </button>
                  <span className="text-sm font-bold text-[#1A1A1A] min-w-[1.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => onQuantityChange(id, 1)}
                    className="w-7 h-7 rounded-full border border-[#E8E4DC] flex items-center justify-center hover:bg-[#F0EBE0] transition-colors"
                  >
                    <Plus className="w-3 h-3 text-[#6B6B6B]" />
                  </button>
                </div>

                {/* "Added" pill */}
                <div className="flex-1 py-2.5 bg-[#EAF7D9] border border-[#B9EA91] rounded-xl text-center">
                  <p className="text-xs font-semibold text-[#004945]">
                    ✓ {quantity}× meal added to your order
                  </p>
                </div>
              </div>
            ) : (
              /* Read-only quantity badge */
              <div className="py-2.5 bg-[#FDFBF7] border border-[#F0EBE0] rounded-xl text-center">
                <p className="text-xs text-[#6B6B6B]">
                  {quantity}× in this order
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
