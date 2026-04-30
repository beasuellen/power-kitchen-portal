import {
  mockCustomer,
  mockSubscription,
  mockOrders,
  mockChallenges,
  tierColors,
} from "@/lib/mock-data";
import { formatDate, daysUntil, formatCurrency } from "@/lib/utils";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RatingPopup } from "@/components/dashboard/RatingPopup";
import { ProductSuggestions } from "@/components/dashboard/ProductSuggestions";
import { NextOrderCard } from "@/components/dashboard/NextOrderCard";
import Link from "next/link";
import {
  Trophy,
  Flame,
  Star,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

export default function DashboardPage() {
  const { firstName } = mockCustomer;
  const { planName, mealsPerWeek, streak, tier, storeCredit, points } = mockSubscription;
  const tierStyle = tierColors[tier];

  const nextOrder = mockOrders.find((o) => o.status === "customizable" || o.status === "locked");
  const deliveredOrder = mockOrders.find((o) => o.status === "delivered");
  const daysLeft = nextOrder ? daysUntil(nextOrder.deliveryDate) : 0;

  const topChallenge = mockChallenges[0];
  const challengePct = Math.round((topChallenge.current / topChallenge.target) * 100);

  return (
    <div className="space-y-8">

      {/* ─── Welcome (pure typography, no colored banner) ─── */}
      <div>
        <h1 className="text-3xl font-bold text-[#004945]">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          {planName} · {mealsPerWeek} meals/week
        </p>
        {nextOrder && (
          <div className="flex items-center gap-2 mt-2">
            <CalendarDays className="w-4 h-4 text-[#7ED22A]" />
            <span className="text-sm text-gray-600">
              Next delivery in{" "}
              <span className="font-semibold text-[#004945]">
                {daysLeft} {daysLeft === 1 ? "day" : "days"}
              </span>{" "}
              —{" "}
              {formatDate(nextOrder.deliveryDate, { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
        )}
      </div>

      {/* ─── Main grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Next Order (spans 3 cols) — reactive via Zustand ── */}
        <NextOrderCard />

        {/* ── Progress sidebar (spans 2 cols) ── */}
        <div className="lg:col-span-2">
          <div className="sticky top-4 space-y-4">
          {/* Streak */}
          <Card>
            <CardBody className="py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl shrink-0">
                  🔥
                </div>
                <div>
                  <p className="font-bold text-[#004945] text-lg leading-tight">{streak} weeks</p>
                  <p className="text-xs text-gray-400">Active streak — keep it up!</p>
                </div>
              </div>
              <div className="w-full bg-[#F0EBE0] rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
                  style={{ width: `${Math.min(100, (streak / 26) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-right">2 weeks to Platinum</p>
            </CardBody>
          </Card>

          {/* Credits & Tier */}
          <Card>
            <CardBody className="py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#7ED22A]" />
                  <span className="text-sm text-gray-600">Store credit</span>
                </div>
                <span className="font-bold text-[#004945]">{formatCurrency(storeCredit)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">Membership</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#004945] flex items-center justify-center text-white text-[8px] font-bold">P</div>
                  <span className="text-sm text-gray-600">Points</span>
                </div>
                <span className="font-bold text-[#004945]">{points}</span>
              </div>
            </CardBody>
          </Card>

          {/* Top challenge */}
          <Card>
            <CardBody className="py-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs font-semibold text-[#7ED22A] uppercase tracking-wide mb-0.5">Challenge</p>
                  <p className="font-semibold text-[#004945] text-sm">{topChallenge.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{topChallenge.description}</p>
                </div>
                <Badge variant="green" size="sm">{topChallenge.reward}</Badge>
              </div>
              <div className="space-y-1 mt-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">{topChallenge.current}/{topChallenge.target}</span>
                  <span className="font-medium text-[#004945]">{challengePct}%</span>
                </div>
                <div className="w-full bg-[#F0EBE0] rounded-full h-2">
                  <div
                    className="bg-[#7ED22A] h-2 rounded-full transition-all"
                    style={{ width: `${challengePct}%` }}
                  />
                </div>
              </div>
              <Link href="/rewards" className="mt-3 flex items-center gap-1 text-xs text-[#004945] font-medium hover:underline">
                View all challenges <ChevronRight className="w-3 h-3" />
              </Link>
            </CardBody>
          </Card>
          </div>
        </div>
      </div>

      {/* ─── Product Suggestions ─── */}
      <ProductSuggestions />

      {/* ─── Meal rating popup (bottom-left floating) ─── */}
      {deliveredOrder && <RatingPopup order={deliveredOrder} />}
    </div>
  );
}
