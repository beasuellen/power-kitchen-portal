"use client";

import { useState } from "react";
import { mockSubscription, mockChallenges, mockReferralStats, mockLeaderboard, tierColors } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Trophy, Flame, Star, Copy, Share2, Clock, Users, Gift, Lock,
  ChevronDown, X, Medal, BookOpen, HelpCircle, Info, Sparkles, BarChart3,
  ArrowUpRight, CheckCircle2, Zap, Truck, Tag, Headphones, Check, Wallet,
} from "lucide-react";

// ─── Level config ────────────────────────────────────────────────
const levelConfig = {
  easy:    { label: "Easy",    badge: "bg-emerald-100 text-emerald-800 border border-emerald-200", bar: "bg-emerald-400" },
  medium:  { label: "Medium",  badge: "bg-blue-100 text-blue-800 border border-blue-200",           bar: "bg-blue-400" },
  hard:    { label: "Hard",    badge: "bg-orange-100 text-orange-800 border border-orange-200",     bar: "bg-orange-400" },
  premium: { label: "Premium", badge: "bg-purple-100 text-purple-800 border border-purple-200",     bar: "bg-purple-500" },
} as const;

type Level = keyof typeof levelConfig;
const LEVELS: Level[] = ["easy", "medium", "hard", "premium"];

// ─── Section info content ────────────────────────────────────────
type SectionKey = "streak" | "credits" | "points" | "challenges" | "referral" | "tier" | "leaderboard";

