"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  FileText,
  Trophy,
  MessageCircle,
  ChevronDown,
  Flame,
  Star,
  Check,
} from "lucide-react";

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
import { cn } from "@/lib/utils";
import { mockSubscription, mockOrders, mockSubscriptions } from "@/lib/mock-data";
import { useSubscriptionStore, getActiveSubscription } from "@/lib/useSubscriptionStore";
import { useState, useRef, useEffect } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { streak, storeCredit, tier } = mockSubscription;
  const { activeIndex, setActiveIndex } = useSubscriptionStore();
  const activeSub = getActiveSubscription(activeIndex);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) setSwitcherOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const nextOrder = mockOrders.find((o) => o.status === "customizable" || o.status === "locked");
  const nextOrderHref = nextOrder ? `/orders/${nextOrder.id}` : "/orders";

  const navItems = [
    { href: "/dashboard",   label: "Home",       icon: Home },
    { href: nextOrderHref,  label: "Next Order", icon: ShoppingBag, exact: false },
    { href: "/plan",        label: "My Plan",    icon: FileText },
    { href: "/rewards",     label: "Rewards",    icon: Trophy },
    { href: "/help",        label: "Help",       icon: MessageCircle },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen shrink-0 bg-[#004945] overflow-y-auto">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center px-5 pt-5 pb-4 shrink-0">
        <Image
          src="/logo-pk.svg"
          alt="Power Kitchen"
          width={78}
          height={30}
          priority
          className="brightness-0 invert"
        />
      </Link>

      {/* Subscription Switcher */}
      <div ref={switcherRef} className="px-3 pb-3 relative">
        <button
          onClick={() => setSwitcherOpen((v) => !v)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all",
            switcherOpen ? "bg-white/15" : "bg-white/10 hover:bg-white/15"
          )}
        >
          <RefreshIcon className="w-4 h-4 text-white shrink-0" />
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-bold text-white leading-none truncate">{activeSub.label}</p>
            <p className="text-[11px] text-[#7ED22A] mt-0.5 leading-none">Active</p>
          </div>
          <ChevronDown className={cn("w-3.5 h-3.5 text-white/40 transition-transform shrink-0", switcherOpen && "rotate-180")} />
        </button>

        {switcherOpen && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-[#003835] rounded-xl border border-white/10 overflow-hidden z-50 shadow-xl">
            {mockSubscriptions.map((sub, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={sub.id}
                  onClick={() => { setActiveIndex(idx); setSwitcherOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                    isActive ? "bg-white/10" : "hover:bg-white/5"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{sub.label}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#7ED22A]/20 text-[#7ED22A] leading-none">{sub.planName}</span>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-[#7ED22A] shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/10 mb-2" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact === false
            ? pathname.startsWith("/orders")
            : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-[#7ED22A] text-[#004945]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Stats snapshot */}
      <div className="px-4 pb-5 space-y-2">
        <div className="rounded-xl bg-white/10 px-4 py-3 space-y-2.5">
          {/* Streak */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Streak</span>
            </div>
            <span className="text-white text-xs font-bold">{streak} weeks</span>
          </div>
          {/* Credits */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Star className="w-3.5 h-3.5 text-[#7ED22A]" />
              <span>Store credit</span>
            </div>
            <span className="text-white text-xs font-bold">${storeCredit.toFixed(2)}</span>
          </div>
          {/* Tier */}
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-xs">Membership</span>
            <span className="text-xs font-bold text-[#B9EA91] capitalize">{tier}</span>
          </div>
        </div>

        {/* Secondary links */}
        <div className="space-y-0.5 pt-1">
          {[
            { href: "/plan#address-section", label: "Address" },
            { href: "/plan#payment-section", label: "Payment" },
            { href: "/billing",              label: "Billing History" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
