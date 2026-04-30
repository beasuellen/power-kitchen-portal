"use client";

import { useState } from "react";
import type { Order } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { X, ArrowLeft, Check, ChevronRight } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type FeedbackStep =
  | "order-rating"
  | "delivery-check"
  | "delivery-issue"
  | "meal-feedback"
  | "rotational"
  | "final-note"
  | "done";

interface MealFeedback {
  reorder: "yes" | "maybe" | "no" | null;
  tags: string[];
}

interface FeedbackModalProps {
  order: Order;
  onClose: () => void;
}

// ── Static config ──────────────────────────────────────────────────────────
const ORDER_RATINGS = [
  { value: "amazing",  emoji: "🤩", label: "Amazing"  },
  { value: "good",     emoji: "😊", label: "Good"     },
  { value: "okay",     emoji: "😐", label: "Okay"     },
  { value: "notgreat", emoji: "😕", label: "Not great"},
  { value: "bad",      emoji: "😞", label: "Bad"      },
];

const DELIVERY_OPTIONS = [
  { value: "all-good",     icon: "✅", label: "Yes, everything was good" },
  { value: "missing-item", icon: "📦", label: "Something was missing"    },
  { value: "wrong-item",   icon: "❌", label: "Something was wrong"      },
  { value: "delivery",     icon: "🚚", label: "Delivery issue"           },
  { value: "packaging",    icon: "📫", label: "Packaging issue"          },
  { value: "quality",      icon: "🍽️", label: "Food quality issue"       },
];

const DELIVERY_ISSUES = [
  "Late delivery",
  "Left in wrong place",
  "Could not find the package",
  "Package was damaged",
  "Driver issue",
  "Instructions were not followed",
  "Other",
];

const MEAL_TAGS: Record<"yes" | "maybe" | "no", string[]> = {
  yes: [
    "Taste", "Portion size", "Macros", "Texture",
    "Sauce", "Freshness", "Looks great", "Very filling",
  ],
  maybe: [
    "More flavour", "Less salty", "Less spicy", "More sauce",
    "Better texture", "More protein", "More vegetables",
    "Better appearance", "Bigger portion", "Smaller portion",
  ],
  no: [
    "Didn't like the taste", "Too dry", "Too bland", "Too salty",
    "Too spicy", "Texture was off", "Didn't look appetizing",
    "Portion was not right", "Not my style", "Quality issue",
  ],
};

const ROTATIONAL_QUESTIONS = [
  "Overall, how satisfied were you with the taste of this week's meals?",
  "Did this week's menu have enough variety for you?",
  "Did the portions feel right for your goals?",
  "How reliable was your delivery this week?",
  "How was the packaging and presentation this week?",
  "Did this week's order feel worth the price?",
];

const ROTATIONAL_OPTIONS = [
  "Very satisfied",
  "Satisfied",
  "Neutral",
  "Unsatisfied",
  "Very unsatisfied",
];

