"use client";

import { useState } from "react";
import { mockBillingHistory, mockOrders, mockSubscription } from "@/lib/mock-data";
import type { Order } from "@/lib/mock-data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";
import { Receipt, Download, ChevronDown, ChevronUp, CalendarDays, Star } from "lucide-react";
import Image from "next/image";

export default function BillingPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [ratingBillId, setRatingBillId] = useState<string | null>(null);
  const [ratedBillIds, setRatedBillIds] = useState<Set<string>>(new Set());

  const isNonCustom = mockSubscription.planType !== "custom";

  const orderForBill = (billDate: string): Order | null =>
    mockOrders.find((o) => o.billingDate === billDate) ?? null;

  const ratingOrder = ratingBillId ? orderForBill(
    mockBillingHistory.find((b) => b.id === ratingBillId)?.date ?? ""
  ) : null;

  const handleRateClick = (billId: string) => {
    setExpandedId(billId);
    setRatingBillId(billId);
  };

  const handleFeedbackClose = () => {
    if (ratingBillId) {
      setRatedBillIds((prev) => new Set(prev).add(ratingBillId));
    }
    setRatingBillId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#004945]">Billing History</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">All your past charges and receipts</p>
      </div>

      {isNonCustom && (
        <div className="flex items-center gap-3 bg-[#EAF7D9] border border-[#B9EA91] rounded-2xl px-5 py-4">
          <CalendarDays className="w-5 h-5 text-[#004945] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#004945]">Next billing</p>
            <p className="text-xs text-[#6B6B6B]">
              {formatDate(mockSubscription.nextBillingDate, { month: "long", day: "numeric", year: "numeric" })} · {formatCurrency(mockSubscription.weeklyTotal)}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#F0EBE0] flex items-center gap-2">
          <Receipt className="w-5 h-5 text-[#004945]" />
          <h2 className="font-semibold text-[#004945]">Payment History</h2>
        </div>
        <div className="divide-y divide-[#F0EBE0]">
          {mockBillingHistory.map((bill) => {
            const order = orderForBill(bill.date);
            const isExpanded = expandedId === bill.id;
            const isRated = ratedBillIds.has(bill.id);

            return (
              <div key={bill.id}>
                {/* Row header — 3-column grid: info | rate CTA | amount+actions */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : bill.id)}
                  className="w-full grid grid-cols-3 items-center py-3 px-5 gap-4 cursor-pointer hover:bg-[#FDFBF7] transition-colors"
                >
                  {/* Col 1: order info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[#1A1A1A]">{bill.orderNumber}</p>
                      {isRated && (
                        <span className="inline-flex items-center gap-1 bg-[#EAF7D9] text-[#004945] border border-[#B9EA91] rounded-full px-2 py-0.5 text-[10px] font-semibold">
                          <Star className="w-2.5 h-2.5 fill-[#7ED22A] text-[#7ED22A]" />
                          Rated
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#9E9E9E]">
                      {formatDate(bill.date, { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>

                  {/* Col 2: rate CTA — centered */}
                  <div className="flex justify-center">
                    {isRated ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#004945]">
                        <Star className="w-3.5 h-3.5 fill-[#7ED22A] text-[#7ED22A]" />
                        Thanks for your feedback!
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRateClick(bill.id); }}
                        className="inline-flex items-center gap-1.5 bg-[#004945] hover:bg-[#003835] text-white rounded-xl px-4 py-1.5 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5 text-[#7ED22A]" />
                        <span className="text-xs font-semibold">Rate this meal & earn 10 points</span>
                      </button>
                    )}
                  </div>

                  {/* Col 3: amount + actions — right-aligned */}
                  <div className="flex items-center justify-end gap-3">
                    <span className="font-semibold text-[#1A1A1A] text-sm">{formatCurrency(bill.amount)}</span>
                    <Badge variant={bill.status === "paid" ? "green" : "red"}>
                      {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                    </Badge>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-[#004945] hover:bg-[#EAF7D9] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded
                      ? <ChevronUp className="w-3.5 h-3.5 text-[#9E9E9E]" />
                      : <ChevronDown className="w-3.5 h-3.5 text-[#9E9E9E]" />
                    }
                  </div>
                </div>

                {/* Expandable detail */}
                {isExpanded && (
                  <div className="px-5 pb-4 bg-[#FDFBF7] border-t border-[#F0EBE0]">
                    {order && order.items.length > 0 ? (
                      <div className="pt-3 space-y-3">
                        <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider">Items in this order</p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F0EBE0] shrink-0">
                                <Image src={item.meal.imageUrl} alt={item.meal.name} fill className="object-cover" sizes="40px" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-[#1A1A1A] truncate">{item.meal.name}</p>
                                <p className="text-[10px] text-[#9E9E9E]">×{item.quantity} · {formatCurrency(item.unitPrice)} each</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-semibold text-[#1A1A1A]">
                                  {formatCurrency(item.unitPrice * item.quantity)}
                                </span>
                                {isRated && (
                                  <span className="inline-flex items-center gap-1 bg-[#EAF7D9] text-[#004945] border border-[#B9EA91] rounded-full px-2 py-0.5 text-[10px] font-semibold">
                                    <Star className="w-2.5 h-2.5 fill-[#7ED22A] text-[#7ED22A]" />
                                    Rated
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-[#F0EBE0]">
                          <span className="text-xs font-semibold text-[#004945]">Total charged</span>
                          <span className="text-sm font-bold text-[#004945]">{formatCurrency(bill.amount)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3">
                        <p className="text-xs text-[#9E9E9E]">Detailed breakdown not available for this order.</p>
                        <div className="flex justify-between items-center pt-2 border-t border-[#F0EBE0] mt-2">
                          <span className="text-xs font-semibold text-[#004945]">Total charged</span>
                          <span className="text-sm font-bold text-[#004945]">{formatCurrency(bill.amount)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FeedbackModal — opened from "Rate" button on any meal row */}
      {ratingBillId && ratingOrder && (
        <FeedbackModal
          order={ratingOrder}
          onClose={handleFeedbackClose}
        />
      )}
    </div>
  );
}
