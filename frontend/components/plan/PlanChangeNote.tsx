"use client";

import { CalendarClock, Truck } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

/**
 * One source of truth for the reassurance shown on every plan change: the order
 * already on its way is locked, and the change only takes effect from the next
 * delivery / renewal. Keep the copy short and in Power Kitchen's plain, warm voice.
 */
export type ChangeKind = "delivery" | "payment" | "method" | "subscription";

function noteText(kind: ChangeKind, hasDate: boolean): string {
  const lead = hasDate ? "won't change" : "is already set";
  switch (kind) {
    case "payment":
      return `Your order on the way ${lead}. New billing starts at your next renewal.`;
    case "method":
      return `Your order on the way ${lead}. Pickup and delivery changes may affect your next renewal total.`;
    case "subscription":
      return hasDate
        ? "Your order on the way will still be delivered."
        : "Your current order will still be delivered.";
    case "delivery":
    default:
      return `Your order on the way ${lead}. New changes start from your next delivery.`;
  }
}

export function PlanChangeNote({ kind = "delivery", date }: { kind?: ChangeKind; date?: string }) {
  return (
    <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
      <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
      <p className="text-xs text-blue-800 leading-relaxed">
        {date && (
          <>
            Arriving <span className="font-semibold">{formatDate(date, { weekday: "long", month: "long", day: "numeric" })}</span>.{" "}
          </>
        )}
        {noteText(kind, !!date)}
      </p>
    </div>
  );
}

export interface ChangeConfirm {
  title: string;
  summary?: React.ReactNode;
  kind?: ChangeKind;
  confirmLabel?: string;
  run: () => void | Promise<void>;
}

/**
 * Generic confirm-a-plan-change modal. Drive it from a single `confirmAction`
 * state so every simple change (day, method, restrictions, instructions…) shares
 * one consistent layout and message.
 */
export function ConfirmChangeModal({
  confirm,
  date,
  onClose,
}: {
  confirm: ChangeConfirm;
  date?: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-[#E8E4DC] overflow-hidden">
        <div className="px-6 pt-6 pb-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EAF7D9] flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5 text-[#004945]" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#004945]">{confirm.title}</h3>
            {confirm.summary && <p className="text-xs text-[#9E9E9E] mt-0.5">{confirm.summary}</p>}
          </div>
        </div>

        <div className="px-6 pb-2">
          <PlanChangeNote kind={confirm.kind} date={date} />
        </div>

        <div className="px-6 pb-6 pt-4 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1"
            onClick={async () => { await confirm.run(); onClose(); }}
          >
            {confirm.confirmLabel ?? "Confirm change"}
          </Button>
        </div>
      </div>
    </div>
  );
}
