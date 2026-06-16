"use client";

import Link from "next/link";
import Image from "next/image";
import { mockOrders } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Truck, ChevronRight } from "lucide-react";

/**
 * Surfaces the order the customer just placed / that just renewed and is now being
 * prepared for delivery. It sits ABOVE the editable "Next Order" card so customers
 * understand this delivery is already locked in — and that anything they change below
 * applies to their next delivery, not this one.
 */
export function InProgressOrderBanner() {
  const order = mockOrders.find((o) => o.status === "processing");
  if (!order) return null;

  return (
    <Link href={`/orders/${order.id}`} className="block group">
      <div className="flex items-center gap-3 sm:gap-4 rounded-2xl border border-blue-200 bg-blue-50/70 px-4 py-3 hover:bg-blue-50 transition-colors">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5 text-blue-600" />
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#1A1A1A]">Your order is on its way</p>
            <Badge variant="blue">Being prepared</Badge>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Arriving{" "}
            <span className="font-semibold text-[#004945]">
              {formatDate(order.deliveryDate, { weekday: "long", month: "long", day: "numeric" })}
            </span>. Changes below apply to your <span className="font-medium text-[#1A1A1A]">next</span> delivery.
          </p>
        </div>

        {/* Meal thumbnails (desktop only) */}
        <div className="hidden sm:flex gap-1.5 shrink-0">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="relative w-9 h-9 rounded-lg overflow-hidden bg-white border border-blue-100">
              <Image src={item.meal.imageUrl} alt={item.meal.name} fill className="object-cover" sizes="36px" />
            </div>
          ))}
        </div>

        <ChevronRight className="w-4 h-4 text-[#9E9E9E] group-hover:translate-x-0.5 transition-transform shrink-0" />
      </div>
    </Link>
  );
}
