"use client";

import { useOrderStore } from "@/lib/useOrderStore";
import { mockOrders } from "@/lib/mock-data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, SkipForward, ShoppingCart } from "lucide-react";

export function NextOrderCard() {
  const { draftItems } = useOrderStore();
  const nextOrder = mockOrders.find((o) => o.status === "customizable");

  if (!nextOrder) return null;

  const totalMeals = draftItems.reduce((s, i) => s + i.quantity, 0);
  const draftTotal = draftItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  return (
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

          {/* More meals indicator */}
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
              <Button variant="outline" size="sm">
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
  );
}
