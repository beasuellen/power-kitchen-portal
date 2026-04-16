"use client";

import { Bell, Settings, ChevronDown } from "lucide-react";
import { mockCustomer, mockSubscription, tierColors } from "@/lib/mock-data";
import Link from "next/link";

export function Header() {
  const { firstName } = mockCustomer;
  const { tier } = mockSubscription;
  const tierStyle = tierColors[tier];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center justify-between">
      {/* Left: greeting (mobile) */}
      <div className="lg:hidden">
        <p className="text-sm font-semibold text-gray-900">Hey, {firstName}! 👋</p>
      </div>

      {/* Desktop: page context (empty — pages set their own heading) */}
      <div className="hidden lg:block" />

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Tier badge */}
        <span className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </span>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile / Settings */}
        <Link
          href="/plan"
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-7 h-7 bg-[#2D6A4F] rounded-full flex items-center justify-center text-white text-xs font-bold">
            {firstName[0]}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700">{firstName}</span>
          <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-gray-400" />
        </Link>
      </div>
    </header>
  );
}
