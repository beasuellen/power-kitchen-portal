"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { mockSubscriptions } from "@/lib/mock-data";
import { useSubscriptionStore } from "@/lib/useSubscriptionStore";
import { formatCurrency } from "@/lib/utils";
import { Truck, ShoppingBag, ChevronRight, Flame, Trophy } from "lucide-react";

const tierLabel: Record<string, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  bronze:   { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200" },
  silver:   { bg: "bg-gray-100",   text: "text-gray-600",    border: "border-gray-300"   },
  gold:     { bg: "bg-yellow-50",  text: "text-yellow-700",  border: "border-yellow-300" },
  platinum: { bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200" },
};

export default function SubscriptionSelectPage() {
  const router = useRouter();
  const { setActiveIndex } = useSubscriptionStore();

  const handleSelect = (index: number) => {
    setActiveIndex(index);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center pt-10 pb-6">
        <Image src="/logo-pk.svg" alt="Power Kitchen" width={90} height={34} />
      </div>

      <div className="text-center px-4 mb-8">
        <h1 className="text-2xl font-bold text-[#004945]">Which subscription would you like to manage?</h1>
        <p className="text-sm text-[#9E9E9E] mt-1.5">Select one to enter your portal</p>
      </div>

      {/* Split cards */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 px-4 lg:px-12 pb-12 max-w-4xl mx-auto w-full">
        {mockSubscriptions.map((sub, index) => {
          const tier = tierColors[sub.tier] ?? tierColors.gold;
          const isDelivery = sub.deliveryMethod === "delivery";

          return (
            <button
              key={sub.id}
              onClick={() => handleSelect(index)}
              className="flex-1 group cursor-pointer bg-white rounded-3xl border-2 border-[#E8E4DC] hover:border-[#7ED22A] hover:shadow-xl active:scale-[0.99] transition-all duration-200 p-7 text-left flex flex-col gap-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7ED22A]"
            >
              {/* Top row: label + tier badge */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider mb-1">
                    {sub.label}
                  </p>
                  <h2 className="text-xl font-bold text-[#004945]">{sub.planName}</h2>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${tier.bg} ${tier.text} ${tier.border}`}>
                  {tierLabel[sub.tier] ?? sub.tier}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Meals / week", value: sub.mealsPerWeek.toString() },
                  { label: "Weekly total",  value: formatCurrency(sub.weeklyTotal) },
                  { label: "Streak",        value: `${sub.streak} weeks` },
                  { label: "Delivery",      value: sub.deliveryDay },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#FDFBF7] rounded-xl px-3 py-2.5">
                    <p className="text-[11px] text-[#9E9E9E] mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{value}</p>
                  </div>
                ))}
              </div>

              {/* Method pill */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[#F0EBE0] rounded-full px-3 py-1.5">
                  {isDelivery
                    ? <Truck className="w-3.5 h-3.5 text-[#004945]" />
                    : <ShoppingBag className="w-3.5 h-3.5 text-[#004945]" />
                  }
                  <span className="text-xs font-medium text-[#004945]">
                    {isDelivery ? "Local Delivery" : "Pickup"}
                  </span>
                </div>
                {sub.streak >= 10 && (
                  <div className="flex items-center gap-1 bg-orange-50 rounded-full px-2.5 py-1.5">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="text-[11px] font-semibold text-orange-600">{sub.streak}w streak</span>
                  </div>
                )}
              </div>

              {/* CTA button */}
              <div className="mt-auto">
                <div className="w-full flex items-center justify-center gap-2 bg-[#004945] group-hover:bg-[#003835] text-white rounded-full py-3 px-5 transition-colors">
                  <span className="text-sm font-semibold">Manage this subscription</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
