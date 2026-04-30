"use client";

import { useState } from "react";
import { mockSubscription, mockChallenges, mockReferralStats, mockLeaderboard, tierColors } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Flame, Star, Copy, Share2, Clock, Users, Gift, Lock, ChevronDown, Info, X } from "lucide-react";

const levelConfig = {
  easy:    { label: "Easy",    badge: "bg-emerald-100 text-emerald-800 border border-emerald-200", bar: "bg-emerald-400" },
  medium:  { label: "Medium",  badge: "bg-blue-100 text-blue-800 border border-blue-200",           bar: "bg-blue-400" },
  hard:    { label: "Hard",    badge: "bg-orange-100 text-orange-800 border border-orange-200",     bar: "bg-orange-400" },
  premium: { label: "Premium", badge: "bg-purple-100 text-purple-800 border border-purple-200",     bar: "bg-purple-500" },
} as const;

type Level = keyof typeof levelConfig;
const LEVELS: Level[] = ["easy", "medium", "hard", "premium"];

export default function RewardsPage() {
  const [leaderboardTab, setLeaderboardTab] = useState<"allTime" | "thisMonth">("allTime");
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  const [openLevels, setOpenLevels] = useState<Set<Level>>(new Set(["easy"]));

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

  const challengesByLevel = LEVELS.reduce<Record<Level, typeof mockChallenges>>((acc, lvl) => {
    acc[lvl] = mockChallenges.filter((c) => c.level === lvl);
    return acc;
  }, {} as Record<Level, typeof mockChallenges>);

  const toggleLevel = (lvl: Level) =>
    setOpenLevels((prev) => {
      const next = new Set(prev);
      next.has(lvl) ? next.delete(lvl) : next.add(lvl);
      return next;
    });

  const activeLeaderboard = mockLeaderboard[leaderboardTab];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#004945]">Rewards</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">Track your progress and earn credits</p>
      </div>

      {/* ── Section 1: Stats (3 cols) ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-3 text-2xl">🔥</div>
          <p className="text-4xl font-bold text-orange-600">{streak}</p>
          <p className="text-xs font-semibold text-orange-500 mt-1 uppercase tracking-wide">Week Streak</p>
          <p className="text-[10px] text-orange-400 mt-1">Active — keep it up!</p>
        </div>
        <div className="bg-gradient-to-br from-[#EAF7D9] to-[#f4fcea] border border-[#B9EA91] rounded-2xl p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#004945] flex items-center justify-center mb-3 shrink-0">
            <span className="text-[#7ED22A] font-bold text-xl">$</span>
          </div>
          <p className="text-4xl font-bold text-[#004945]">{formatCurrency(storeCredit)}</p>
          <p className="text-xs font-semibold text-[#004945] mt-1 uppercase tracking-wide">Store Credit</p>
          <p className="text-[10px] text-[#6B6B6B] mt-1">Applied to next order</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 rounded-2xl p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center mb-3">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-4xl font-bold text-yellow-600">{points}</p>
          <p className="text-xs font-semibold text-yellow-500 mt-1 uppercase tracking-wide">Points Earned</p>
          <p className="text-[10px] text-yellow-400 mt-1">Redeem for rewards</p>
        </div>
      </div>

      {/* ── Section 2: Membership (left) + Challenges (right) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">

        {/* Membership — fit height */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 flex flex-col self-start">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#004945]" />
              <h2 className="font-semibold text-[#004945] text-sm">Membership Tier</h2>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </span>
          </div>

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

          <div className="mt-auto grid grid-cols-4 gap-1.5">
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

        {/* Challenges — internal scroll + accordion by level */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 mb-4 shrink-0">
            <Flame className="w-4 h-4 text-[#004945]" />
            <h2 className="font-semibold text-[#004945] text-sm">Challenges</h2>
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {LEVELS.map((lvl) => {
              const cfg = levelConfig[lvl];
              const challenges = challengesByLevel[lvl];
              const isOpen = openLevels.has(lvl);
              return (
                <div key={lvl} className="border border-[#F0EBE0] rounded-xl overflow-hidden">
                  {/* Accordion header */}
                  <button
                    onClick={() => toggleLevel(lvl)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FDFBF7] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-[#9E9E9E]">{challenges.length} challenges</span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-[#9E9E9E] transition-transform", isOpen && "rotate-180")} />
                  </button>

                  {/* Accordion content */}
                  {isOpen && (
                    <div className="px-4 pb-3 space-y-3 border-t border-[#F0EBE0]">
                      {challenges.map((c) => {
                        const isLocked = c.status === "locked";
                        const isCompleted = c.status === "completed";
                        const pct = isCompleted ? 100 : Math.min(100, Math.round((c.current / c.target) * 100));
                        return (
                          <div key={c.id} className="mt-3">
                            {isCompleted ? (
                              <div className="flex items-center gap-3 px-3 py-2 rounded-xl border border-[#D6F0B2] bg-[#F4FCE8]">
                                <div className="w-5 h-5 rounded-full bg-[#7ED22A] flex items-center justify-center shrink-0">
                                  <span className="text-white text-[9px] font-bold">✓</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-[#004945] leading-tight">{c.name}</p>
                                  <p className="text-[10px] text-[#9E9E9E]">{c.description}</p>
                                </div>
                                <span className="text-[10px] font-semibold text-[#7ED22A] shrink-0">+{c.points} pts</span>
                              </div>
                            ) : (
                              <div className={`rounded-xl border p-3 transition-all ${isLocked ? "border-[#F0EBE0] bg-[#FDFBF7] opacity-60" : "border-[#E8E4DC] bg-white"}`}>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      {isLocked && <Lock className="w-3 h-3 text-[#9E9E9E] shrink-0" />}
                                      <p className={`font-semibold text-xs leading-tight ${isLocked ? "text-[#9E9E9E]" : "text-[#1A1A1A]"}`}>{c.name}</p>
                                    </div>
                                    <p className="text-[10px] text-[#9E9E9E]">{c.description}</p>
                                  </div>
                                  <div className="shrink-0 text-right">
                                    <Badge variant={c.rewardType === "credit" ? "green" : "gray"} size="sm">{c.reward}</Badge>
                                    <p className="text-[10px] text-[#9E9E9E] mt-1">+{c.points} pts</p>
                                  </div>
                                </div>
                                {!isLocked && (
                                  <>
                                    <div className="flex justify-between text-[10px] mb-1">
                                      <span className="text-[#9E9E9E]">{c.current} / {c.target}</span>
                                      <span className="font-semibold text-[#004945]">{pct}%</span>
                                    </div>
                                    <div className="w-full bg-[#F0EBE0] rounded-full h-1.5">
                                      <div className={`h-1.5 rounded-full transition-all ${cfg.bar}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    {"daysLeft" in c && c.daysLeft != null && (
                                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-600">
                                        <Clock className="w-3 h-3" />{c.daysLeft} days left
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Section 3: Referral (left) + Leaderboard (right) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">

        {/* Referral Program — fit height */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 self-start">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-[#004945]" />
            <h2 className="font-semibold text-[#004945] text-sm">Referral Program</h2>
          </div>
          <p className="text-xs text-[#9E9E9E] mb-4">
            Earn <strong className="text-[#004945]">$20 store credit</strong> for every friend who subscribes
          </p>

          <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider mb-3">Your results</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
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

          <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider mb-2">Your referral link</p>
          <div className="flex gap-2 mb-3 min-w-0">
            <div className="flex-1 min-w-0 bg-[#FDFBF7] border border-[#E8E4DC] rounded-lg px-3 py-2 text-xs text-[#6B6B6B] truncate font-mono">
              {mockReferralStats.referralLink}
            </div>
            <Button size="sm" variant="outline" className="shrink-0">
              <Copy className="w-3 h-3" /> Copy
            </Button>
          </div>
          <div className="flex gap-2 mb-4">
            <Button size="sm" className="flex-1"><Share2 className="w-3.5 h-3.5" /> WhatsApp</Button>
            <Button size="sm" variant="secondary" className="flex-1"><Gift className="w-3.5 h-3.5" /> Email</Button>
          </div>

          {mockReferralStats.successfulReferrals.length > 0 && (
            <>
              <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider mb-2">Successful Referrals</p>
              <div className="space-y-1.5">
                {mockReferralStats.successfulReferrals.map((ref) => {
                  const initials = `${ref.firstName[0]}${ref.lastName?.[0] ?? ""}`.toUpperCase();
                  const fullName = ref.lastName ? `${ref.firstName} ${ref.lastName}` : ref.firstName;
                  return (
                    <div key={ref.id} className="flex items-center justify-between px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#F0EBE0] flex items-center justify-center shrink-0">
                          <span className="text-[#6B6B6B] text-[10px] font-bold">{initials}</span>
                        </div>
                        <span className="text-xs text-[#1A1A1A] font-medium">{fullName}</span>
                        <span className="text-[10px] text-[#C4BFB5]">·</span>
                        <span className="text-[10px] text-[#C4BFB5]">{formatDate(ref.date, { month: "short", day: "numeric" })}</span>
                      </div>
                      <span className="text-[10px] text-[#7ED22A] font-semibold">✓ referred</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Leaderboard — internal scroll */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#004945]" />
              <h2 className="font-semibold text-[#004945] text-sm">Leaderboard</h2>
              <button
                onClick={() => setShowPointsInfo(true)}
                className="w-4 h-4 rounded-full border border-[#D4CFC5] flex items-center justify-center text-[#9E9E9E] hover:border-[#004945] hover:text-[#004945] transition-colors"
              >
                <Info className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="flex gap-1 bg-[#F0EBE0] rounded-lg p-1">
              {(["allTime", "thisMonth"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLeaderboardTab(tab)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    leaderboardTab === tab ? "bg-white text-[#004945] shadow-sm" : "text-[#6B6B6B] hover:text-[#004945]"
                  }`}
                >
                  {tab === "allTime" ? "All Time" : "This Month"}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-[#9E9E9E] mb-3">Ranking based on points earned</p>

          {/* Table header */}
          <div className="grid grid-cols-[2rem_1fr_auto] gap-3 px-3 pb-2 shrink-0">
            <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider">#</p>
            <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider">Name</p>
            <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wider text-right">Points</p>
          </div>

          <div className="overflow-y-auto flex-1 space-y-1 pr-1" style={{ maxHeight: 380 }}>
            {activeLeaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`grid grid-cols-[2rem_1fr_auto] gap-3 items-center px-3 py-2.5 rounded-xl transition-all ${
                  entry.isMe ? "bg-[#EAF7D9] border border-[#B9EA91]" : "hover:bg-[#FDFBF7]"
                }`}
              >
                <div className="flex items-center justify-center">
                  {entry.rank <= 3 ? (
                    <span className="text-base leading-none">
                      {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                    </span>
                  ) : (
                    <span className={`text-xs font-bold ${entry.isMe ? "text-[#004945]" : "text-[#9E9E9E]"}`}>{entry.rank}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${entry.isMe ? "text-[#004945] font-semibold" : "text-[#1A1A1A]"}`}>{entry.name}</p>
                  {entry.isMe && (
                    <span className="px-1.5 py-0.5 bg-[#004945] text-[#7ED22A] text-[9px] font-bold rounded-full leading-none">YOU</span>
                  )}
                </div>
                <p className={`text-sm font-bold text-right ${entry.isMe ? "text-[#004945]" : "text-[#6B6B6B]"}`}>
                  {entry.points.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Points Info Modal */}
      {showPointsInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-[#E8E4DC]">
            <div className="px-5 py-4 border-b border-[#F0EBE0] flex items-center justify-between">
              <h3 className="font-bold text-[#004945] text-sm">How to earn points</h3>
              <button onClick={() => setShowPointsInfo(false)} className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors">
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { icon: "🔥", title: "Weekly streak", desc: "Earn 50 pts for every consecutive week you keep your subscription active." },
                { icon: "🏆", title: "Complete challenges", desc: "Each challenge rewards between 100–500 pts depending on difficulty." },
                { icon: "👥", title: "Refer a friend", desc: "Get 200 pts when a friend signs up using your referral link." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 p-3 bg-[#FDFBF7] border border-[#F0EBE0] rounded-xl">
                  <span className="text-xl shrink-0">{icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-[#004945]">{title}</p>
                    <p className="text-[10px] text-[#9E9E9E] mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
