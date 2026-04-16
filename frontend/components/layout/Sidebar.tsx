"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  SlidersHorizontal,
  Trophy,
  MessageCircle,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockSubscription } from "@/lib/mock-data";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "My Orders", icon: CalendarDays },
  { href: "/plan", label: "My Plan", icon: SlidersHorizontal },
  { href: "/rewards", label: "Rewards", icon: Trophy },
  { href: "/help", label: "Help", icon: MessageCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { tier, streak, storeCredit } = mockSubscription;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#2D6A4F] rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">Power Kitchen</p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Customer Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#D8F3DC] text-[#2D6A4F]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-[#2D6A4F]" : "text-gray-400")} />
              {label}
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#2D6A4F]" />}
            </Link>
          );
        })}
      </nav>

      {/* Streak & Credit snapshot */}
      <div className="px-4 pb-4 space-y-2">
        <div className="rounded-xl bg-gradient-to-br from-[#D8F3DC] to-[#b7e4c7] p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#2D6A4F] uppercase tracking-wide">Streak</span>
            <span className="text-xs font-bold text-[#2D6A4F]">🔥 {streak} weeks</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Store credit</span>
            <span className="text-xs font-semibold text-gray-800">${storeCredit.toFixed(2)}</span>
          </div>
        </div>

        {/* Settings link */}
        <div className="border-t border-gray-100 pt-2 space-y-0.5">
          {[
            { href: "/plan/address", label: "Address" },
            { href: "/plan/payment", label: "Payment Method" },
            { href: "/billing", label: "Billing History" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
