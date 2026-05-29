"use client";

import { useState, useEffect } from "react";
import { X, Phone, Mail, Salad, CalendarDays, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const NUTRITIONISTS = [
  {
    id: "caroline",
    name: "Caroline Brancalion",
    initials: "CB",
    specialty: "Weight Management & Keto",
    bgColor: "bg-[#7ED22A]",
    textColor: "text-[#004945]",
    email: "caroline@powerkitchen.ca",
  },
] as const;

type ActionToast = { nutritionistName: string; type: "call" | "email"; email?: string } | null;

export function NutritionistFAB() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<ActionToast>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("openNutritionistPanel", handler);
    return () => window.removeEventListener("openNutritionistPanel", handler);
  }, []);

  const handleAction = (type: "call" | "email", nutri: typeof NUTRITIONISTS[number]) => {
    setToast({ nutritionistName: nutri.name, type, email: nutri.email });
    setTimeout(() => setToast(null), 4000);
    if (type === "call") {
      window.open("https://calendly.com/powerkitchen", "_blank", "noopener,noreferrer");
    } else {
      window.open(`mailto:${nutri.email}?subject=Nutrition%20Question`, "_self");
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-24 lg:bottom-8 right-4 lg:right-6 z-40",
          "flex items-center gap-2 bg-[#004945] hover:bg-[#003835] text-white",
          "rounded-full shadow-lg px-4 py-2.5 transition-all duration-200",
          "hover:shadow-xl hover:scale-105 active:scale-95",
          open && "opacity-0 pointer-events-none"
        )}
      >
        <Salad className="w-4 h-4 text-white shrink-0" />
        <span className="text-sm font-normal whitespace-nowrap">Ask a nutritionist</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={() => { setOpen(false); setToast(null); }}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-0 right-0 z-50 w-full sm:w-96 sm:bottom-6 sm:right-6",
          "bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#E8E4DC]",
          "transition-all duration-300 ease-out overflow-hidden",
          open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="relative bg-[#004945] px-5 pt-5 pb-5 overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-white">Talk to our nutritionists</p>
              <p className="text-xs text-white/60 mt-0.5">Choose who you'd like to connect with</p>
            </div>
            <button
              onClick={() => { setOpen(false); setToast(null); }}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nutritionist cards */}
        <div className="px-4 pt-3 pb-1 space-y-3">
          {NUTRITIONISTS.map((nutri) => (
            <div key={nutri.id} className="bg-[#FDFBF7] border border-[#F0EBE0] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm",
                  nutri.bgColor, nutri.textColor
                )}>
                  {nutri.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{nutri.name}</p>
                  <p className="text-[11px] text-[#9E9E9E] truncate">{nutri.specialty}</p>
                </div>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 text-[11px] font-semibold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>

              <div className="grid grid-cols-2 border-t border-[#F0EBE0]">
                <button
                  onClick={() => handleAction("call", nutri)}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-[#004945] hover:bg-[#EAF7D9] transition-colors border-r border-[#F0EBE0]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Phone call
                </button>
                <button
                  onClick={() => handleAction("email", nutri)}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-[#004945] hover:bg-[#EAF7D9] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Action feedback toast */}
        {toast && (
          <div className="mx-4 mb-3 mt-1 bg-[#EAF7D9] border border-[#B9EA91] rounded-xl px-4 py-3 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#004945] flex items-center justify-center shrink-0 mt-0.5">
              {toast.type === "call"
                ? <CalendarDays className="w-3.5 h-3.5 text-[#7ED22A]" />
                : <ExternalLink className="w-3.5 h-3.5 text-[#7ED22A]" />
              }
            </div>
            <div>
              <p className="text-xs font-semibold text-[#004945]">
                {toast.type === "call" ? "Opening Calendly…" : "Opening your email…"}
              </p>
              <p className="text-[11px] text-[#6B6B6B] mt-0.5 leading-relaxed">
                {toast.type === "call"
                  ? `You'll be redirected to schedule a phone call with ${toast.nutritionistName}.`
                  : `Your email client will open with ${toast.email} already set as the recipient.`
                }
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 pb-4 pt-1">
          <p className="text-[11px] text-[#9E9E9E] text-center">
            Available Mon–Fri · Phone calls are free for active subscribers
          </p>
        </div>
      </div>
    </>
  );
}
