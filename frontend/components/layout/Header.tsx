"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, Settings, ChevronDown, User, CreditCard, LogOut, MapPin } from "lucide-react";
import { mockCustomer, mockSubscription } from "@/lib/mock-data";

const notifications = [
  { id: 1, text: "Your Apr 24 order is ready to customize", time: "2h ago", unread: true },
  { id: 2, text: "Payment received — $149.90", time: "3 days ago", unread: true },
  { id: 3, text: "You earned $5 from the Big Order challenge!", time: "5 days ago", unread: false },
];

export function Header() {
  const { firstName } = mockCustomer;
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7] border-b border-[#E8E4DC] px-4 lg:px-7 py-3 flex items-center justify-between">
      {/* Mobile: logo */}
      <Link href="/dashboard" className="lg:hidden">
        <Image src="/logo-pk.svg" alt="Power Kitchen" width={62} height={24} />
      </Link>

      {/* Desktop: empty left (pages have their own headings) */}
      <div className="hidden lg:block" />

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifsRef} className="relative">
          <button
            onClick={() => { setShowNotifs((v) => !v); setShowProfile(false); }}
            className="relative p-2 rounded-xl text-[#004945] hover:bg-[#EAF7D9] transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E8E4DC] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#E8E4DC]">
                <p className="text-sm font-semibold text-[#004945]">Notifications</p>
              </div>
              <div className="divide-y divide-[#F0EBE0]">
                {notifications.map((n) => (
                  <div key={n.id} className={`px-4 py-3 flex gap-3 ${n.unread ? "bg-[#EAF7D9]/40" : ""}`}>
                    {n.unread && <div className="w-2 h-2 rounded-full bg-[#7ED22A] mt-1.5 shrink-0" />}
                    {!n.unread && <div className="w-2 shrink-0" />}
                    <div>
                      <p className="text-sm text-gray-800">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setShowProfile((v) => !v); setShowNotifs(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-[#EAF7D9] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#004945] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {firstName[0]}
            </div>
            <span className="hidden sm:block text-sm font-medium text-[#004945]">{firstName}</span>
            <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-[#004945]/50" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E8E4DC] overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#F0EBE0]">
                <p className="text-xs text-gray-400">Signed in as</p>
                <p className="text-sm font-semibold text-[#004945] truncate">{mockCustomer.email}</p>
              </div>
              <div className="py-1">
                {[
                  { href: "/plan",         icon: User,       label: "Account Settings" },
                  { href: "/plan/address", icon: MapPin,     label: "Address" },
                  { href: "/billing",      icon: CreditCard, label: "Billing" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#EAF7D9] hover:text-[#004945] transition-colors"
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    {label}
                  </Link>
                ))}
                <div className="border-t border-[#F0EBE0] mt-1 pt-1">
                  <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
