"use client";

import { useState } from "react";
import type { Order } from "@/lib/mock-data";
import { formatShortDate } from "@/lib/utils";
import { X, ThumbsUp, ThumbsDown, Star, Send } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

interface RatingPopupProps {
  order: Order;
}

export function RatingPopup({ order }: RatingPopupProps) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [ratings, setRatings] = useState<Record<string, "up" | "down" | null>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (dismissed) return null;

  const handleSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
    setTimeout(() => setDismissed(true), 2000);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 lg:left-72 z-30 w-80 bg-white rounded-2xl shadow-2xl border border-[#E8E4DC] overflow-hidden">
      {submitted ? (
        <div className="px-5 py-6 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <p className="font-semibold text-[#004945]">Thanks for your feedback!</p>
          <p className="text-xs text-gray-400 mt-1">You earned 5 points</p>
        </div>
      ) : !expanded ? (
        /* Collapsed state */
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="text-xl shrink-0">⭐</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#004945]">Rate your meals</p>
            <p className="text-xs text-gray-400">
              {formatShortDate(order.deliveryDate)} delivery · earn 5 pts
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setExpanded(true)}
              className="px-3 py-1.5 rounded-lg bg-[#004945] text-white text-xs font-medium hover:bg-[#003835] transition-colors"
            >
              Rate now
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Expanded rating flow */
        <div>
          <div className="px-4 py-3 border-b border-[#F0EBE0] flex items-center justify-between">
            <p className="text-sm font-semibold text-[#004945]">How were your meals?</p>
            <button onClick={() => setDismissed(true)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-4 py-3 space-y-3 max-h-72 overflow-y-auto">
            {order.items.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  <Image
                    src={item.meal.imageUrl}
                    alt={item.meal.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.meal.name}</p>
                  {/* Inline comment if rated */}
                  {ratings[item.id] && (
                    <input
                      type="text"
                      placeholder="Add a comment…"
                      value={comments[item.id] ?? ""}
                      onChange={(e) => setComments((c) => ({ ...c, [item.id]: e.target.value }))}
                      className="mt-1 w-full text-[11px] px-2 py-1 rounded-lg border border-[#E8E4DC] focus:outline-none focus:ring-1 focus:ring-[#7ED22A]"
                    />
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setRatings((r) => ({ ...r, [item.id]: "up" }))}
                    className={`p-1.5 rounded-lg border transition-all ${
                      ratings[item.id] === "up"
                        ? "bg-[#EAF7D9] border-[#7ED22A] text-[#004945]"
                        : "border-[#E8E4DC] text-gray-400 hover:border-[#7ED22A] hover:text-[#7ED22A]"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setRatings((r) => ({ ...r, [item.id]: "down" }))}
                    className={`p-1.5 rounded-lg border transition-all ${
                      ratings[item.id] === "down"
                        ? "bg-red-50 border-red-300 text-red-500"
                        : "border-[#E8E4DC] text-gray-400 hover:border-red-300 hover:text-red-400"
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-[#F0EBE0]">
            <Button
              size="sm"
              className="w-full"
              onClick={handleSubmit}
              disabled={Object.keys(ratings).length === 0}
            >
              <Send className="w-3.5 h-3.5" /> Submit Feedback
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
