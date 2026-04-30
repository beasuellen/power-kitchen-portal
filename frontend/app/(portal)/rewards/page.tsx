"use client";

import { useState } from "react";
import { mockSubscription, mockChallenges, mockReferralStats, mockLeaderboard, tierColors } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Flame, Star, Copy, Share2, Clock, Users, Gift, Lock } from "lucide-react";

// ── Challenge level config ────────────────────────────────────────────
const levelConfig = {
  easy: {
    label: "Easy",
    badge: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    bar: "bg-emerald-400",
    dot: "bg-emerald-400",
  },
  medium: {
    label: "Medium",
    badge: "bg-blue-100 text-blue-800 border border-blue-200",
    bar: "bg-blue-400",
    dot: "bg-blue-400",
  },
  hard: {
    label: "Hard",
    badge: "bg-orange-100 text-orange-800 border border-orange-200",
    bar: "bg-orange-400",
    dot: "bg-orange-400",
  },
  premium: {
    label: "Premium",
    badge: "bg-purple-100 text-purple-800 border border-purple-200",
    bar: "bg-purple-500",
    dot: "bg-purple-500",
  },
} as const;

type Level = keyof typeof levelConfig;

const LEVELS: Level[] = ["easy", "medium", "hard", "premium"];

export default function RewardsPage() {
  const [leaderboardTab, setLeaderboardTab] = useState<"allTime" | "thisMonth">("allTime");

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

  // Group challenges by level
  const challengesByLevel = LEVELS.reduce<Record<Level, typeof mockChallenges>>((acc, lvl) => {
    acc[lvl] = mockChallenges.filter((c) => c.level === lvl);
    return acc;
  }, {} as Record<Level, typeof mockChallenges>);

  const activeLeaderboard = mockLeaderboard[leaderboardTab];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#004945]">Rewards</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">Track your progress and earn credits</p>
      </div>

      {/* ── Row 1: Stats ── */}
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

      {/* ── Row 2: Membership Tier ── */}
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

      {/* ── Row 3: Challenges — 4 levels ── */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
        <div className="flex items-center gap-2 mb-5">
          <Flame className="w-4 h-4 text-[#004945]" />
          <h2 className="font-semibold text-[#004945] text-sm">Challenges</h2>
        </div>

        <div className="space-y-6">
          {LEVELS.map((lvl) => {
            const cfg = levelConfig[lvl];
            const challenges = challengesByLevel[lvl];
            return (
              <div key={lvl}>
                {/* Level header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                  <div className="flex-1 h-px bg-[#F0EBE0]" />
                </div>

                <div className="space-y-4">
                  {challenges.map((c) => {
                    const isLocked = c.status === "locked";
                    const isCompleted = c.status === "completed";
                    const pct = isCompleted
                      ? 100
                      : Math.min(100, Math.round((c.current / c.target) * 100));

                    return (
                      <div
                        key={c.id}
                        className={`rounded-xl border p-4 transition-all ${
                          isLocked
                            ? "border-[#F0EBE0] bg-[#FDFBF7] opacity-60"
                            : isCompleted
                            ? "border-[#B9EA91] bg-[#EAF7D9]"
                            : "border-[#E8E4DC] bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              {isLocked && <Lock className="w-3 h-3 text-[#9E9E9E] shrink-0" />}
                              {isCompleted && (
                                <div className="w-4 h-4 rounded-full bg-[#7ED22A] flex items-center justify-center shrink-0">
                                  <span className="text-white text-[9px] font-bold">✓</span>
                                </div>
                              )}
                              <p className={`font-semibold text-sm leading-tight ${isLocked ? "text-[#9E9E9E]" : "text-[#1A1A1A]"}`}>
                                {c.name}
                              </p>
                            </div>
                            <p className="text-xs text-[#9E9E9E]">{c.description}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <Badge variant={c.rewardType === "credit" ? "green" : "gray"} size="sm">
                              {c.reward}
                            </Badge>
                            <p className="text-[10px] text-[#9E9E9E] mt-1 text-right">+{c.points} pts</p>
                          </div>
                        </div>

                        {!isLocked && (
                          <>
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-[#9E9E9E]">{c.current} / {c.target}</span>
                              <span className={`font-semibold ${isCompleted ? "text-[#004945]" : "text-[#004945]"}`}>
                                {isCompleted ? "Complete!" : `${pct}%`}
                              </span>
                            </div>
                            <div className="w-full bg-[#F0EBE0] rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${isCompleted ? "bg-[#7ED22A]" : cfg.bar}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            {"daysLeft" in c && c.daysLeft != null && (
                              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-600">
                                <Clock className="w-3 h-3" />
                                <span>{c.daysLeft} days left</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Row 4: Referral Program ── */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-[#004945]" />
          <h2 className="font-semibold text-[#004945] text-sm">Referral Program</h2>
        </div>
        <p className="text-xs text-[#9E9E9E] mb-5">
          Earn <strong className="text-[#004945]">$20 store credit</strong> for every friend who subscribes
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
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

        {/* Successful Referrals list */}
        {mockReferralStats.successfulReferrals.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider mb-2">Successful Referrals</p>
            <div className="space-y-2">
              {mockReferralStats.successfulReferrals.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between px-3 py-2 bg-[#EAF7D9] border border-[#B9EA91] rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#004945] flex items-center justify-center shrink-0">
                      <span className="text-[#7ED22A] text-[10px] font-bold">{ref.firstName[0]}</span>
                    </div>
                    <span className="text-sm font-medium text-[#1A1A1A]">{ref.firstName}</span>
                    <span className="text-xs text-[#6B6B6B]">·</span>
                    <span className="text-xs text-[#6B6B6B]">
                      {formatDate(ref.date, { month: "long", day: "numeric" })}
                    </span>
                  </div>
                  <span className="text-[#7ED22A] font-bold text-sm">✓</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Row 5: Leaderboard ── */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#004945]" />
            <h2 className="font-semibold text-[#004945] text-sm">Leaderboard</h2>
          </div>
          {/* Tab buttons */}
          <div className="flex gap-1 bg-[#F0EBE0] rounded-lg p-1">
            <button
              onClick={() => setLeaderboardTab("allTime")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                leaderboardTab === "allTime"
                  ? "bg-white text-[#004945] shadow-sm"
                  : "text-[#6B6B6B] hover:text-[#004945]"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setLeaderboardTab("thisMonth")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                leaderboardTab === "thisMonth"
                  ? "bg-white text-[#004945] shadow-sm"
                  : "text-[#6B6B6B] hover:text-[#004945]"
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        <div className="space-y-1">
          {/* Table header */}
          <div className="grid grid-cols-[2rem_1fr_auto] gap-3 px-3 pb-2">
            <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider">#</p>
            <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider">Name</p>
            <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider text-right">Points</p>
          </div>

          {activeLeaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`grid grid-cols-[2rem_1fr_auto] gap-3 items-center px-3 py-2.5 rounded-xl transition-all ${
                entry.isMe
                  ? "bg-[#EAF7D9] border border-[#B9EA91]"
                  : "hover:bg-[#FDFBF7]"
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center">
                {entry.rank <= 3 ? (
                  <span className="text-base leading-none">
                    {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                  </span>
                ) : (
                  <span className={`text-xs font-bold ${entry.isMe ? "text-[#004945]" : "text-[#9E9E9E]"}`}>
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Name */}
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium ${entry.isMe ? "text-[#004945] font-semibold" : "text-[#1A1A1A]"}`}>
                  {entry.name}
                </p>
                {entry.isMe && (
                  <span className="px-1.5 py-0.5 bg-[#004945] text-[#7ED22A] text-[9px] font-bold rounded-full leading-none">
                    YOU
                  </span>
                )}
              </div>

              {/* Points */}
              <p className={`text-sm font-bold text-right ${entry.isMe ? "text-[#004945]" : "text-[#6B6B6B]"}`}>
                {entry.points.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
