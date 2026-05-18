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
import { mockOrders } from "@/lib/mock-data";

export function MobileNav() {
  const pathname = usePathname();

  const nextOrder = mockOrders.find((o) => o.status === "customizable" || o.status === "locked");
  const nextOrderHref = nextOrder ? `/orders/${nextOrder.id}` : "/orders";

  const navItems = [
    { href: "/dashboard",  label: "Home",       icon: LayoutDashboard, matchPrefix: "/dashboard" },
    { href: nextOrderHref, label: "Next Order", icon: CalendarDays,    matchPrefix: "/orders" },
    { href: "/plan",       label: "My Plan",    icon: SlidersHorizontal, matchPrefix: "/plan" },
    { href: "/rewards",    label: "Rewards",    icon: Trophy,          matchPrefix: "/rewards" },
    { href: "/help",       label: "Help",       icon: MessageCircle,   matchPrefix: "/help" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E4DC]">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon, matchPrefix }) => {
          const isActive = pathname === matchPrefix || pathname.startsWith(matchPrefix + "/");
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2.5 min-h-[60px] transition-colors relative",
                isActive ? "text-[#004945]" : "text-gray-400"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-[#004945]")} />
              <span className={cn("text-[11px] mt-1 font-medium", isActive ? "text-[#004945]" : "text-gray-400")}>
                {label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-[#7ED22A] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
