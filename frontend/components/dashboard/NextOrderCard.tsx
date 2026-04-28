"use client";

import { useState } from "react";
import { useOrderStore } from "@/lib/useOrderStore";
import { mockOrders } from "@/lib/mock-data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, SkipForward, ShoppingCart, X, CalendarDays, AlertTriangle } from "lucide-react";

export function NextOrderCard() {
  const { draftItems } = useOrderStore();
  const nextOrder = mockOrders.find((o) => o.status === "customizable");

  const { orderSkipped, skipOrder, unskipOrder } = useOrderStore();
  const [showSkipModal, setShowSkipModal] = useState(false);

  if (!nextOrder) return null;

  const totalMeals = draftItems.reduce((s, i) => s + i.quantity, 0);
  const draftTotal = draftItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const handleConfirmSkip = () => {
    skipOrder();
    setShowSkipModal(false);
  };

  // ── Skipped state ──
  if (orderSkipped) {
    return (
      <Card className="lg:col-span-3">
        <CardBody className="py-10 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#F0EBE0] flex items-center justify-center">
            <SkipForward className="w-5 h-5 text-[#9E9E9E]" />
          </div>
          <div>
            <p className="font-semibold text-[#004945]">Order skipped</p>
            <p className="text-sm text-[#9E9E9E] mt-0.5">
              Your {formatDate(nextOrder.deliveryDate, { weekday: "long", month: "long", day: "numeric" })} delivery won't be sent.
            </p>
          </div>
          <p className="text-xs text-[#9E9E9E]">Your next delivery will resume the following week.</p>
          <button
            onClick={unskipOrder}
            className="mt-1 text-xs text-[#004945] font-medium hover:underline"
          >
            Undo skip
          </button>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#004945]">Next Order</h2>
              <p className="text-xs text-[#9E9E9E] mt-0.5">
                {formatDate(nextOrder.deliveryDate, { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            {nextOrder.status === "customizable" ? (
              <Badge variant="green">Ready to customize</Badge>
            ) : (
              <Badge variant="gray">🔒 Locked</Badge>
            )}
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          {/* Meal list */}
          <div className="space-y-2 mb-4">
            {draftItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-xl bg-[#FDFBF7] border border-[#F0EBE0]"
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={item.meal.imageUrl}
                    alt={item.meal.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.meal.name}</p>
                  <p className="text-xs text-[#9E9E9E]">{item.meal.planType}</p>
                </div>
                {item.quantity > 1 && (
                  <span className="text-xs text-[#9E9E9E] shrink-0">×{item.quantity}</span>
                )}
                <span className="text-sm font-semibold text-[#004945] shrink-0">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}

            {draftItems.length > 5 && (
              <div className="flex items-center gap-2 px-2 py-1">
                <ShoppingCart className="w-3.5 h-3.5 text-[#9E9E9E]" />
                <p className="text-xs text-[#9E9E9E]">
                  +{draftItems.length - 5} more meal{draftItems.length - 5 !== 1 ? "s" : ""} in your order
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#F0EBE0]">
            <div>
              <p className="text-xs text-[#9E9E9E]">
                Order total · <span className="text-[#004945] font-medium">{totalMeals} meals</span>
              </p>
              <p className="text-xl font-bold text-[#004945]">{formatCurrency(draftTotal)}</p>
            </div>
            <div className="flex gap-2">
              {nextOrder.status === "customizable" && (
                <Button variant="outline" size="sm" onClick={() => setShowSkipModal(true)}>
                  <SkipForward className="w-3.5 h-3.5" /> Skip
                </Button>
              )}
              <Link href={`/orders/${nextOrder.id}`}>
                <Button size="sm">
                  View & Edit <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Skip confirmation modal ── */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-[#E8E4DC] overflow-hidden">

            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#004945]">Skip this delivery?</h3>
                <p className="text-xs text-[#9E9E9E] mt-0.5">
                  {formatDate(nextOrder.deliveryDate, { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
              <button onClick={() => setShowSkipModal(false)} className="p-1 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0">
                <X className="w-4 h-4 text-[#9E9E9E]" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 pb-2 space-y-3">
              {/* What you'll lose */}
              <div className="bg-[#FDFBF7] rounded-xl border border-[#F0EBE0] p-3.5 space-y-2">
                <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">This order</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#1A1A1A]">{totalMeals} meals</span>
                  <span className="text-sm font-bold text-[#004945]">{formatCurrency(draftTotal)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#9E9E9E]">
                  <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                  You won't be charged for this delivery
                </div>
              </div>

              {/* Info */}
              <p className="text-xs text-[#9E9E9E] leading-relaxed">
                Skipping is free and your subscription stays active. Your next delivery will resume automatically the following week.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-4 flex flex-col gap-2">
              <Button variant="destructive" className="w-full" onClick={handleConfirmSkip}>
                Yes, skip this delivery
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setShowSkipModal(false)}>
                Keep my order
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
