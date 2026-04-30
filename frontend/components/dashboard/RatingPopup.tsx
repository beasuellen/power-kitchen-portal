"use client";

import { useState } from "react";
import type { Order } from "@/lib/mock-data";
import { formatShortDate } from "@/lib/utils";
import { X } from "lucide-react";
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
      {/* Collapsed toast pill */}
      {!submitted && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 lg:left-72 z-30 w-80 bg-white rounded-2xl shadow-2xl border border-[#E8E4DC] overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="text-xl shrink-0">⭐</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#004945]">Rate your meals</p>
              <p className="text-xs text-gray-400">
                {formatShortDate(order.deliveryDate)} delivery · earn 10 pts
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setFeedbackOpen(true)}
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
        </div>
      )}

      {/* Thank-you confirmation after feedback */}
      {submitted && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 lg:left-72 z-30 w-80 bg-white rounded-2xl shadow-2xl border border-[#E8E4DC] overflow-hidden">
          <div className="px-5 py-6 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-semibold text-[#004945]">Thanks for your feedback!</p>
            <p className="text-xs text-gray-400 mt-1">You earned 10 points</p>
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
