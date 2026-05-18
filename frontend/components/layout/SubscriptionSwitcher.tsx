"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronDown, Check, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscriptionStore, getActiveSubscription } from "@/lib/useSubscriptionStore";
import { mockSubscriptions } from "@/lib/mock-data";

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  );
}

const statusLabel: Record<string, { label: string; color: string }> = {
  active:    { label: "Active",   color: "text-[#7ED22A]" },
  paused:    { label: "Paused",   color: "text-amber-500" },
  cancelled: { label: "Cancelled", color: "text-red-400" },
};

export function SubscriptionSwitcher() {
  const { activeIndex, setActiveIndex } = useSubscriptionStore();
  const active = getActiveSubscription(activeIndex);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (mockSubscriptions.length <= 1) return null;

  const st = statusLabel[active.status] ?? statusLabel.active;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E8E4DC] bg-white hover:bg-[#EAF7D9]/50 transition-colors"
      >
        <RefreshIcon className="w-4 h-4 text-[#004945] shrink-0" />
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-[#004945] leading-none">{active.label}</p>
          <p className={cn("text-[11px] leading-none mt-0.5", st.color)}>{st.label}</p>
        </div>
        <ChevronDown className={cn("w-3.5 h-3.5 text-[#004945]/50 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E8E4DC] overflow-hidden z-50">
          <div className="px-4 py-2.5 border-b border-[#F0EBE0]">
            <p className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-wide">Your subscriptions</p>
          </div>
          <div className="py-1.5 space-y-0.5 px-2">
            {mockSubscriptions.map((sub, idx) => {
              const isActive = idx === activeIndex;
              const s = statusLabel[sub.status] ?? statusLabel.active;
              return (
                <button
                  key={sub.id}
                  onClick={() => { setActiveIndex(idx); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                    isActive ? "bg-[#EAF7D9]" : "hover:bg-[#FDFBF7]"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#004945]">{sub.label}</p>
                    <p className="text-xs text-[#9E9E9E] truncate">{sub.planName} · {sub.mealsPerWeek} meals</p>
                    <p className={cn("text-[11px] font-medium mt-0.5", s.color)}>
                      {sub.status === "paused" && <Pause className="w-2.5 h-2.5 inline mr-0.5" />}
                      {s.label}
                    </p>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-[#004945] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
