"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface InOrderBadgeProps {
  qty: number;
  /** "overlay" → absolute badge over an image; "strip" → full-width footer strip; "inline" → inline pill */
  variant?: "overlay" | "strip" | "inline";
  className?: string;
}

export function InOrderBadge({ qty, variant = "overlay", className }: InOrderBadgeProps) {
  if (qty <= 0) return null;

  if (variant === "strip") {
    return (
      <div className={cn(
        "flex items-center justify-center gap-1.5 bg-[#004945] text-white text-[10px] font-semibold py-1.5 px-3",
        className
      )}>
        <Check className="w-3 h-3 shrink-0" />
        <span>{qty}× already in your order</span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 bg-[#EAF7D9] text-[#004945] border border-[#7ED22A] rounded-full px-2 py-0.5 text-[10px] font-semibold",
        className
      )}>
        <Check className="w-2.5 h-2.5" />
        {qty} in order
      </span>
    );
  }

  // overlay (default)
  return (
    <div className={cn(
      "flex items-center gap-0.5 bg-[#004945] text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow",
      className
    )}>
      <Check className="w-2.5 h-2.5 shrink-0" />
      <span>{qty} in order</span>
    </div>
  );
}