const sectionContent: Record<SectionKey, { title: string; color: string; items: { icon: React.ReactNode; title: string; desc: string }[] }> = {
  streak: {
    title: "How your Streak works",
    color: "text-orange-500",
    items: [
      { icon: <Flame className="w-4 h-4 text-orange-500" />, title: "Build it weekly", desc: "Every consecutive active week adds +1 to your streak. Stay subscribed and don't skip." },
      { icon: <X className="w-4 h-4 text-red-400" />, title: "Skip or pause resets it", desc: "Skipping a delivery or pausing your subscription resets the counter to 0." },
      { icon: <Trophy className="w-4 h-4 text-yellow-500" />, title: "Tier stays safe", desc: "Your membership tier is never lost — even if your streak resets, you keep your level." },
      { icon: <Zap className="w-4 h-4 text-[#7ED22A]" />, title: "+50 points per week", desc: "Each active week earns you 50 points, automatically added to your balance." },
    ],
  },
  credits: {
    title: "How Store Credit works",
    color: "text-[#004945]",
    items: [
      { icon: <Gift className="w-4 h-4 text-[#004945]" />, title: "Earned through rewards", desc: "Complete challenges, refer friends, or unlock tier bonuses to receive store credit." },
      { icon: <CheckCircle2 className="w-4 h-4 text-[#7ED22A]" />, title: "Applied automatically", desc: "Credits are applied automatically to your next order at checkout — no coupon needed." },
      { icon: <Star className="w-4 h-4 text-yellow-500" />, title: "Never expires", desc: "Store credit never expires as long as your subscription is active." },
      { icon: <ArrowUpRight className="w-4 h-4 text-blue-500" />, title: "Stackable", desc: "You can accumulate as much credit as you want. There's no cap." },
    ],
  },
  points: {
    title: "How Points work",
    color: "text-yellow-600",
    items: [
      { icon: <Flame className="w-4 h-4 text-orange-500" />, title: "+50 pts / active week", desc: "Every week you stay active adds 50 points to your balance." },
      { icon: <Sparkles className="w-4 h-4 text-purple-500" />, title: "+100–500 pts per challenge", desc: "Completing challenges rewards varying points based on difficulty level." },
      { icon: <Users className="w-4 h-4 text-[#004945]" />, title: "+200 pts per referral", desc: "Each friend who subscribes through your link earns you 200 bonus points." },
      { icon: <Star className="w-4 h-4 text-yellow-500" />, title: "+10 pts per meal rating", desc: "Rate your delivered meals to earn 10 points each time." },
      { icon: <BarChart3 className="w-4 h-4 text-blue-500" />, title: "Leaderboard ranking", desc: "Your total points determine your position on the community leaderboard." },
    ],
  },
  challenges: {
    title: "How Challenges work",
    color: "text-[#004945]",
    items: [
      { icon: <Zap className="w-4 h-4 text-emerald-500" />, title: "4 difficulty levels", desc: "Challenges are grouped into Easy, Medium, Hard, and Premium — each with bigger rewards." },
      { icon: <Trophy className="w-4 h-4 text-yellow-500" />, title: "Earn credits & points", desc: "Each completed challenge rewards you with store credit and/or points." },
      { icon: <Clock className="w-4 h-4 text-amber-500" />, title: "Some are time-limited", desc: "Certain challenges have a countdown — complete them before they expire." },
      { icon: <Lock className="w-4 h-4 text-[#9E9E9E]" />, title: "Locked challenges", desc: "Some challenges unlock only after completing prerequisites or reaching a tier." },
    ],
  },
  referral: {
    title: "How Referrals work",
    color: "text-[#004945]",
    items: [
      { icon: <Share2 className="w-4 h-4 text-[#7ED22A]" />, title: "Share your unique link", desc: "Every account has a personal referral link. Share it with friends via WhatsApp, email, or DM." },
      { icon: <Gift className="w-4 h-4 text-[#004945]" />, title: "$20 credit when they subscribe", desc: "As soon as a friend completes their first subscription payment, you receive $20 store credit." },
      { icon: <Users className="w-4 h-4 text-blue-500" />, title: "+200 bonus points", desc: "On top of the credit, you also earn 200 points per successful referral." },
      { icon: <Sparkles className="w-4 h-4 text-purple-500" />, title: "No limit", desc: "Refer as many friends as you want — there's no cap on referral earnings." },
    ],
  },
  tier: {
    title: "How Membership Tiers work",
    color: "text-[#004945]",
    items: [
      { icon: <Trophy className="w-4 h-4 text-yellow-500" />, title: "4 tiers: Bronze → Platinum", desc: "Start at Bronze and progress through Silver, Gold, and Platinum by staying consistent." },
      { icon: <Flame className="w-4 h-4 text-orange-500" />, title: "12 consecutive active weeks", desc: "Complete 12 active weeks in a row to level up. Each cycle resets after advancement." },
      { icon: <X className="w-4 h-4 text-red-400" />, title: "Skip resets the cycle", desc: "Skipping or pausing resets your streak cycle, but your current tier is always kept." },
      { icon: <CheckCircle2 className="w-4 h-4 text-[#7ED22A]" />, title: "Perks per tier", desc: "Each tier unlocks better perks — free delivery, discounts, exclusive meals, and priority support." },
    ],
  },
  leaderboard: {
    title: "How the Leaderboard works",
    color: "text-[#004945]",
    items: [
      { icon: <BarChart3 className="w-4 h-4 text-blue-500" />, title: "Ranked by total points", desc: "All subscribers are ranked by their cumulative points. The more active you are, the higher you rank." },
      { icon: <Clock className="w-4 h-4 text-amber-500" />, title: "All Time vs. This Month", desc: "'All Time' shows the lifetime ranking. 'This Month' resets on the 1st of each month." },
      { icon: <Trophy className="w-4 h-4 text-yellow-500" />, title: "Top performers win prizes", desc: "The top 3 subscribers each month receive exclusive rewards and bonus store credit." },
      { icon: <Users className="w-4 h-4 text-[#004945]" />, title: "Community-wide", desc: "You compete with all active Power Kitchen subscribers nationwide." },
    ],
  },
};

