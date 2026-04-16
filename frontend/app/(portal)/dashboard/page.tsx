import { mockCustomer, mockSubscription, mockOrders, mockMeals, mockChallenges, mockRecentActivity, tierColors } from "@/lib/mock-data";
import { formatDate, formatShortDate, daysUntil, formatCurrency } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DietaryPills } from "@/components/ui/DietaryPills";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  Flame,
  Star,
  ArrowRight,
  Plus,
  Edit3,
  SkipForward,
  Trophy,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const { firstName } = mockCustomer;
  const { planName, mealsPerWeek, streak, tier, storeCredit, points } = mockSubscription;
  const tierStyle = tierColors[tier];

  const nextOrder = mockOrders.find((o) => o.status === "customizable" || o.status === "locked");
  const deliveredOrder = mockOrders.find((o) => o.status === "delivered");
  const daysLeft = nextOrder ? daysUntil(nextOrder.deliveryDate) : 0;

  const suggestedMeals = mockMeals.filter(
    (m) => m.category === "breakfast" || m.isNew
  ).slice(0, 3);

  const topChallenge = mockChallenges[0];
  const challengePct = Math.round((topChallenge.current / topChallenge.target) * 100);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#2D6A4F] to-[#40916C] rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Welcome back, {firstName}!</h1>
            <p className="text-green-100 text-sm">{planName} — {mealsPerWeek} meals/week</p>
            {nextOrder && (
              <div className="flex items-center gap-2 mt-3">
                <CalendarDays className="w-4 h-4 text-green-200" />
                <span className="text-sm text-green-50">
                  Next delivery in{" "}
                  <strong>{daysLeft} {daysLeft === 1 ? "day" : "days"}</strong>{" "}
                  — {formatDate(nextOrder.deliveryDate, { weekday: "long", month: "long", day: "numeric" })}
                </span>
              </div>
            )}
          </div>
          {nextOrder && (
            <div className="flex gap-2 shrink-0">
              <Link href={`/orders/${nextOrder.id}`}>
                <Button
                  size="sm"
                  className="bg-white text-[#2D6A4F] hover:bg-green-50"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Customize Order
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                className="border-green-300 text-white hover:bg-white/10"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Skip
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Order Card */}
        <div className="lg:col-span-2">
          {nextOrder && (
            <Card className="h-full">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">Next Order</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {formatDate(nextOrder.deliveryDate, { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                  </div>
                  {nextOrder.status === "customizable" ? (
                    <Badge variant="green">Ready to customize</Badge>
                  ) : (
                    <Badge variant="gray">
                      🔒 Locked
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                {/* Meal thumbnails */}
                <div className="grid grid-cols-4 gap-2 mt-3 mb-4">
                  {nextOrder.items.slice(0, 4).map((item, i) => (
                    <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.meal.imageUrl}
                        alt={item.meal.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 10vw"
                      />
                      {item.quantity > 1 && (
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold px-1 rounded">
                          ×{item.quantity}
                        </div>
                      )}
                      {i === 3 && nextOrder.items.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-bold">
                          +{nextOrder.items.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Order total</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(nextOrder.total)}</p>
                  </div>
                  <Link href={`/orders/${nextOrder.id}`}>
                    <Button>
                      View & Edit
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                {nextOrder.status === "locked" && (
                  <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
                    🔒 Customization opens on {formatShortDate(nextOrder.cutoffDate)}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right column: streak + top challenge */}
        <div className="space-y-4">
          {/* Subscription health */}
          <Card>
            <CardBody className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Your Progress</h3>
                <Link href="/rewards" className="text-xs text-[#2D6A4F] font-medium hover:underline">
                  View all →
                </Link>
              </div>
              {/* Streak */}
              <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-lg">
                  🔥
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{streak} weeks active</p>
                  <p className="text-xs text-gray-500">Keep it going!</p>
                </div>
              </div>
              {/* Points */}
              <div className="flex items-center gap-3 py-2 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{points} points</p>
                  <p className="text-xs text-gray-500">{formatCurrency(storeCredit)} store credit</p>
                </div>
              </div>
              {/* Tier */}
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)} Member
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">2 more weeks → Platinum!</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Top challenge */}
          <Card>
            <CardBody className="pt-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Active Challenge</h3>
                <Link href="/rewards" className="text-xs text-[#2D6A4F] font-medium hover:underline">
                  All challenges →
                </Link>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{topChallenge.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 mb-3">{topChallenge.description}</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">{topChallenge.current}/{topChallenge.target} weeks</span>
                  <span className="font-semibold text-[#2D6A4F]">{topChallenge.reward}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-[#2D6A4F] h-2 rounded-full transition-all"
                    style={{ width: `${challengePct}%` }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Smart Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-gray-900">Have you tried our Breakfast options?</h2>
            <p className="text-sm text-gray-500">Quick add to your next order</p>
          </div>
          <Link href="/orders" className="text-sm text-[#2D6A4F] font-medium flex items-center gap-1 hover:underline">
            See all meals <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {suggestedMeals.map((meal) => (
            <Card key={meal.id} hover>
              <div className="relative h-36 rounded-t-xl overflow-hidden">
                <Image
                  src={meal.imageUrl}
                  alt={meal.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {meal.isNew && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="green">New</Badge>
                  </div>
                )}
              </div>
              <CardBody className="pt-3">
                <p className="font-medium text-sm text-gray-900 line-clamp-1">{meal.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <DietaryPills tags={meal.dietaryTags} />
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(meal.price)}</span>
                </div>
                <Button size="sm" className="w-full mt-2" variant="outline">
                  <Plus className="w-3.5 h-3.5" /> Quick Add
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-3">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D8F3DC] flex items-center justify-center shrink-0">
                  {activity.icon === "edit" && <Edit3 className="w-3.5 h-3.5 text-[#2D6A4F]" />}
                  {activity.icon === "plus" && <Plus className="w-3.5 h-3.5 text-[#2D6A4F]" />}
                  {activity.icon === "star" && <Star className="w-3.5 h-3.5 text-[#2D6A4F]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 line-clamp-1">{activity.message}</p>
                  <p className="text-xs text-gray-400">{formatShortDate(activity.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Post-delivery rating prompt */}
      {deliveredOrder && (
        <div className="rounded-xl border border-[#2D6A4F] bg-[#D8F3DC] p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-[#2D6A4F]">How were your meals this week?</p>
            <p className="text-sm text-gray-600 mt-0.5">Rate your Apr 17 delivery and earn 5 points!</p>
          </div>
          <Button size="sm">
            <TrendingUp className="w-3.5 h-3.5" /> Rate Meals
          </Button>
        </div>
      )}
    </div>
  );
}
