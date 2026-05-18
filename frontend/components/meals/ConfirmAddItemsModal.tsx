"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { Meal } from "@/lib/mock-data";
import type { AddMealEntry } from "@/lib/useOrderStore";

interface ConfirmAddItemsModalProps {
  items: { meal: Meal; qty: number }[];
  onConfirm: (entries: AddMealEntry[]) => void;
  onCancel: () => void;
}

type OrderType = 'one-time' | 'recurring';

function RadioBullet({ selected }: { selected: boolean }) {
  return (
    <span className={cn(
      "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
      selected ? "border-[#004945]" : "border-[#C4C4C4]"
    )}>
      {selected && <span className="w-2 h-2 rounded-full bg-[#004945]" />}
    </span>
  );
}

export function ConfirmAddItemsModal({ items, onConfirm, onCancel }: ConfirmAddItemsModalProps) {
  const [orderTypes, setOrderTypes] = useState<Record<string, OrderType>>(() =>
    Object.fromEntries(items.map(({ meal }) => [meal.id, 'one-time']))
  );

  const setAll = (type: OrderType) => {
    setOrderTypes(Object.fromEntries(items.map(({ meal }) => [meal.id, type])));
  };

  const toggle = (mealId: string, type: OrderType) => {
    setOrderTypes((prev) => ({ ...prev, [mealId]: type }));
  };

  const recurringCount = Object.values(orderTypes).filter((t) => t === 'recurring').length;
  const oneTimeCount = Object.values(orderTypes).filter((t) => t === 'one-time').length;
  const allRecurring = recurringCount === items.length;
  const allOneTime = oneTimeCount === items.length;

  const handleConfirm = () => {
    const entries: AddMealEntry[] = items.map(({ meal, qty }) => ({
      meal,
      qty,
      orderType: orderTypes[meal.id] ?? 'one-time',
    }));
    onConfirm(entries);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E8E4DC] flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-3 shrink-0 border-b border-[#F0EBE0]">
          <div>
            <h3 className="font-bold text-[#004945] text-base">Review items before adding</h3>
            <p className="text-xs text-[#9E9E9E] mt-0.5">
              Choose whether each item applies to this order only or all future orders
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-[#9E9E9E]" />
          </button>
        </div>

        {/* Global set-all bar */}
        <div className="px-6 py-3 flex items-center justify-between shrink-0 border-b border-[#F0EBE0] bg-[#FDFBF7]">
          <span className="text-xs text-[#9E9E9E] font-medium">Apply to all items:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setAll('one-time')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                allOneTime
                  ? "bg-[#004945] text-white border-[#004945]"
                  : "bg-white border-[#E8E4DC] text-[#6B6B6B] hover:border-[#004945] hover:text-[#004945]"
              )}
            >
              One-time order
            </button>
            <button
              onClick={() => setAll('recurring')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                allRecurring
                  ? "bg-[#004945] text-white border-[#004945]"
                  : "bg-white border-[#E8E4DC] text-[#6B6B6B] hover:border-[#004945] hover:text-[#004945]"
              )}
            >
              Add to all orders
            </button>
          </div>
        </div>

        {/* Table header */}
        <div className="px-6 py-2 grid grid-cols-[1fr_40px_64px_auto] gap-3 items-center shrink-0">
          <span className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-wider">Item</span>
          <span className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-wider text-center">Qty</span>
          <span className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-wider text-right">Price</span>
          <span className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-wider text-right pr-1">Delivery</span>
        </div>

        {/* Item rows */}
        <div className="overflow-y-auto flex-1 min-h-0 px-6">
          <div className="divide-y divide-[#F0EBE0]">
            {items.map(({ meal, qty }) => {
              const type = orderTypes[meal.id] ?? 'one-time';

              return (
                <div key={meal.id} className="py-3.5 grid grid-cols-[1fr_40px_64px_auto] gap-3 items-center">

                  {/* Item info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F0EBE0] shrink-0">
                      <Image
                        src={meal.imageUrl}
                        alt={meal.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <p className="text-sm font-medium text-[#1A1A1A] truncate leading-snug">{meal.name}</p>
                  </div>

                  {/* Qty */}
                  <span className="text-sm text-[#6B6B6B] text-center">{qty}×</span>

                  {/* Price */}
                  <span className="text-sm font-semibold text-[#1A1A1A] text-right">
                    {formatCurrency(qty * meal.price)}
                  </span>

                  {/* Radio selector */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => toggle(meal.id, 'one-time')}
                      className="flex items-center gap-1.5 group"
                    >
                      <RadioBullet selected={type === 'one-time'} />
                      <span className={cn(
                        "text-xs whitespace-nowrap transition-colors",
                        type === 'one-time' ? "font-semibold text-[#004945]" : "text-[#9E9E9E] group-hover:text-[#6B6B6B]"
                      )}>
                        One-time
                      </span>
                    </button>
                    <button
                      onClick={() => toggle(meal.id, 'recurring')}
                      className="flex items-center gap-1.5 group"
                    >
                      <RadioBullet selected={type === 'recurring'} />
                      <span className={cn(
                        "text-xs whitespace-nowrap transition-colors",
                        type === 'recurring' ? "font-semibold text-[#004945]" : "text-[#9E9E9E] group-hover:text-[#6B6B6B]"
                      )}>
                        Recurring
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pt-4 pb-6 border-t border-[#F0EBE0] mt-2 shrink-0">
          {/* Summary */}
          <p className="text-xs text-[#9E9E9E] mb-4">
            {oneTimeCount > 0 && (
              <span className="font-semibold text-[#1A1A1A]">{oneTimeCount} one-time</span>
            )}
            {oneTimeCount > 0 && recurringCount > 0 && <span> · </span>}
            {recurringCount > 0 && (
              <span className="font-semibold text-[#1A1A1A]">{recurringCount} recurring</span>
            )}
            <span> will be added to your order</span>
          </p>

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
