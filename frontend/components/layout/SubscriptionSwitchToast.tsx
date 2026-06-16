"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscriptionStore, getActiveSubscription } from "@/lib/useSubscriptionStore";

/**
 * Top-right toast that confirms the customer switched their active subscription.
 * Watches `activeIndex` in the store, so it fires for any switcher (header or
 * mobile sidebar). Shows for 3s, then slides out. Brand orange: #FF4A12.
 */
export function SubscriptionSwitchToast() {
  const activeIndex = useSubscriptionStore((s) => s.activeIndex);
  const firstRun = useRef(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Skip the initial mount — only react to actual switches.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    const sub = getActiveSubscription(activeIndex);
    setLabel(sub?.label ?? "your subscription");

    // Reset any in-flight timers so rapid switches restart the 3s window.
    timers.current.forEach(clearTimeout);
    timers.current = [];

    requestAnimationFrame(() => setVisible(true));                 // slide in
    timers.current.push(setTimeout(() => setVisible(false), 3000)); // slide out at 3s
    timers.current.push(setTimeout(() => setLabel(null), 3300));    // unmount after exit
  }, [activeIndex]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (!label) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-4 right-4 z-[100] transition-all duration-300 ease-out",
        visible ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
      )}
    >
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-[#F0EBE0] shadow-xl pl-3 pr-5 py-3 max-w-xs">
        <div className="w-9 h-9 rounded-full bg-[#FF4A12] flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1A1A1A] leading-tight">Subscription switched</p>
          <p className="text-xs text-[#6B6B6B] leading-tight mt-0.5">
            You&apos;re now viewing <span className="font-semibold text-[#FF4A12]">{label}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
