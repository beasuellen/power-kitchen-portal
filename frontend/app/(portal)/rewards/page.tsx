import { mockSubscription, mockChallenges, mockReferralStats, tierColors } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Trophy,
  Flame,
  Star,
  Copy,
  Share2,
  Clock,
} from "lucide-react";

export default function RewardsPage() {
  const { streak, tier, storeCredit, points } = mockSubscription;
  const tierStyle = tierColors[tier];

  const tierNextMap = { bronze: "Silver", silver: "Gold", gold: "Platinum", platinum: null };
  const tierWeeksMap = { bronze: 8, silver: 16, gold: 26, platinum: null };
  const nextTier = tierNextMap[tier];
  const weeksToNext = tierWeeksMap[tier];
  const streakPct = weeksToNext ? Math.min(100, Math.round((streak / weeksToNext) * 100)) : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#004945]">Rewards</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">Track your progress and earn credits</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Points */}
        <Card className="text-center">
          <CardBody className="py-5">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-[#004945]">{points}</p>
            <p className="text-sm text-[#6B6B6B] mt-1">Points earned</p>
          </CardBody>
        </Card>
        {/* Credits */}
        <Card className="text-center">
          <CardBody className="py-5">
            <div className="w-8 h-8 rounded-full bg-[#004945] flex items-center justify-center mx-auto mb-2 text-white font-bold text-sm">$</div>
            <p className="text-3xl font-bold text-[#004945]">{formatCurrency(storeCredit)}</p>
            <p className="text-sm text-[#6B6B6B] mt-1">Store credit</p>
          </CardBody>
        </Card>
        {/* Streak */}
        <Card className="text-center">
          <CardBody className="py-5">
            <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-[#004945]">{streak}</p>
            <p className="text-sm text-[#6B6B6B] mt-1">Week streak</p>
          </CardBody>
        </Card>
      </div>

      {/* Tier progress */}
      <Card>
        <CardBody className="py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <h2 className="font-semibold text-[#004945]">Membership Tier</h2>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </span>
          </div>

          {nextTier && weeksToNext && (
            <>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[#6B6B6B]">{streak} weeks active</span>
                <span className="text-[#004945] font-semibold">
                  {weeksToNext - streak} weeks to {nextTier}!
                </span>
              </div>
              <div className="w-full bg-[#F0EBE0] rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-[#004945] to-[#7ED22A] transition-all"
                  style={{ width: `${streakPct}%` }}
                />
              </div>
              <p className="text-xs text-[#9E9E9E] mt-2">
                Reach {nextTier} for:{" "}
                {nextTier === "Silver"
                  ? "Free delivery every 4th order"
                  : nextTier === "Gold"
                  ? "Exclusive meal access + 5% off"
                  : "Priority support + 10% off + birthday meal"}
              </p>
            </>
          )}

          {/* Tier grid */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {(["bronze", "silver", "gold", "platinum"] as const).map((t) => {
              const s = tierColors[t];
              const isActive = t === tier;
              return (
                <div
                  key={t}
                  className={`text-center p-2 rounded-lg border ${
                    isActive ? `${s.bg} ${s.border}` : "border-[#F0EBE0] bg-[#FDFBF7] opacity-50"
                  }`}
                >
                  <p className={`text-xs font-semibold ${isActive ? s.text : "text-[#6B6B6B]"}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${isActive ? s.text : "text-[#9E9E9E]"}`}>
                    {t === "bronze" ? "0–7w" : t === "silver" ? "8–15w" : t === "gold" ? "16–25w" : "26w+"}
                  </p>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Active Challenges */}
      <div>
        <h2 className="font-semibold text-[#004945] mb-3">Active Challenges</h2>
        <div className="space-y-3">
          {mockChallenges.map((c) => {
            const pct = Math.round((c.current / c.target) * 100);
            return (
              <Card key={c.id}>
                <CardBody className="py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="font-semibold text-[#1A1A1A] text-sm">{c.name}</p>
                      <p className="text-xs text-[#6B6B6B] mt-0.5">{c.description}</p>
                    </div>
                    <Badge variant="green" size="sm">{c.reward}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#9E9E9E]">{c.current}/{c.target}</span>
                      <span className="text-[#004945] font-medium">{pct}%</span>
                    </div>
                    <div className="w-full bg-[#F0EBE0] rounded-full h-2">
                      <div
                        className="bg-[#7ED22A] h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  {c.daysLeft && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-amber-600">
                      <Clock className="w-3 h-3" />
                      <span>{c.daysLeft} days left</span>
                    </div>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Referral Program */}
      <Card className="border-[#B9EA91] bg-gradient-to-br from-[#EAF7D9] to-white">
        <CardBody className="py-5">
          <div className="flex items-center gap-2 mb-1">
            <Share2 className="w-5 h-5 text-[#004945]" />
            <h2 className="font-semibold text-[#004945]">Referral Program</h2>
          </div>
          <p className="text-sm text-[#6B6B6B] mb-4">
            Earn <strong className="text-[#004945]">$20 store credit</strong> for every friend who subscribes!
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Sent", value: mockReferralStats.totalSent },
              { label: "Successful", value: mockReferralStats.successful },
              { label: "Earned", value: `$${mockReferralStats.totalEarned}` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center bg-white/80 rounded-xl p-3 border border-[#E8E4DC]">
                <p className="font-bold text-[#004945]">{value}</p>
                <p className="text-xs text-[#6B6B6B]">{label}</p>
              </div>
            ))}
          </div>

          {/* Referral link */}
          <div className="flex gap-2">
            <div className="flex-1 bg-white border border-[#E8E4DC] rounded-lg px-3 py-2 text-xs text-[#6B6B6B] truncate font-mono">
              {mockReferralStats.referralLink}
            </div>
            <Button size="sm" variant="outline" className="shrink-0">
              <Copy className="w-3.5 h-3.5" /> Copy
            </Button>
          </div>

          <div className="flex gap-2 mt-3">
            <Button size="sm" className="flex-1">
              <Share2 className="w-3.5 h-3.5" /> Share via WhatsApp
            </Button>
            <Button size="sm" variant="secondary" className="flex-1">
              Send via Email
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
