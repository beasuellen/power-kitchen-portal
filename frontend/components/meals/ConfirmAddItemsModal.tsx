"use client";

import { useState } from "react";
import Image from "next/image";
import { X, RefreshCw, Package } from "lucide-react";
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

export function ConfirmAddItemsModal({ items, onConfirm, onCancel }: ConfirmAddItemsModalProps) {
  const [orderTypes, setOrderTypes] = useState<Record<string, 'one-time' | 'recurring'>>(() =>
    Object.fromEntries(items.map(({ meal }) => [meal.id, 'recurring']))
  );

  const setAll = (type: 'one-time' | 'recurring') => {
    setOrderTypes(Object.fromEntries(items.map(({ meal }) => [meal.id, type])));
  };

  const toggle = (mealId: string, type: 'one-time' | 'recurring') => {
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
      orderType: orderTypes[meal.id] ?? 'recurring',
    }));
    onConfirm(entries);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E8E4DC] flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3 shrink-0">
          <div>
            <h3 className="font-bold text-[#004945] text-base">Confirmar itens adicionados</h3>
            <p className="text-xs text-[#9E9E9E] mt-0.5">
              Escolha se cada item é para este pedido ou para todos os próximos
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-[#9E9E9E]" />
          </button>
        </div>

        {/* Global action bar */}
        <div className="mx-6 mb-4 bg-[#F7F3EC] border border-[#E8E4DC] rounded-xl px-4 py-3 shrink-0">
          <p className="text-[11px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">
            Aplicar para todos
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setAll('recurring')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                allRecurring
                  ? "bg-[#EAF7D9] border-[#7ED22A] text-[#004945]"
                  : "bg-white border-[#E8E4DC] text-[#6B6B6B] hover:border-[#B9EA91] hover:text-[#004945]"
              )}
            >
              <RefreshCw className="w-3 h-3" />
              Todos recorrentes
            </button>
            <button
              onClick={() => setAll('one-time')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                allOneTime
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "bg-white border-[#E8E4DC] text-[#6B6B6B] hover:border-amber-300 hover:text-amber-700"
              )}
            >
              <Package className="w-3 h-3" />
              Todos pontuais
            </button>
          </div>
        </div>

        {/* Item list */}
        <div className="overflow-y-auto px-6 flex-1 min-h-0">
          <div className="space-y-3 pb-2">
            {items.map(({ meal, qty }) => {
              const type = orderTypes[meal.id] ?? 'recurring';
              const isRecurring = type === 'recurring';
              const isOneTime = type === 'one-time';

              return (
                <div
                  key={meal.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                    isRecurring
                      ? "border-[#B9EA91] bg-[#F7FDF0]"
                      : "border-amber-200 bg-amber-50/50"
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F0EBE0] shrink-0">
                    <Image
                      src={meal.imageUrl}
                      alt={meal.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">{meal.name}</p>
                    <p className="text-xs text-[#9E9E9E] mt-0.5">
                      {qty}× · {formatCurrency(qty * meal.price)}
                    </p>
                  </div>

                  {/* Toggle */}
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => toggle(meal.id, 'one-time')}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all whitespace-nowrap",
                        isOneTime
                          ? "bg-amber-100 border-amber-400 text-amber-800"
                          : "bg-white border-[#E8E4DC] text-[#9E9E9E] hover:border-amber-300 hover:text-amber-700"
                      )}
                    >
                      Uma vez
                    </button>
                    <button
                      onClick={() => toggle(meal.id, 'recurring')}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all whitespace-nowrap",
                        isRecurring
                          ? "bg-[#EAF7D9] border-[#7ED22A] text-[#004945]"
                          : "bg-white border-[#E8E4DC] text-[#9E9E9E] hover:border-[#B9EA91] hover:text-[#004945]"
                      )}
                    >
                      Recorrente
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary + actions */}
        <div className="px-6 pt-4 pb-6 border-t border-[#F0EBE0] mt-4 shrink-0">
          {/* Summary pill */}
          <div className="flex items-center gap-2 mb-4">
            {recurringCount > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-[#EAF7D9] border border-[#B9EA91] rounded-full text-[11px] font-semibold text-[#004945]">
                <RefreshCw className="w-2.5 h-2.5" />
                {recurringCount} recorrente{recurringCount !== 1 ? 's' : ''}
              </span>
            )}
            {oneTimeCount > 0 && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-semibold text-amber-700">
                <Package className="w-2.5 h-2.5" />
                {oneTimeCount} pontual{oneTimeCount !== 1 ? 'is' : ''}
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={onCancel}>
              Voltar
            </Button>
            <Button className="flex-1" onClick={handleConfirm}>
              Confirmar adição
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
