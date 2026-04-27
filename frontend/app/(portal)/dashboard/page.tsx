import {
  mockCustomer,
  mockSubscription,
  mockOrders,
  mockMeals,
  mockChallenges,
  mockRecentActivity,
  tierColors,
} from "@/lib/mock-data";
import { formatDate, formatShortDate, daysUntil, formatCurrency } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DietaryPills } from "@/components/ui/DietaryPills";
import { RatingPopup } from "@/components/dashboard/RatingPopup";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Plus,
  SkipForward,
  Trophy,
  Flame,
  Star,
  ChevronRight,
  CalendarDays,
  Edit3,
} from "lucide-react";

export default function DashboardPage() {
  const { firstName } = mockCustomer;
  const { planName, mealsPerWeek, streak, tier, storeCredit, points } = mockSubscription;
  const tierStyle = tierColors[tier];

  const nextOrder = mockOrders.find((o) => o.status === "customizable" || o.status === "locked");
  const deliveredOrder = mockOrders.find((o) => o.status === "delivered");
  const daysLeft = nextOrder ? daysUntil(nextOrder.deliveryDate) : 0;

  // Breakfast + new meals for suggestions — show in horizontal carousel
  const suggestions = mockMeals.filter((m) => m.category === "breakfast" || m.isNew).slice(0, 6);
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

        {/* ── Next Order (spans 3 cols) ── */}
        {nextOrder && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-[#004945]">Next Order</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(nextOrder.deliveryDate, { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                </div>
                {nextOrder.status === "customizable" ? (
                  <Badge variant="green">Ready to customize</Badge>
                ) : (
                  <Badge variant="gray">🔒 Locked</Badge>
                )}
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              {/* Meal list with image + name + price */}
              <div className="space-y-2 mb-4">
                {nextOrder.items.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-xl bg-[#FDFBF7] border border-[#F0EBE0]"
                  >
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={item.meal.imageUrl}
                        alt={item.meal.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.meal.name}</p>
                      <p className="text-xs text-gray-400">{item.meal.planType}</p>
                    </div>
                    {item.quantity > 1 && (
                      <span className="text-xs text-gray-400 shrink-0">×{item.quantity}</span>
                    )}
                    <span className="text-sm font-semibold text-[#004945] shrink-0">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
                {nextOrder.items.length > 4 && (
                  <p className="text-xs text-gray-400 text-center py-1">
                    +{nextOrder.items.length - 4} more meals
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#F0EBE0]">
                <div>
                  <p className="text-xs text-gray-400">Order total</p>
                  <p className="text-xl font-bold text-[#004945]">{formatCurrency(nextOrder.total)}</p>
                </div>
                <div className="flex gap-2">
                  {nextOrder.status === "customizable" && (
                    <Button variant="outline" size="sm">
                      <SkipForward className="w-3.5 h-3.5" /> Skip
                    </Button>
                  )}
                  <Link href={`/orders/${nextOrder.id}`}>
                    <Button size="sm">
                      View & Edit <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* ── Progress sidebar (spans 2 cols) ── */}
        <div className="lg:col-span-2 space-y-4">
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

      {/* ─── Smart Suggestions — horizontal scroll carousel ─── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-[#004945]">Have you tried our Breakfast options?</h2>
            <p className="text-xs text-gray-400 mt-0.5">Tap to quick-add to your next order</p>
          </div>
          <Link href="/orders" className="text-sm text-[#004945] font-medium flex items-center gap-1 hover:underline shrink-0">
            See all meals <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Carousel — shows 4.33 cards to suggest scrollability */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
          {suggestions.map((meal) => (
            <div
              key={meal.id}
              className="shrink-0 w-44 bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden"
              style={{ minWidth: "176px" }}
            >
              <div className="relative h-32">
                <Image
                  src={meal.imageUrl}
                  alt={meal.name}
                  fill
                  className="object-cover"
                  sizes="176px"
                />
                {meal.isNew && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-[#7ED22A] text-[#004945] text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-[#004945] leading-tight line-clamp-2">{meal.name}</p>
                <DietaryPills tags={meal.dietaryTags} className="mt-1.5" />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-[#004945]">{formatCurrency(meal.price)}</span>
                  <button className="w-7 h-7 rounded-full bg-[#004945] flex items-center justify-center hover:bg-[#003835] transition-colors">
                    <Plus className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {/* Half-card reveal to signal scroll */}
          <div className="shrink-0 w-10" aria-hidden />
        </div>
      </section>

      {/* ─── Recent Activity (repositioned below suggestions) ─── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#004945]">Recent Activity</h2>
            <Edit3 className="w-4 h-4 text-gray-300" />
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-3">
            {mockRecentActivity.map((act) => (
              <div key={act.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EAF7D9] flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-[#7ED22A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 line-clamp-1">{act.message}</p>
                  <p className="text-xs text-gray-400">{formatShortDate(act.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ─── Meal rating popup (bottom-left floating) ─── */}
      {deliveredOrder && <RatingPopup order={deliveredOrder} />}
    </div>
  );
}
