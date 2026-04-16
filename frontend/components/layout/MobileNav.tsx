"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  SlidersHorizontal,
  Trophy,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: CalendarDays },
  { href: "/plan", label: "Plan", icon: SlidersHorizontal },
  { href: "/rewards", label: "Rewards", icon: Trophy },
  { href: "/help", label: "Help", icon: MessageCircle },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 min-h-[56px] transition-colors",
                isActive ? "text-[#2D6A4F]" : "text-gray-400"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className={cn("text-[10px] mt-0.5 font-medium", isActive ? "text-[#2D6A4F]" : "text-gray-400")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
