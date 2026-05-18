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

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
        on ? "bg-[#7ED22A]" : "bg-[#D4D4D4]"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          on ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

export function ConfirmAddItemsModal({ items, onConfirm, onCancel }: ConfirmAddItemsModalProps) {
  // false = one-time (default), true = add to all orders
  const [allOrders, setAllOrders] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map(({ meal }) => [meal.id, false]))
  );

  const setAllItems = (value: boolean) => {
    setAllOrders(Object.fromEntries(items.map(({ meal }) => [meal.id, value])));
  };

  const toggle = (mealId: string, value: boolean) => {
    setAllOrders((prev) => ({ ...prev, [mealId]: value }));
  };

  const recurringCount = Object.values(allOrders).filter(Boolean).length;
  const oneTimeCount = items.length - recurringCount;
  const allOn = recurringCount === items.length;

  const handleConfirm = () => {
    const entries: AddMealEntry[] = items.map(({ meal, qty }) => ({
      meal,
      qty,
      orderType: allOrders[meal.id] ? 'recurring' : 'one-time',
    }));
    onConfirm(entries);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E8E4DC] flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-3 shrink-0">
          <div>
            <h3 className="font-bold text-[#1A1A1A] text-lg leading-snug">Review items before adding</h3>
            <p className="text-sm text-[#9E9E9E] mt-1">
              Toggle on to add an item to all future orders
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0 mt-0.5"
          >
            <X className="w-4 h-4 text-[#9E9E9E]" />
          </button>
        </div>

        {/* "Add all orders" global action */}
        <div className="px-6 pb-3 flex items-center justify-end shrink-0">
          <button
            onClick={() => setAllItems(!allOn)}
            className="text-sm font-medium text-[#004945] hover:underline transition-all"
          >
            {allOn ? "Set all as one-time" : "Add all to future orders"}
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-[#F0EBE0] shrink-0" />

        {/* Item rows */}
        <div className="overflow-y-auto flex-1 min-h-0">
          <div className="divide-y divide-[#F0EBE0]">
            {items.map(({ meal, qty }) => {
              const isOn = allOrders[meal.id] ?? false;

              return (
                <div key={meal.id} className="flex items-center gap-4 px-6 py-4">

                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#F0EBE0] shrink-0">
                    <Image
                      src={meal.imageUrl}
                      alt={meal.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">{meal.name}</p>
                    <p className="text-sm text-[#9E9E9E] mt-0.5">
                      {qty}× · {formatCurrency(qty * meal.price)}
                    </p>
                  </div>

                  {/* Toggle */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <Toggle on={isOn} onChange={(v) => toggle(meal.id, v)} />
                    <span className="text-[10px] font-medium text-[#9E9E9E] whitespace-nowrap">
                      {isOn ? "All orders" : "One-time"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#F0EBE0] shrink-0" />

        {/* Footer */}
        <div className="px-6 pt-4 pb-6 shrink-0">
          <p className="text-sm text-[#9E9E9E] mb-4">
            {oneTimeCount > 0 && <span className="font-semibold text-[#1A1A1A]">{oneTimeCount} one-time</span>}
            {oneTimeCount > 0 && recurringCount > 0 && <span> · </span>}
            {recurringCount > 0 && <span className="font-semibold text-[#1A1A1A]">{recurringCount} recurring</span>}
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
