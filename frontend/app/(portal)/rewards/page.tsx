import { mockSubscription, mockChallenges, mockReferralStats, tierColors } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Flame, Star, Copy, Share2, Clock, Users, Gift } from "lucide-react";

export default function RewardsPage() {
  const { streak, tier, storeCredit, points } = mockSubscription;
  const tierStyle = tierColors[tier];

  const tierNextMap = { bronze: "Silver", silver: "Gold", gold: "Platinum", platinum: null };
  const tierWeeksMap = { bronze: 8, silver: 16, gold: 26, platinum: null };
  const nextTier = tierNextMap[tier];
  const weeksToNext = tierWeeksMap[tier];
  const streakPct = weeksToNext ? Math.min(100, Math.round((streak / weeksToNext) * 100)) : 100;

  const tierPerks: Record<string, string[]> = {
    bronze:   ["Full meal catalog access", "Weekly streak tracking"],
    silver:   ["Free delivery every 4th order", "Early access to new meals"],
    gold:     ["Exclusive meal access", "5% off every order", "Priority support"],
    platinum: ["10% off every order", "Birthday meal gift", "Dedicated account manager"],
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#004945]">Rewards</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">Track your progress and earn credits</p>
      </div>

      {/* ── Row 1: Stats em destaque (full width, 3 cols) ── */}
      <div className="grid grid-cols-3 gap-3">

        {/* Streak */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-3 text-2xl">
            🔥
          </div>
          <p className="text-4xl font-bold text-orange-600">{streak}</p>
          <p className="text-xs font-semibold text-orange-500 mt-1 uppercase tracking-wide">Week Streak</p>
          <p className="text-[10px] text-orange-400 mt-1">Active — keep it up!</p>
        </div>

        {/* Store Credit */}
        <div className="bg-gradient-to-br from-[#EAF7D9] to-[#f4fcea] border border-[#B9EA91] rounded-2xl p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#004945] flex items-center justify-center mb-3 shrink-0">
            <span className="text-[#7ED22A] font-bold text-xl">$</span>
          </div>
          <p className="text-4xl font-bold text-[#004945]">{formatCurrency(storeCredit)}</p>
          <p className="text-xs font-semibold text-[#004945] mt-1 uppercase tracking-wide">Store Credit</p>
          <p className="text-[10px] text-[#6B6B6B] mt-1">Applied to next order</p>
        </div>

        {/* Points */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 rounded-2xl p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center mb-3">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-4xl font-bold text-yellow-600">{points}</p>
          <p className="text-xs font-semibold text-yellow-500 mt-1 uppercase tracking-wide">Points Earned</p>
          <p className="text-[10px] text-yellow-400 mt-1">Redeem for rewards</p>
        </div>
      </div>

      {/* ── Row 2: Membership + Active Challenges (2 cols) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Membership Tier */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#004945]" />
              <h2 className="font-semibold text-[#004945] text-sm">Membership Tier</h2>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </span>
          </div>

          {/* Progress bar */}
          {nextTier && weeksToNext && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#6B6B6B]">{streak} weeks active</span>
                <span className="text-[#004945] font-semibold">{weeksToNext - streak}w to {nextTier}</span>
              </div>
              <div className="w-full bg-[#F0EBE0] rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-[#004945] to-[#7ED22A] transition-all"
                  style={{ width: `${streakPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Current perks */}
          <div className="mb-4">
            <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider mb-2">Your perks</p>
            <div className="space-y-1.5">
              {tierPerks[tier].map((perk) => (
                <div key={perk} className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                  <div className="w-4 h-4 rounded-full bg-[#EAF7D9] flex items-center justify-center shrink-0">
                    <span className="text-[#7ED22A] text-[9px] font-bold">✓</span>
                  </div>
                  {perk}
                </div>
              ))}
            </div>
          </div>

          {/* Tier ladder */}
          <div className="grid grid-cols-4 gap-1.5">
            {(["bronze", "silver", "gold", "platinum"] as const).map((t) => {
              const s = tierColors[t];
              const isActive = t === tier;
              return (
                <div
                  key={t}
                  className={`text-center p-2 rounded-lg border transition-all ${
                    isActive ? `${s.bg} ${s.border}` : "border-[#F0EBE0] bg-[#FDFBF7] opacity-40"
                  }`}
                >
                  <p className={`text-[10px] font-semibold ${isActive ? s.text : "text-[#6B6B6B]"}`}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </p>
                  <p className={`text-[9px] mt-0.5 ${isActive ? s.text : "text-[#9E9E9E]"}`}>
                    {t === "bronze" ? "0–7w" : t === "silver" ? "8–15w" : t === "gold" ? "16–25w" : "26w+"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Challenges */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-4 h-4 text-[#004945]" />
            <h2 className="font-semibold text-[#004945] text-sm">Active Challenges</h2>
          </div>
          <div className="space-y-5">
            {mockChallenges.map((c) => {
              const pct = Math.round((c.current / c.target) * 100);
              return (
                <div key={c.id}>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1A1A1A] text-sm leading-tight">{c.name}</p>
                      <p className="text-xs text-[#9E9E9E] mt-0.5">{c.description}</p>
                    </div>
                    <Badge variant="green" size="sm" className="shrink-0">{c.reward}</Badge>
                  </div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-[#9E9E9E]">{c.current} / {c.target}</span>
                    <span className="text-[#004945] font-semibold">{pct}%</span>
                  </div>
                  <div className="w-full bg-[#F0EBE0] rounded-full h-2">
                    <div className="bg-[#7ED22A] h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  {c.daysLeft && (
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-600">
                      <Clock className="w-3 h-3" />
                      <span>{c.daysLeft} days left</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 3: Referral Program (full width) ── */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-[#004945]" />
          <h2 className="font-semibold text-[#004945] text-sm">Referral Program</h2>
        </div>
        <p className="text-xs text-[#9E9E9E] mb-5">
          Earn <strong className="text-[#004945]">$20 store credit</strong> for every friend who subscribes
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Stats */}
          <div>
            <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider mb-3">Your results</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Sent", value: mockReferralStats.totalSent },
                { label: "Successful", value: mockReferralStats.successful },
                { label: "Earned", value: `$${mockReferralStats.totalEarned}` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center bg-[#FDFBF7] border border-[#F0EBE0] rounded-xl p-3">
                  <p className="font-bold text-[#004945] text-lg">{value}</p>
                  <p className="text-[10px] text-[#9E9E9E] mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Link + Share */}
          <div>
            <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider mb-3">Your referral link</p>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 bg-[#FDFBF7] border border-[#E8E4DC] rounded-lg px-3 py-2 text-xs text-[#6B6B6B] truncate font-mono">
                {mockReferralStats.referralLink}
              </div>
              <Button size="sm" variant="outline" className="shrink-0">
                <Copy className="w-3 h-3" /> Copy
              </Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">
                <Share2 className="w-3.5 h-3.5" /> WhatsApp
              </Button>
              <Button size="sm" variant="secondary" className="flex-1">
                <Gift className="w-3.5 h-3.5" /> Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