// ISO week number helper
function getISOWeek(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export function FeedbackModal({ order, onClose }: FeedbackModalProps) {
  const [step, setStep]               = useState<FeedbackStep>("order-rating");
  const [orderRating, setOrderRating] = useState<string | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const [deliveryIssues, setDeliveryIssues] = useState<string[]>([]);
  const [mealFeedbacks, setMealFeedbacks]   = useState<Record<string, MealFeedback>>({});
  const [mealIndex, setMealIndex]           = useState(0);
  const [rotationalAnswer, setRotationalAnswer] = useState<string | null>(null);
  const [finalNote, setFinalNote]           = useState("");

  const meals       = order.items;
  const currentItem = meals[mealIndex];
  const currentMF   = currentItem
    ? (mealFeedbacks[currentItem.id] ?? { reorder: null, tags: [] })
    : null;

  const rotationalQ = ROTATIONAL_QUESTIONS[(getISOWeek() - 1) % ROTATIONAL_QUESTIONS.length];

  // ── Progress ──
  const totalSteps = 4 + meals.length; // rating + delivery + meals… + rotational + note
  const stepNum =
    step === "order-rating"   ? 1 :
    step === "delivery-check" ? 2 :
    step === "delivery-issue" ? 2 :
    step === "meal-feedback"  ? 3 + mealIndex :
    step === "rotational"     ? 3 + meals.length :
    step === "final-note"     ? 4 + meals.length :
    totalSteps;
  const progress = Math.min(100, (stepNum / totalSteps) * 100);

  // ── Helpers ──
  const toggleDeliveryIssue = (issue: string) =>
    setDeliveryIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );

  const setMealReorder = (reorder: "yes" | "maybe" | "no") =>
    setMealFeedbacks((prev) => ({
      ...prev,
      [currentItem.id]: { reorder, tags: prev[currentItem.id]?.tags ?? [] },
    }));

  const toggleMealTag = (tag: string) => {
    const key = currentItem.id;
    setMealFeedbacks((prev) => {
      const cur = prev[key] ?? { reorder: null, tags: [] };
      return {
        ...prev,
        [key]: {
          ...cur,
          tags: cur.tags.includes(tag)
            ? cur.tags.filter((t) => t !== tag)
            : [...cur.tags, tag],
        },
      };
    });
  };

  const goNextMeal = () => {
    if (mealIndex < meals.length - 1) {
      setMealIndex((i) => i + 1);
    } else {
      setStep("rotational");
    }
  };

  const goPrevMeal = () => {
    if (mealIndex > 0) {
      setMealIndex((i) => i - 1);
    } else {
      setStep(deliveryStatus === "delivery" ? "delivery-issue" : "delivery-check");
    }
  };

  const handleDeliverySelect = (value: string) => {
    setDeliveryStatus(value);
    if (value === "delivery") {
      setStep("delivery-issue");
    } else {
      setMealIndex(0);
      setStep("meal-feedback");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-3 shrink-0 border-b border-[#F0EBE0]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-[#004945]">Rate your delivery</p>
              {step !== "done" && (
                <p className="text-[10px] text-[#9E9E9E] mt-0.5">
                  Help us improve your next order — takes ~30 seconds
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[#F0EBE0] transition-colors"
            >
              <X className="w-4 h-4 text-[#9E9E9E]" />
            </button>
          </div>
          {step !== "done" && (
            <div className="w-full h-1.5 bg-[#F0EBE0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7ED22A] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* ─── STEP 1: Order rating ─────────────────────────────────── */}
          {step === "order-rating" && (
            <>
              <div>
                <h2 className="text-lg font-bold text-[#004945]">How was your order this week?</h2>
                <p className="text-xs text-[#9E9E9E] mt-1">Tap one to continue</p>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {ORDER_RATINGS.map(({ value, emoji, label }) => (
                  <button
                    key={value}
                    onClick={() => { setOrderRating(value); setStep("delivery-check"); }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl border-2 transition-all",
                      orderRating === value
                        ? "border-[#7ED22A] bg-[#EAF7D9]"
                        : "border-[#E8E4DC] hover:border-[#B9EA91]"
                    )}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-[9px] font-medium text-[#6B6B6B] leading-tight text-center">{label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ─── STEP 2: Delivery check ───────────────────────────────── */}
          {step === "delivery-check" && (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep("order-rating")}
                  className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-[#9E9E9E]" />
                </button>
                <h2 className="text-base font-bold text-[#004945]">Did everything arrive as expected?</h2>
              </div>
              <div className="space-y-2">
                {DELIVERY_OPTIONS.map(({ value, icon, label }) => (
                  <button
                    key={value}
                    onClick={() => handleDeliverySelect(value)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                      deliveryStatus === value
                        ? "border-[#7ED22A] bg-[#EAF7D9]"
                        : "border-[#E8E4DC] hover:border-[#B9EA91]"
                    )}
                  >
                    <span className="text-base shrink-0">{icon}</span>
                    <span className="text-sm font-medium text-[#1A1A1A]">{label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ─── STEP 2b: Delivery issue detail (conditional) ─────────── */}
          {step === "delivery-issue" && (
            <>
              <div className="flex items-start gap-2">
                <button
                  onClick={() => setStep("delivery-check")}
                  className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0 mt-0.5"
                >
                  <ArrowLeft className="w-4 h-4 text-[#9E9E9E]" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-[#004945]">What happened with the delivery?</h2>
                  <p className="text-xs text-[#9E9E9E] mt-0.5">Select all that apply</p>
                </div>
              </div>
              <div className="space-y-2">
                {DELIVERY_ISSUES.map((issue) => {
                  const selected = deliveryIssues.includes(issue);
                  return (
                    <button
                      key={issue}
                      onClick={() => toggleDeliveryIssue(issue)}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                        selected
                          ? "border-[#7ED22A] bg-[#EAF7D9]"
                          : "border-[#E8E4DC] hover:border-[#B9EA91]"
                      )}
                    >
                      <span className="text-sm font-medium text-[#1A1A1A]">{issue}</span>
                      {selected && <Check className="w-4 h-4 text-[#004945] shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => { setMealIndex(0); setStep("meal-feedback"); }}
                className="w-full py-3 bg-[#004945] text-white text-sm font-semibold rounded-xl hover:bg-[#003835] transition-colors"
              >
                Continue
              </button>
            </>
          )}

          {/* ─── STEP 3: Per-meal feedback ────────────────────────────── */}
          {step === "meal-feedback" && currentItem && currentMF && (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrevMeal}
                  className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-[#9E9E9E]" />
                </button>
                <div>
                  <p className="text-[10px] text-[#9E9E9E] font-medium uppercase tracking-wide">
                    Meal {mealIndex + 1} of {meals.length}
                  </p>
                  <h2 className="text-base font-bold text-[#004945]">Would you order this again?</h2>
                </div>
              </div>

              {/* Meal card */}
              <div className="flex items-center gap-3 bg-[#FDFBF7] border border-[#F0EBE0] rounded-2xl p-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={currentItem.meal.imageUrl}
                    alt={currentItem.meal.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#1A1A1A] leading-snug">{currentItem.meal.name}</p>
                  {currentItem.quantity > 1 && (
                    <p className="text-xs text-[#9E9E9E] mt-0.5">{currentItem.quantity}× ordered</p>
                  )}
                  <p className="text-xs font-bold text-[#004945] mt-1">{formatCurrency(currentItem.unitPrice)}</p>
                </div>
              </div>

              {/* Yes / Maybe / No */}
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "yes",   emoji: "👍", label: "Yes!",  activeClass: "border-[#7ED22A] bg-[#EAF7D9] text-[#004945]"  },
                    { value: "maybe", emoji: "🤔", label: "Maybe", activeClass: "border-amber-300 bg-amber-50 text-amber-700"    },
                    { value: "no",    emoji: "👎", label: "No",    activeClass: "border-red-300 bg-red-50 text-red-600"          },
                  ] as const
                ).map(({ value, emoji, label, activeClass }) => (
                  <button
                    key={value}
                    onClick={() => setMealReorder(value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-2xl border-2 transition-all",
                      currentMF.reorder === value
                        ? activeClass
                        : "border-[#E8E4DC] hover:border-[#B9EA91]"
                    )}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs font-semibold text-[#1A1A1A]">{label}</span>
                  </button>
                ))}
              </div>

              {/* Conditional follow-up tags */}
              {currentMF.reorder && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-[#6B6B6B]">
                    {currentMF.reorder === "yes"   ? "What did you like?" :
                     currentMF.reorder === "maybe" ? "What could be better?" :
                                                     "What was the main issue?"}
                    <span className="font-normal text-[#9E9E9E] ml-1">(optional)</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MEAL_TAGS[currentMF.reorder].map((tag) => {
                      const selected = currentMF.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleMealTag(tag)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                            selected
                              ? "bg-[#004945] text-white border-[#004945]"
                              : "bg-white text-[#6B6B6B] border-[#E8E4DC] hover:border-[#B9EA91]"
                          )}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={goNextMeal}
                    className="w-full py-3 bg-[#004945] text-white text-sm font-semibold rounded-xl hover:bg-[#003835] transition-colors flex items-center justify-center gap-1.5"
                  >
                    {mealIndex < meals.length - 1 ? "Next meal" : "Continue"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

          {/* ─── STEP 4: Rotational weekly question ───────────────────── */}
          {step === "rotational" && (
            <>
              <div className="flex items-start gap-2">
                <button
                  onClick={() => { setMealIndex(meals.length - 1); setStep("meal-feedback"); }}
                  className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0 mt-0.5"
                >
                  <ArrowLeft className="w-4 h-4 text-[#9E9E9E]" />
                </button>
                <div>
                  <p className="text-[10px] text-[#9E9E9E] font-semibold uppercase tracking-wide mb-1">
                    This week's question
                  </p>
                  <h2 className="text-base font-bold text-[#004945]">{rotationalQ}</h2>
                </div>
              </div>
              <div className="space-y-2">
                {ROTATIONAL_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setRotationalAnswer(opt); setStep("final-note"); }}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                      rotationalAnswer === opt
                        ? "border-[#7ED22A] bg-[#EAF7D9]"
                        : "border-[#E8E4DC] hover:border-[#B9EA91]"
                    )}
                  >
                    <span className="text-sm font-medium text-[#1A1A1A]">{opt}</span>
                    {rotationalAnswer === opt && <Check className="w-4 h-4 text-[#004945] shrink-0" />}
                  </button>
                ))}
                <button
                  onClick={() => setStep("final-note")}
                  className="w-full text-center text-xs text-[#9E9E9E] hover:text-[#6B6B6B] transition-colors py-1"
                >
                  Skip this question
                </button>
              </div>
            </>
          )}

          {/* ─── STEP 5: Final optional note ──────────────────────────── */}
          {step === "final-note" && (
            <>
              <div className="flex items-start gap-2">
                <button
                  onClick={() => setStep("rotational")}
                  className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0 mt-0.5"
                >
                  <ArrowLeft className="w-4 h-4 text-[#9E9E9E]" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-[#004945]">Any final note for our team?</h2>
                  <p className="text-xs text-[#9E9E9E] mt-0.5">Optional — share anything we missed</p>
                </div>
              </div>
              <textarea
                value={finalNote}
                onChange={(e) => setFinalNote(e.target.value)}
                placeholder="e.g. The teriyaki was amazing but I'd love more sauce next time…"
                rows={4}
                className="w-full text-sm px-4 py-3 border border-[#E8E4DC] rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7] placeholder:text-[#C4BFB8]"
              />
              <button
                onClick={() => setStep("done")}
                className="w-full py-3 bg-[#004945] text-white text-sm font-semibold rounded-xl hover:bg-[#003835] transition-colors"
              >
                Submit feedback
              </button>
              <button
                onClick={() => setStep("done")}
                className="w-full text-center text-xs text-[#9E9E9E] hover:text-[#6B6B6B] transition-colors py-1"
              >
                Skip & submit
              </button>
            </>
          )}

          {/* ─── DONE ─────────────────────────────────────────────────── */}
          {step === "done" && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#EAF7D9] flex items-center justify-center">
                <span className="text-4xl">🎉</span>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-bold text-[#004945]">Thanks for the feedback!</h2>
                <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-xs mx-auto">
                  Your feedback helps us improve next week's menu and delivery experience.
                </p>
              </div>
              {/* Gamification nudge */}
              <div className="bg-[#EAF7D9] border border-[#B9EA91] rounded-2xl px-4 py-3 w-full text-left">
                <p className="text-xs font-semibold text-[#004945]">⭐ +10 points earned</p>
                <p className="text-[10px] text-[#6B6B6B] mt-0.5">Weekly feedback streak: 3 weeks in a row 🔥</p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#004945] text-white text-sm font-semibold rounded-xl hover:bg-[#003835] transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