// ─── Mini info popup ─────────────────────────────────────────────
function SectionInfoModal({ sectionKey, onClose }: { sectionKey: SectionKey; onClose: () => void }) {
  const content = sectionContent[sectionKey];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-[#E8E4DC]" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[#F0EBE0] flex items-center justify-between">
          <h3 className="font-semibold text-[#004945] text-sm">{content.title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors">
            <X className="w-4 h-4 text-[#6B6B6B]" />
          </button>
        </div>
        <div className="px-5 py-2">
          {content.items.map(({ title, desc }, i) => (
            <div
              key={title}
              className={`py-3.5 ${i < content.items.length - 1 ? "border-b border-[#F0EBE0]" : ""}`}
            >
              <p className="text-sm font-semibold text-[#1A1A1A] mb-1">{title}</p>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Card header tutorial icon ────────────────────────────────────
function TutorialIcon({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="text-[#004945] hover:text-[#7ED22A] transition-colors shrink-0"
      title="How this works"
    >
      <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.8335 12.8099C12.8335 12.5005 12.9564 12.2038 13.1752 11.985C13.394 11.7662 13.6907 11.6433 14.0002 11.6433C14.3096 11.6433 14.6063 11.7662 14.8251 11.985C15.0439 12.2038 15.1668 12.5005 15.1668 12.8099V19.8099C15.1668 20.1193 15.0439 20.4161 14.8251 20.6349C14.6063 20.8537 14.3096 20.9766 14.0002 20.9766C13.6907 20.9766 13.394 20.8537 13.1752 20.6349C12.9564 20.4161 12.8335 20.1193 12.8335 19.8099V12.8099ZM14.0002 7.05942C13.6907 7.05942 13.394 7.18233 13.1752 7.40113C12.9564 7.61992 12.8335 7.91667 12.8335 8.22609C12.8335 8.5355 12.9564 8.83225 13.1752 9.05104C13.394 9.26984 13.6907 9.39275 14.0002 9.39275C14.3096 9.39275 14.6063 9.26984 14.8251 9.05104C15.0439 8.83225 15.1668 8.5355 15.1668 8.22609C15.1668 7.91667 15.0439 7.61992 14.8251 7.40113C14.6063 7.18233 14.3096 7.05942 14.0002 7.05942Z" fill="currentColor"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M14.0002 2.33325C7.55666 2.33325 2.3335 7.55642 2.3335 13.9999C2.3335 20.4434 7.55666 25.6666 14.0002 25.6666C20.4437 25.6666 25.6668 20.4434 25.6668 13.9999C25.6668 7.55642 20.4437 2.33325 14.0002 2.33325ZM4.66683 13.9999C4.66683 16.4753 5.65016 18.8492 7.4005 20.5996C9.15084 22.3499 11.5248 23.3333 14.0002 23.3333C16.4755 23.3333 18.8495 22.3499 20.5998 20.5996C22.3502 18.8492 23.3335 16.4753 23.3335 13.9999C23.3335 11.5246 22.3502 9.15059 20.5998 7.40026C18.8495 5.64992 16.4755 4.66659 14.0002 4.66659C11.5248 4.66659 9.15084 5.64992 7.4005 7.40026C5.65016 9.15059 4.66683 11.5246 4.66683 13.9999Z" fill="currentColor"/>
      </svg>
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────
export default function RewardsPage() {
  const [leaderboardTab, setLeaderboardTab] = useState<"allTime" | "thisMonth">("allTime");
  const [openLevels, setOpenLevels] = useState<Set<Level>>(new Set(["easy"]));
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [sectionInfo, setSectionInfo] = useState<SectionKey | null>(null);
  const [openHowSections, setOpenHowSections] = useState<Set<SectionKey>>(new Set(["streak"]));
  const toggleHowSection = (key: SectionKey) =>
    setOpenHowSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const { streak, tier, storeCredit, points } = mockSubscription;
  const tierStyle = tierColors[tier];

  const WEEKS_PER_CYCLE = 12;
  const tierNextMap = { bronze: "Silver", silver: "Gold", gold: "Platinum", platinum: null };
  const nextTier         = tierNextMap[tier];
  const weeksInCycle     = streak % WEEKS_PER_CYCLE;
  const cyclePct         = Math.round((weeksInCycle / WEEKS_PER_CYCLE) * 100);
  const weeksToNextLevel = WEEKS_PER_CYCLE - weeksInCycle;

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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#004945]">Rewards</h1>
          <button
            onClick={() => setShowHowItWorks(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF7D9] border border-[#B9EA91] text-[#004945] hover:bg-[#7ED22A] hover:text-white transition-colors shrink-0"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold whitespace-nowrap">How it works</span>
          </button>
        </div>
        <p className="text-sm text-[#6B6B6B] mt-0.5">Track your progress and earn credits</p>
      </div>

      {/* ── Stats ── */}

      {/* Mobile: unified compact card */}
      <div className="sm:hidden bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-[#F0EBE0]">
          <button onClick={() => setSectionInfo("streak")} className="flex flex-col items-center gap-2 py-5 px-2 active:bg-orange-50 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600 leading-none">{streak}</p>
            <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wide text-center leading-tight">Week<br/>Streak</p>
          </button>

          <button onClick={() => setSectionInfo("credits")} className="flex flex-col items-center gap-2 py-5 px-2 bg-gradient-to-b from-[#EAF7D9]/50 to-transparent active:from-[#EAF7D9] transition-colors">
            <div className="w-8 h-8 rounded-xl bg-[#004945] flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[#7ED22A]" />
            </div>
            <p className="text-2xl font-bold text-[#004945] leading-none">{formatCurrency(storeCredit)}</p>
            <p className="text-[10px] font-semibold text-[#004945] uppercase tracking-wide text-center leading-tight">Store<br/>Credit</p>
          </button>

          <button onClick={() => setSectionInfo("points")} className="flex flex-col items-center gap-2 py-5 px-2 active:bg-yellow-50 transition-colors">
            <div className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-600 leading-none">{points}</p>
            <p className="text-[10px] font-semibold text-yellow-500 uppercase tracking-wide text-center leading-tight">Points<br/>Earned</p>
          </button>
        </div>
      </div>

      {/* Desktop: 3 separate gradient cards */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-3">
        <div onClick={() => setSectionInfo("streak")} className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:border-orange-200 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-3">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-4xl font-bold text-orange-600">{streak}</p>
          <p className="text-xs font-semibold text-orange-500 mt-1 uppercase tracking-wide">Week Streak</p>
        </div>
        <div onClick={() => setSectionInfo("credits")} className="bg-gradient-to-br from-[#EAF7D9] to-[#f4fcea] border border-[#B9EA91] rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:border-[#7ED22A] transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#004945] flex items-center justify-center mb-3 shrink-0">
            <Wallet className="w-6 h-6 text-[#7ED22A]" />
          </div>
          <p className="text-4xl font-bold text-[#004945]">{formatCurrency(storeCredit)}</p>
          <p className="text-xs font-semibold text-[#004945] mt-1 uppercase tracking-wide">Store Credit</p>
        </div>
        <div onClick={() => setSectionInfo("points")} className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100 rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer hover:shadow-md hover:border-yellow-200 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center mb-3">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-4xl font-bold text-yellow-600">{points}</p>
          <p className="text-xs font-semibold text-yellow-500 mt-1 uppercase tracking-wide">Points Earned</p>
        </div>
      </div>

      {/* ── Challenges + Referral ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">

        {/* Challenges */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#004945]" />
              <h2 className="font-semibold text-[#004945] text-sm">Challenges</h2>
              <TutorialIcon onClick={() => setSectionInfo("challenges")} />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {LEVELS.map((lvl) => {
              const cfg = levelConfig[lvl];
              const challenges = challengesByLevel[lvl];
              const isOpen = openLevels.has(lvl);
              return (
                <div key={lvl} className="border border-[#F0EBE0] rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleLevel(lvl)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FDFBF7] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.badge}`}>{cfg.label}</span>
                      <span className="text-[11px] text-[#9E9E9E]">{challenges.length} challenges</span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-[#9E9E9E] transition-transform", isOpen && "rotate-180")} />
                  </button>

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
                                  <span className="text-white text-[11px] font-bold">✓</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-[#004945] leading-tight">{c.name}</p>
                                  <p className="text-[11px] text-[#9E9E9E]">{c.description}</p>
                                </div>
                                <span className="text-[11px] font-semibold text-[#7ED22A] shrink-0">+{c.points} pts</span>
                              </div>
                            ) : (
                              <div className={`rounded-xl border p-3 transition-all ${isLocked ? "border-[#F0EBE0] bg-[#FDFBF7] opacity-60" : "border-[#E8E4DC] bg-white"}`}>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      {isLocked && <Lock className="w-3 h-3 text-[#9E9E9E] shrink-0" />}
                                      <p className={`font-semibold text-xs leading-tight ${isLocked ? "text-[#9E9E9E]" : "text-[#1A1A1A]"}`}>{c.name}</p>
                                    </div>
                                    <p className="text-[11px] text-[#9E9E9E]">{c.description}</p>
                                  </div>
                                  <div className="shrink-0 text-right">
                                    <Badge variant={c.rewardType === "credit" ? "green" : "gray"} size="sm">{c.reward}</Badge>
                                    <p className="text-[11px] text-[#9E9E9E] mt-1">+{c.points} pts</p>
                                  </div>
                                </div>
                                {!isLocked && (
                                  <>
                                    <div className="flex justify-between text-[11px] mb-1">
                                      <span className="text-[#9E9E9E]">{c.current} / {c.target}</span>
                                      <span className="font-semibold text-[#004945]">{pct}%</span>
                                    </div>
                                    <div className="w-full bg-[#F0EBE0] rounded-full h-1.5">
                                      <div className={`h-1.5 rounded-full transition-all ${cfg.bar}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    {"daysLeft" in c && c.daysLeft != null && (
                                      <div className="flex items-center gap-1 mt-1.5 text-[11px] text-amber-600">
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

        {/* Referral */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 self-start">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#004945]" />
              <h2 className="font-semibold text-[#004945] text-sm">Referral Program</h2>
              <TutorialIcon onClick={() => setSectionInfo("referral")} />
            </div>
          </div>
          <p className="text-xs text-[#9E9E9E] mb-4">
            Earn <strong className="text-[#004945]">$20 store credit</strong> for every friend who subscribes
          </p>

          <p className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-wider mb-3">Your results</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Sent",       value: mockReferralStats.totalSent },
              { label: "Successful", value: mockReferralStats.successful },
              { label: "Earned",     value: `$${mockReferralStats.totalEarned}` },
            ].map(({ label, value }) => (
              <div key={label} className="text-center bg-[#FDFBF7] border border-[#F0EBE0] rounded-xl p-3">
                <p className="font-bold text-[#004945] text-lg">{value}</p>
                <p className="text-[11px] text-[#9E9E9E] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <p className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-wider mb-2">Your referral link</p>
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
              <p className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-wider mb-2">Successful Referrals</p>
              <div className="space-y-1.5">
                {mockReferralStats.successfulReferrals.map((ref) => {
                  const initials = `${ref.firstName[0]}${ref.lastName?.[0] ?? ""}`.toUpperCase();
                  const fullName = ref.lastName ? `${ref.firstName} ${ref.lastName}` : ref.firstName;
                  return (
                    <div key={ref.id} className="flex items-center justify-between px-2 py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#F0EBE0] flex items-center justify-center shrink-0">
                          <span className="text-[#6B6B6B] text-[11px] font-bold">{initials}</span>
                        </div>
                        <span className="text-xs text-[#1A1A1A] font-medium">{fullName}</span>
                        <span className="text-[11px] text-[#C4BFB5]">·</span>
                        <span className="text-[11px] text-[#C4BFB5]">{formatDate(ref.date, { month: "short", day: "numeric" })}</span>
                      </div>
                      <span className="text-[11px] text-[#7ED22A] font-semibold">✓ referred</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Membership Tier + Leaderboard ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">

        {/* Membership Tier */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 flex flex-col self-start">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#004945]" />
              <h2 className="font-semibold text-[#004945] text-sm">Membership Tier</h2>
              <TutorialIcon onClick={() => setSectionInfo("tier")} />
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </span>
          </div>

          {nextTier ? (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#6B6B6B]">{weeksInCycle} / {WEEKS_PER_CYCLE} active weeks</span>
                <span className="text-[#004945] font-semibold">{weeksToNextLevel}w to {nextTier}</span>
              </div>
              <div className="w-full bg-[#F0EBE0] rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-[#004945] to-[#7ED22A] transition-all"
                  style={{ width: `${cyclePct}%` }}
                />
              </div>
              <p className="text-[11px] text-[#9E9E9E] mt-1.5 leading-relaxed">
                12 consecutive active weeks to level up. Skip or pause resets your streak, but your tier is kept.
              </p>
            </div>
          ) : (
            <div className="mb-4 px-3 py-2.5 bg-gradient-to-r from-[#EAF7D9] to-[#f4fcea] rounded-xl border border-[#B9EA91] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#004945] shrink-0" />
              <p className="text-xs font-semibold text-[#004945]">Max level reached — Platinum!</p>
            </div>
          )}

          {/* Perks */}
          <div className="mb-5">
            <p className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-wider mb-2.5">Your perks</p>
            <div className="space-y-2">
              {tierPerks[tier].map((perk) => {
                const perkMeta: Record<string, { icon: React.ReactNode; color: string }> = {
                  "Full meal catalog access":      { icon: <BookOpen className="w-3.5 h-3.5" />,  color: "text-[#9E9E9E]" },
                  "Weekly streak tracking":        { icon: <Flame className="w-3.5 h-3.5" />,     color: "text-orange-400" },
                  "Free delivery every 4th order": { icon: <Truck className="w-3.5 h-3.5" />,     color: "text-[#9E9E9E]" },
                  "Early access to new meals":     { icon: <Sparkles className="w-3.5 h-3.5" />,  color: "text-[#9E9E9E]" },
                  "Exclusive meal access":         { icon: <Star className="w-3.5 h-3.5" />,       color: "text-yellow-400" },
                  "5% off every order":            { icon: <Tag className="w-3.5 h-3.5" />,        color: "text-[#7ED22A]" },
                  "10% off every order":           { icon: <Tag className="w-3.5 h-3.5" />,        color: "text-[#7ED22A]" },
                  "Priority support":              { icon: <Headphones className="w-3.5 h-3.5" />, color: "text-[#9E9E9E]" },
                  "Birthday meal gift":            { icon: <Gift className="w-3.5 h-3.5" />,       color: "text-[#9E9E9E]" },
                  "Dedicated account manager":     { icon: <Users className="w-3.5 h-3.5" />,      color: "text-[#9E9E9E]" },
                };
                const meta = perkMeta[perk] ?? { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-[#9E9E9E]" };
                return (
                  <div key={perk} className="flex items-center gap-3 px-2 py-2">
                    <div className={`shrink-0 ${meta.color}`}>{meta.icon}</div>
                    <span className="text-xs text-[#6B6B6B]">{perk}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier progress track */}
          <div className="mt-auto grid grid-cols-4 gap-2">
            {(["bronze", "silver", "gold", "platinum"] as const).map((t) => {
              const s = tierColors[t];
              const isActive = t === tier;
              const tiers = ["bronze","silver","gold","platinum"] as const;
              const isPast = tiers.indexOf(t) < tiers.indexOf(tier as typeof tiers[number]);
              const medalColor: Record<string, string> = {
                bronze: "text-amber-600", silver: "text-slate-400",
                gold: "text-yellow-500", platinum: "text-purple-400",
              };

              if (isPast) {
                return (
                  <div
                    key={t}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 overflow-hidden ${s.bg} ${s.border}`}
                  >
                    {/* colour overlay */}
                    <div className="absolute inset-0 bg-white/50 rounded-xl" />
                    <div className="relative flex flex-col items-center gap-1">
                      {/* medal + check badge */}
                      <div className="relative">
                        <Medal className={`w-5 h-5 ${medalColor[t]} opacity-40`} />
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#7ED22A] rounded-full flex items-center justify-center shadow-sm">
                          <Check className="w-2 h-2 text-white" strokeWidth={3} />
                        </div>
                      </div>
                      <p className={`text-[11px] font-semibold ${s.text} opacity-60 leading-none`}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </p>
                    </div>
                  </div>
                );
              }

              if (isActive) {
                return (
                  <div
                    key={t}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 ${s.bg} ${s.border} shadow-md`}
                  >
                    {/* "agora" pill */}
                    <div className="bg-[#004945] text-[#7ED22A] text-[11px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full mb-1.5 leading-none">
                      now
                    </div>
                    <Medal className={`w-5 h-5 ${medalColor[t]} mb-1`} />
                    <p className={`text-[11px] font-bold ${s.text} leading-none`}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </p>
                  </div>
                );
              }

              // future / locked
              return (
                <div
                  key={t}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-[#F0EBE0] bg-[#FAFAF8] opacity-40"
                >
                  <Medal className="w-5 h-5 text-[#C4BFB5] mb-1" />
                  <p className="text-[11px] font-semibold text-[#9E9E9E] leading-none">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#004945]" />
              <h2 className="font-semibold text-[#004945] text-sm">Leaderboard</h2>
              <TutorialIcon onClick={() => setSectionInfo("leaderboard")} />
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

          <p className="text-[11px] text-[#9E9E9E] mb-3">Ranking based on points earned</p>

          <div className="grid grid-cols-[2rem_1fr_auto] gap-3 px-3 pb-2 shrink-0">
            <p className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-wider">#</p>
            <p className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-wider">Name</p>
            <p className="text-[11px] font-semibold text-[#9E9E9E] uppercase tracking-wider text-right">Points</p>
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
                    <Medal className={`w-4 h-4 ${entry.rank === 1 ? "text-yellow-500" : entry.rank === 2 ? "text-slate-400" : "text-amber-600"}`} />
                  ) : (
                    <span className={`text-xs font-bold ${entry.isMe ? "text-[#004945]" : "text-[#9E9E9E]"}`}>{entry.rank}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${entry.isMe ? "text-[#004945] font-semibold" : "text-[#1A1A1A]"}`}>{entry.name}</p>
                  {entry.isMe && (
                    <span className="px-1.5 py-0.5 bg-[#004945] text-[#7ED22A] text-[11px] font-bold rounded-full leading-none">YOU</span>
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

      {/* ── "How it works" full modal ── */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setShowHowItWorks(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E8E4DC] overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#F0EBE0] flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-[#004945] text-base">How the Rewards system works</h3>
              <button onClick={() => setShowHowItWorks(false)} className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors">
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>

            {/* Accordion sections */}
            <div className="overflow-y-auto flex-1 divide-y divide-[#F0EBE0]">
              {(Object.entries(sectionContent) as [SectionKey, typeof sectionContent[SectionKey]][]).map(([key, section]) => {
                const isOpen = openHowSections.has(key);
                return (
                  <div key={key}>
                    <button
                      onClick={() => toggleHowSection(key)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#FDFBF7] transition-colors"
                    >
                      <span className="text-sm font-semibold text-[#1A1A1A]">{section.title}</span>
                      <ChevronDown className={cn("w-4 h-4 text-[#9E9E9E] transition-transform shrink-0 ml-3", isOpen && "rotate-180")} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 space-y-0 bg-[#F5FBF0]">
                        {section.items.map(({ title, desc }, i) => (
                          <div
                            key={title}
                            className={`py-3 ${i < section.items.length - 1 ? "border-b border-[#E6F4D8]" : ""}`}
                          >
                            <p className="text-sm font-medium text-[#1A1A1A] mb-0.5">{title}</p>
                            <p className="text-sm text-[#6B6B6B] leading-relaxed">{desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Section-specific mini modals ── */}
      {sectionInfo && <SectionInfoModal sectionKey={sectionInfo} onClose={() => setSectionInfo(null)} />}
    </div>
  );
}
