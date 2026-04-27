"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  SlidersHorizontal,
  Trophy,
  MessageCircle,
  ChevronRight,
  Flame,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockSubscription } from "@/lib/mock-data";

const navItems = [
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/orders",    label: "My Orders",   icon: CalendarDays },
  { href: "/plan",      label: "My Plan",     icon: SlidersHorizontal },
  { href: "/rewards",   label: "Rewards",     icon: Trophy },
  { href: "/help",      label: "Help",        icon: MessageCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { streak, storeCredit, tier } = mockSubscription;

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen shrink-0 bg-[#004945] overflow-y-auto">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center px-5 py-5 shrink-0">
        <Image
          src="/logo-pk.svg"
          alt="Power Kitchen"
          width={78}
          height={30}
          priority
          className="brightness-0 invert"  /* white version on dark bg */
        />
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
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
            { href: "/plan/address", label: "Address" },
            { href: "/plan/payment", label: "Payment" },
            { href: "/billing",      label: "Billing History" },
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
