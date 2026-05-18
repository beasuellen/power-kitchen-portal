"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/lib/useOrderStore";
import { mockOrders } from "@/lib/mock-data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, SkipForward, ShoppingCart, X, CalendarDays, AlertTriangle, RotateCcw, Lock } from "lucide-react";

export function NextOrderCard() {
  const router = useRouter();
  const { draftItems, orderSkipped, skipOrder, unskipOrder } = useOrderStore();
  const nextOrder = mockOrders.find((o) => o.status === "customizable");
  // The order after the skipped one (first locked order)
  const followingOrder = mockOrders.find((o) => o.status === "locked");

  const [showSkipModal, setShowSkipModal] = useState(false);

  if (!nextOrder) return null;

  const totalMeals = draftItems.reduce((s, i) => s + i.quantity, 0);
  const draftTotal = draftItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const handleConfirmSkip = () => {
    skipOrder();
    setShowSkipModal(false);
  };

  // ── Skipped state — show next (following) order instead ──
  if (orderSkipped) {
    const followingItems = followingOrder?.items ?? [];
    const followingTotal = followingItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const followingMeals = followingItems.reduce((s, i) => s + i.quantity, 0);

    return (
      <Card className="lg:col-span-3">
        <CardHeader className="pb-0">
          {/* Skipped notice bar */}
          <div className="flex items-center justify-between bg-[#F7F3EC] border border-[#E8E4DC] rounded-xl px-3 py-2 mb-4">
            <span className="text-xs text-[#6B6B6B]">
              <span className="font-semibold text-[#1A1A1A]">{formatDate(nextOrder.deliveryDate, { month: "long", day: "numeric" })}</span> delivery was skipped
            </span>
            <button
              onClick={unskipOrder}
              className="flex items-center gap-1 text-xs font-semibold text-[#004945] bg-white border border-[#B9EA91] rounded-lg px-2.5 py-1 hover:bg-[#EAF7D9] transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reactivate
            </button>
          </div>

          {/* Title + badge */}
          <div className="flex items-center justify-between pb-4 border-b border-[#F0EBE0]">
            <div>
              <h2 className="font-semibold text-[#004945]">Next Delivery</h2>
              {followingOrder && (
                <p className="text-xs text-[#9E9E9E] mt-0.5">
                  {formatDate(followingOrder.deliveryDate, { weekday: "long", month: "long", day: "numeric" })}
                </p>
              )}
            </div>
            <Badge variant="gray"><Lock className="w-2.5 h-2.5 mr-1 inline" /> Locked</Badge>
          </div>
        </CardHeader>
        <CardBody className="pt-0 flex flex-col">
          {followingOrder && followingItems.length > 0 ? (
            <>
              {/* Opens for editing notice */}
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3">
                <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700">
                  Opens for editing on <span className="font-semibold">{formatDate(followingOrder.cutoffDate, { month: "short", day: "numeric" })}</span>
                </p>
              </div>

              <div className="space-y-2 flex-1">
                {followingItems.slice(0, 5).map((item) => (
                  <div key={item.id} onClick={() => followingOrder && router.push(`/orders/${followingOrder.id}`)} className="flex items-center gap-3 p-2 rounded-xl bg-[#FDFBF7] border border-[#F0EBE0] cursor-pointer hover:bg-[#EAF7D9] hover:border-[#B9EA91] transition-colors">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <Image src={item.meal.imageUrl} alt={item.meal.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.meal.name}</p>
                      <p className="text-xs text-[#9E9E9E]">{item.meal.planType}</p>
                    </div>
                    {item.quantity > 1 && <span className="text-xs text-[#9E9E9E] shrink-0">×{item.quantity}</span>}
                    <span className="text-sm font-semibold text-[#004945] shrink-0">{formatCurrency(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 mt-4 border-t border-[#F0EBE0]">
                <div>
                  <p className="text-xs text-[#9E9E9E]">Order total · <span className="text-[#004945] font-medium">{followingMeals} meals</span></p>
                  <p className="text-xl font-bold text-[#004945]">{formatCurrency(followingTotal)}</p>
                </div>
                <Link href="/orders">
                  <Button size="sm" variant="outline">See all orders <ArrowRight className="w-3.5 h-3.5" /></Button>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#9E9E9E] py-4 text-center">No upcoming orders found.</p>
          )}
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
              <Badge variant="gray">Locked</Badge>
            )}
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          {/* Meal list — scrollable, shows all items */}
          <div className="overflow-y-auto max-h-[272px] space-y-2 mb-4 pr-0.5 scrollbar-thin scrollbar-thumb-[#E8E4DC] scrollbar-track-transparent">
            {draftItems.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/orders/${nextOrder.id}`)}
                className="flex items-center gap-3 p-2 rounded-xl bg-[#FDFBF7] border border-[#F0EBE0] cursor-pointer hover:bg-[#EAF7D9] hover:border-[#B9EA91] transition-colors"
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
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[#F0EBE0]">
            <div
              onClick={() => router.push(`/orders/${nextOrder.id}`)}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <p className="text-xs text-[#9E9E9E]">
                Order total · <span className="text-[#004945] font-medium">{totalMeals} meals</span>
              </p>
              <p className="text-xl font-bold text-[#004945]">{formatCurrency(draftTotal)}</p>
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
