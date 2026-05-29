"use client";

import { useState } from "react";
import type { Order } from "@/lib/mock-data";
import { formatShortDate } from "@/lib/utils";
import { X, Star, PartyPopper } from "lucide-react";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

interface RatingPopupProps {
  order: Order;
}

export function RatingPopup({ order }: RatingPopupProps) {
  const [dismissed, setDismissed] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (dismissed) return null;

  return (
    <>
      {/* Subtle pill — stacked above the nutritionist FAB on mobile */}
      {!submitted && (
        <div className="fixed bottom-[146px] lg:bottom-6 right-4 lg:left-72 lg:right-auto z-30">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-[#E8E4DC] rounded-full shadow-lg px-4 py-2.5">
            <Star className="w-4 h-4 text-yellow-500 shrink-0" />
            <button
              onClick={() => setFeedbackOpen(true)}
              className="text-sm font-normal text-[#004945] hover:underline whitespace-nowrap"
            >
              Rate your meals · 10 pts
            </button>
          </div>
        </div>
      )}

      {/* Thank-you pill after feedback */}
      {submitted && (
        <div className="fixed bottom-[168px] lg:bottom-6 right-4 lg:left-72 lg:right-auto z-30">
          <div className="flex items-center gap-2 bg-[#EAF7D9] border border-[#B9EA91] rounded-full shadow-md px-3 py-1.5">
            <Star className="w-3.5 h-3.5 text-[#7ED22A] shrink-0" />
            <p className="text-xs font-medium text-[#004945] whitespace-nowrap">Thanks! +10 pts earned</p>
          </div>
        </div>
      )}

      {/* Full FeedbackModal */}
      {feedbackOpen && (
        <FeedbackModal
          order={order}
          onClose={() => {
            setFeedbackOpen(false);
            setSubmitted(true);
            setTimeout(() => setDismissed(true), 2500);
          }}
        />
      )}
    </>
  );
}
