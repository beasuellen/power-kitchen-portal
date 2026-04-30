"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockOrders, type Order } from "@/lib/mock-data";
import { useOrderStore } from "@/lib/useOrderStore";
import { formatDate, formatShortDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock, SkipForward, CheckCircle2, RotateCcw, Info, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

const statusConfig = {
  customizable: { ring: "border-[#7ED22A]", badge: <Badge variant="green">Ready to customize</Badge>, dim: false },
  locked:       { ring: "border-[#E8E4DC]", badge: <Badge variant="gray"><Lock className="w-2.5 h-2.5 mr-1 inline" />Locked</Badge>, dim: true },
  skipped:      { ring: "border-[#E8E4DC]", badge: <Badge variant="gray">Skipped</Badge>, dim: false },
  processing:   { ring: "border-blue-300",  badge: <Badge variant="blue">Processing</Badge>, dim: false },
  delivered:    { ring: "border-[#F0EBE0]", badge: <Badge variant="gray">Delivered</Badge>, dim: true },
};

export default function OrdersPage() {
  const router = useRouter();
  const { draftItems, orderSkipped, unskipOrder } = useOrderStore();
  const [feedbackOrder, setFeedbackOrder] = useState<Order | null>(null);
  const [ratedOrderIds, setRatedOrderIds] = useState<Set<string>>(new Set());

  const upcoming = mockOrders
    .filter((o) => o.status !== "delivered")
    .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
  const past = mockOrders.filter((o) => o.status === "delivered");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#004945]">My Orders</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">Manage your upcoming deliveries</p>
      </div>

      {/* ── 70/30 grid: upcoming left, recent deliveries right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-5 items-start">

      {/* Left column — Upcoming orders */}
      <section className="space-y-3">
        <p className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">Upcoming</p>

        {upcoming.map((order) => {
          const isCustomizable = order.status === "customizable";
          // For the customizable order, reflect global store state
          const effectiveSkipped = isCustomizable && orderSkipped;
          const effectiveStatus = effectiveSkipped ? "skipped" : order.status;
          const cfg = statusConfig[effectiveStatus];

          // Items: use store for customizable, mock for others
          const items = isCustomizable ? draftItems : order.items;
          const mealCount = items.reduce((s, i) => s + i.quantity, 0);
          const total = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

          return (
            <div
              key={order.id}
              className={cn(
                "bg-white rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md",
                cfg.ring, cfg.dim && "opacity-60"
              )}
              onClick={() => router.push(`/orders/${order.id}`)}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Date column */}
                  <div className="shrink-0 w-12 text-center">
                    <p className="text-[10px] font-bold text-[#9E9E9E] uppercase">
                      {new Date(order.deliveryDate + "T12:00:00").toLocaleDateString("en-CA", { month: "short" })}
                    </p>
                    <p className="text-2xl font-bold text-[#004945] leading-tight">
                      {new Date(order.deliveryDate + "T12:00:00").getDate()}
                    </p>
                    <p className="text-[10px] text-[#9E9E9E]">
                      {new Date(order.deliveryDate + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short" })}
                    </p>
                  </div>

                  <div className="w-px self-stretch bg-[#F0EBE0] shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {cfg.badge}
                      {effectiveStatus !== "skipped" && (
                        <span className="text-xs text-[#9E9E9E]">{mealCount} meals</span>
                      )}
                    </div>

                    {/* Meal thumbnails */}
                    {effectiveStatus !== "skipped" && items.length > 0 && (
                      <div className="flex gap-1.5 mb-3">
                        {items.slice(0, 5).map((item, idx) => (
                          <div key={item.id} className="relative w-9 h-9 rounded-lg overflow-hidden bg-[#F0EBE0] shrink-0 border border-[#E8E4DC]">
                            <Image src={item.meal.imageUrl} alt={item.meal.name} fill className="object-cover" sizes="36px" />
                            {idx === 4 && items.length > 5 && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[9px] font-bold">
                                +{items.length - 5}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skipped info */}
                    {effectiveStatus === "skipped" && (
                      <div className="flex items-center gap-1.5 text-xs text-[#9E9E9E] mb-2">
                        <SkipForward className="w-3.5 h-3.5" />
                        This delivery has been skipped
                      </div>
                    )}

                    {/* Locked info */}
                    {effectiveStatus === "locked" && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-100 px-3 py-1.5 mb-2">
                        <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <p className="text-xs text-amber-700">
                          Opens for editing on {formatShortDate(order.cutoffDate)}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <span className="font-semibold text-[#004945] text-sm">
                        {effectiveStatus !== "skipped" ? formatCurrency(total) : "—"}
                      </span>
                      <div className="flex gap-2">
                        {effectiveStatus === "skipped" && (
                          <Button size="sm" variant="outline" onClick={unskipOrder}>
                            <RotateCcw className="w-3 h-3" /> Reactivate
                          </Button>
                        )}
                        {effectiveStatus === "customizable" && (
                          <Link href={`/orders/${order.id}`}>
                            <Button size="sm">
                              <span>View & Edit</span><ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        )}
                        {effectiveStatus === "locked" && (
                          <Link href={`/orders/${order.id}`}>
                            <Button size="sm" variant="secondary">View Details</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Right column — Recent Deliveries (30%) */}
      {past.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">Recent Deliveries</p>
          {past.map((order) => {
            const rated = ratedOrderIds.has(order.id);
            const mealCount = order.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#F0EBE0] overflow-hidden"
              >
                {/* Thumbnail strip */}
                {order.items.length > 0 && (
                  <div className="flex gap-0.5 px-2.5 pt-2.5">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div
                        key={item.id}
                        className="relative flex-1 h-14 rounded-lg overflow-hidden bg-[#F0EBE0]"
                      >
                        <Image src={item.meal.imageUrl} alt={item.meal.name} fill className="object-cover" sizes="60px" />
                        {idx === 3 && order.items.length > 4 && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[9px] font-bold">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="px-2.5 py-2">
                  <Link href={`/orders/${order.id}`} className="block hover:opacity-80 transition-opacity mb-1.5">
                    <p className="text-xs font-semibold text-[#1A1A1A]">
                      {formatDate(order.deliveryDate, { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-[10px] text-[#9E9E9E]">
                      {mealCount} meals · {formatCurrency(order.total)}
                    </p>
                  </Link>
                  <div className="flex items-center justify-between">
                    {rated ? (
                      <span className="text-[10px] text-[#9E9E9E] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#7ED22A]" /> Rated
                      </span>
                    ) : (
                      <button
                        onClick={() => setFeedbackOrder(order)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[#E8E4DC] text-[10px] font-semibold text-[#004945] hover:border-[#7ED22A] hover:bg-[#EAF7D9] transition-all"
                      >
                        <Star className="w-2.5 h-2.5" />
                        Rate
                      </button>
                    )}
                    <Link href={`/orders/${order.id}`}>
                      <ChevronRight className="w-3.5 h-3.5 text-[#9E9E9E]" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      </div>{/* end 70/30 grid */}

      {/* Feedback modal */}
      {feedbackOrder && (
        <FeedbackModal
          order={feedbackOrder}
          onClose={() => {
            setRatedOrderIds((prev) => new Set([...prev, feedbackOrder.id]));
            setFeedbackOrder(null);
          }}
        />
      )}
    </div>
  );
}
