"use client";

import { mockOrders } from "@/lib/mock-data";
import { useOrderStore } from "@/lib/useOrderStore";
import { formatDate, formatShortDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock, SkipForward, CheckCircle2, RotateCcw, Info, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const statusConfig = {
  customizable: { ring: "border-[#7ED22A]", badge: <Badge variant="green">Ready to customize</Badge>, dim: false },
  locked:       { ring: "border-[#E8E4DC]", badge: <Badge variant="gray"><Lock className="w-2.5 h-2.5 mr-1 inline" />Locked</Badge>, dim: true },
  skipped:      { ring: "border-[#E8E4DC]", badge: <Badge variant="gray">Skipped</Badge>, dim: false },
  processing:   { ring: "border-blue-300",  badge: <Badge variant="blue">Processing</Badge>, dim: false },
  delivered:    { ring: "border-[#F0EBE0]", badge: <Badge variant="gray">Delivered</Badge>, dim: true },
};

export default function OrdersPage() {
  const { draftItems, orderSkipped, unskipOrder } = useOrderStore();

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
              className={cn("bg-white rounded-2xl border-2 transition-all", cfg.ring, cfg.dim && "opacity-60")}
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
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#004945] text-sm">
                        {effectiveStatus !== "skipped" ? formatCurrency(total) : "—"}
                      </span>
                      <div className="flex gap-2">
                        {effectiveStatus === "skipped" && (
                          <Button size="sm" variant="outline" onClick={unskipOrder}>
                            <RotateCcw className="w-3 h-3" /> Reactivate
                          </Button>
                        )}
                        {(effectiveStatus === "customizable") && (
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

      {/* Past orders */}
      {past.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider">Recent Deliveries</p>
          {past.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="bg-white rounded-2xl border border-[#F0EBE0] p-3 flex items-center justify-between hover:border-[#E8E4DC] transition-colors opacity-60 hover:opacity-80">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#B9EA91]" />
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      {formatDate(order.deliveryDate, { month: "long", day: "numeric" })}
                    </p>
                    <p className="text-xs text-[#9E9E9E]">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} meals · {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="gray">Delivered</Badge>
                  <ChevronRight className="w-4 h-4 text-[#9E9E9E]" />
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
