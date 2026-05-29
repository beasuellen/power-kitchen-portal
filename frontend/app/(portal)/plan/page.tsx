"use client";

import { useState, useEffect, useRef } from "react";
import { mockSubscription, type DietaryTag } from "@/lib/mock-data";
import { useSubscriptionStore, getActiveSubscription } from "@/lib/useSubscriptionStore";
import { formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useOrderStore } from "@/lib/useOrderStore";
import {
  Package, Truck, UtensilsCrossed, CreditCard, MapPin,
  Edit3, Check, ChevronDown, AlertTriangle, Info, X, ArrowRight, ChevronRight, Plus, Trash2,
  Trophy, Flame, Gift, Lock,
} from "lucide-react";
import { DietaryIcon } from "@/components/ui/DietaryIcon";

const dietaryOptions: { tag: DietaryTag; label: string; desc: string }[] = [
  { tag: "DF",  label: "Dairy Free",  desc: "No milk, cheese, butter" },
  { tag: "GF",  label: "Gluten Free", desc: "No wheat, barley, rye" },
  { tag: "H",   label: "Halal",       desc: "Halal-certified only" },
  { tag: "NF",  label: "Nut Free",    desc: "No tree nuts or peanuts" },
  { tag: "SF",  label: "Soy Free",    desc: "No soy-derived ingredients" },
  { tag: "V",   label: "Vegan",       desc: "100% plant-based meals" },
];

const deliveryDays = ["Sunday", "Wednesday"];

export default function PlanPage() {
  const { activeIndex } = useSubscriptionStore();
  const sub = getActiveSubscription(activeIndex);
  const { planName, mealsPerWeek, weeklyTotal, status, startDate, nextBillingDate, streak, tier } = sub ?? mockSubscription;

  // ── Global restrictions from store ──────────────────────────────
  const { globalRestrictions, setGlobalRestrictions } = useOrderStore();
  const [dietary, setDietary] = useState<DietaryTag[]>(globalRestrictions);
  const [dietarySaved, setDietarySaved] = useState(false);

  const dietaryHasChanges =
    dietary.length !== globalRestrictions.length ||
    dietary.some((t) => !globalRestrictions.includes(t));

  const toggleDietary = (tag: DietaryTag) => {
    setDietary((p) => p.includes(tag) ? p.filter((x) => x !== tag) : [...p, tag]);
    setDietarySaved(false);
  };

  const saveDietary = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setGlobalRestrictions(dietary);
    setDietarySaved(true);
  };

  // ── Delivery day (with explicit save) ───────────────────────────
  const [selectedDay, setSelectedDay] = useState(sub?.deliveryDay ?? mockSubscription.deliveryDay);
  const [pendingDay, setPendingDay] = useState<string | null>(null);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [daySaved, setDaySaved] = useState(false);
  const dayHasChanges = pendingDay !== null && pendingDay !== selectedDay;

  const saveDay = async () => {
    if (!pendingDay) return;
    await new Promise((r) => setTimeout(r, 500));
    setSelectedDay(pendingDay);
    setPendingDay(null);
    setDaySaved(true);
    setTimeout(() => setDaySaved(false), 3000);
  };

  // ── Delivery method (with explicit save) ─────────────────────────
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(sub?.deliveryMethod ?? mockSubscription.deliveryMethod);
  const [pendingMethod, setPendingMethod] = useState<"delivery" | "pickup" | null>(null);
  const [methodSaved, setMethodSaved] = useState(false);
  const methodHasChanges = pendingMethod !== null && pendingMethod !== deliveryMethod;

  const saveMethod = async () => {
    if (!pendingMethod) return;
    await new Promise((r) => setTimeout(r, 500));
    setDeliveryMethod(pendingMethod);
    setPendingMethod(null);
    setMethodSaved(true);
    setTimeout(() => setMethodSaved(false), 3000);
  };

  // ── Delivery instructions (with explicit save) ───────────────────
  const [instructions, setInstructions] = useState("Leave at door");
  const [savedInstructions, setSavedInstructions] = useState("Leave at door");
  const [instructionsSaved, setInstructionsSaved] = useState(false);
  const instructionsChanged = instructions !== savedInstructions;

  const saveInstructions = async () => {
    await new Promise((r) => setTimeout(r, 500));
    setSavedInstructions(instructions);
    setInstructionsSaved(true);
    setTimeout(() => setInstructionsSaved(false), 3000);
  };

  // ── Address state ────────────────────────────────────────────────
  const [savedAddresses, setSavedAddresses] = useState([
    { id: "addr_home", label: "Home", street: "120 Bloor St East", unit: "Apt 802", city: "Toronto", province: "ON", postal: "M4W 1B8", buzzer: "802", instructions: "Leave at door", isDefault: true },
    { id: "addr_work", label: "Work", street: "181 Bay St", unit: "Suite 1800", city: "Toronto", province: "ON", postal: "M5J 2T3", buzzer: "", instructions: "Ask at reception", isDefault: false },
  ]);

  // Confirmation modal for setting a new default address
  const [setDefaultAddressId, setSetDefaultAddressId] = useState<string | null>(null);
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addAddressStep, setAddAddressStep] = useState<1 | 2>(1);
  const emptyNewAddress = { label: "", street: "", unit: "", city: "Toronto", province: "ON", postal: "", buzzer: "", instructions: "" };
  const [newAddress, setNewAddress] = useState(emptyNewAddress);
  const closeAddAddressModal = () => { setShowAddAddressModal(false); setAddAddressStep(1); setNewAddress(emptyNewAddress); };

  // ── Payment method ────────────────────────────────────────────────
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cards, setCards] = useState([
    { id: "card_001", brand: "Visa",       last4: "4242", expiry: "08/27", isDefault: true,  color: "bg-blue-600"   },
    { id: "card_002", brand: "Mastercard", last4: "8834", expiry: "03/26", isDefault: false, color: "bg-red-500"    },
  ]);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [setDefaultCardId, setSetDefaultCardId] = useState<string | null>(null);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [addCardStep, setAddCardStep] = useState<1 | 2 | 3>(1);
  const emptyNewCard = { cardNumber: "", cardHolder: "", expiry: "", cvv: "" };
  const [newCard, setNewCard] = useState(emptyNewCard);
  const closeAddCardModal = () => { setShowAddCardModal(false); setAddCardStep(1); setNewCard(emptyNewCard); };

  // ── Cancel / Pause ───────────────────────────────────────────────
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelStep, setCancelStep] = useState<1 | 2>(1);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseDuration, setPauseDuration] = useState<"2w" | "4w" | "indefinite" | null>(null);

  // Section refs for hash navigation
  const addressRef = useRef<HTMLDivElement>(null);
  const paymentRef = useRef<HTMLDivElement>(null);
  const [highlightSection, setHighlightSection] = useState<"address" | "payment" | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const trigger = (ref: React.RefObject<HTMLDivElement | null>, section: "address" | "payment") => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightSection(section);
      setTimeout(() => setHighlightSection(null), 2000);
    };
    if (hash === "#address-section") trigger(addressRef, "address");
    else if (hash === "#payment-section") trigger(paymentRef, "payment");
  }, []);

  const effectiveDay = pendingDay ?? selectedDay;
  const effectiveMethod = pendingMethod ?? deliveryMethod;

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-[#004945]">My Plan</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">Manage your subscription, preferences and delivery</p>
      </div>

      {/* ── Row 1: Plan Overview + Dietary Restrictions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Plan Overview */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#004945]" />
              <h2 className="font-semibold text-[#004945] text-sm">Plan Overview</h2>
            </div>
            <Badge variant="green">Active</Badge>
          </div>
          <div className="space-y-3">
            {[
              { label: "Meals / week", value: mealsPerWeek.toString() },
              { label: "Weekly total", value: formatCurrency(weeklyTotal) },
              { label: "Active since", value: formatDate(startDate, { month: "short", year: "numeric", day: "numeric" }) },
              { label: "Next billing", value: formatDate(nextBillingDate, { month: "short", day: "numeric" }) },
              { label: "Streak", value: `${streak} weeks` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-[#9E9E9E]">{label}</span>
                <span className="text-sm font-medium text-[#1A1A1A]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dietary Restrictions — moved up alongside Plan Overview */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-[#004945]" />
              <h2 className="font-semibold text-[#004945] text-sm">Dietary Restrictions</h2>
            </div>
            <button
              onClick={saveDietary}
              disabled={!dietaryHasChanges}
              className={cn(
                "text-xs font-semibold px-3 py-1.5 rounded-xl transition-all",
                dietarySaved
                  ? "bg-[#EAF7D9] text-[#004945] flex items-center gap-1"
                  : dietaryHasChanges
                    ? "bg-[#004945] text-white hover:bg-[#003835]"
                    : "bg-[#F0EBE0] text-[#C4BFB5] cursor-not-allowed"
              )}
            >
              {dietarySaved ? <><Check className="w-3.5 h-3.5 inline mr-0.5" /> Saved</> : "Save"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {dietaryOptions.map((opt) => {
              const active = dietary.includes(opt.tag);
              return (
                <button
                  key={opt.tag}
                  onClick={() => toggleDietary(opt.tag)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all",
                    active
                      ? "bg-[#EAF7D9] border-[#B9EA91]"
                      : "bg-[#FDFBF7] border-[#E8E4DC] hover:border-[#B9EA91]"
                  )}
                >
                  <DietaryIcon tag={opt.tag} size={18} className="shrink-0" />
                  <div className="min-w-0">
                    <p className={cn("text-xs font-semibold truncate", active ? "text-[#004945]" : "text-[#1A1A1A]")}>
                      {opt.label}
                    </p>
                    <p className="text-[11px] text-[#9E9E9E] truncate">{opt.desc}</p>
                  </div>
                  <div className={cn(
                    "ml-auto w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                    active ? "bg-[#7ED22A] border-[#7ED22A]" : "border-[#D4CFC5]"
                  )}>
                    {active && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 2: Delivery Preferences + Address (side by side) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Delivery Preferences */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-[#004945]" />
            <h2 className="font-semibold text-[#004945] text-sm">Delivery Preferences</h2>
          </div>

          {/* Delivery day */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-[#9E9E9E]">Delivery day</p>
              {daySaved && (
                <span className="text-[11px] text-[#7ED22A] font-semibold flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDayPicker((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[#E8E4DC] text-sm text-[#004945] font-medium hover:bg-[#FDFBF7] transition-colors"
              >
                {effectiveDay}
                <ChevronDown className="w-4 h-4 text-[#9E9E9E]" />
              </button>
              {showDayPicker && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-[#E8E4DC] rounded-xl shadow-lg z-10 overflow-hidden">
                  {deliveryDays.map((day) => (
                    <button
                      key={day}
                      onClick={() => { setPendingDay(day === selectedDay ? null : day); setShowDayPicker(false); setDaySaved(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm transition-colors",
                        day === effectiveDay
                          ? "bg-[#EAF7D9] text-[#004945] font-semibold"
                          : "text-gray-700 hover:bg-[#FDFBF7]"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {dayHasChanges && (
              <button
                onClick={saveDay}
                className="mt-2 w-full py-1.5 rounded-xl bg-[#004945] text-white text-xs font-semibold hover:bg-[#003835] transition-colors"
              >
                Save delivery day
              </button>
            )}
          </div>

          {/* Delivery method */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-[#9E9E9E]">Delivery method</p>
              {methodSaved && (
                <span className="text-[11px] text-[#7ED22A] font-semibold flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "delivery" as const, label: "Local Delivery" },
                { value: "pickup"   as const, label: "Pickup" },
              ]).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { setPendingMethod(value === deliveryMethod ? null : value); setMethodSaved(false); }}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-medium border-2 transition-all",
                    effectiveMethod === value
                      ? "bg-[#EAF7D9] border-[#7ED22A] text-[#004945]"
                      : "border-[#E8E4DC] text-[#9E9E9E] hover:border-[#B9EA91] hover:text-[#004945]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {effectiveMethod === "pickup" && (
              <div className="mt-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <MapPin className="w-3 h-3 text-amber-700" />
                  <p className="text-xs font-semibold text-amber-800">Pickup location</p>
                </div>
                <p className="text-xs text-amber-700 mt-0.5">3270 Steeles Ave W, Concord, ON · Mon–Fri 9am–6pm</p>
              </div>
            )}
            {methodHasChanges && (
              <button
                onClick={saveMethod}
                className="mt-2 w-full py-1.5 rounded-xl bg-[#004945] text-white text-xs font-semibold hover:bg-[#003835] transition-colors"
              >
                Save delivery method
              </button>
            )}
          </div>

          {/* Delivery instructions */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-[#9E9E9E]">Delivery instructions</p>
              {instructionsSaved && (
                <span className="text-[11px] text-[#7ED22A] font-semibold flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
            <input
              type="text"
              value={instructions}
              onChange={(e) => { setInstructions(e.target.value); setInstructionsSaved(false); }}
              className="w-full px-3 py-2 rounded-xl border border-[#E8E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7]"
              placeholder="e.g. Leave at door"
            />
            {instructionsChanged && (
              <button
                onClick={saveInstructions}
                className="mt-2 w-full py-1.5 rounded-xl bg-[#004945] text-white text-xs font-semibold hover:bg-[#003835] transition-colors"
              >
                Save instructions
              </button>
            )}
          </div>
        </div>

        {/* Delivery Addresses */}
        <div
          id="address-section"
          ref={addressRef}
          className={`bg-white rounded-2xl border p-5 transition-all duration-700 ${highlightSection === "address" ? "border-[#7ED22A] ring-2 ring-[#7ED22A]/40" : "border-[#E8E4DC]"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#004945]" />
              <h2 className="font-semibold text-[#004945] text-sm">Delivery Addresses</h2>
            </div>
          </div>

          <div className="space-y-2 mb-3">
            {savedAddresses.map((addr) => {
              const isDefault = addr.isDefault;
              return (
                <div
                  key={addr.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border-2 transition-all",
                    isDefault ? "border-[#7ED22A] bg-[#EAF7D9] cursor-default" : "border-[#E8E4DC] hover:border-[#B9EA91] cursor-pointer"
                  )}
                  onClick={() => { if (!isDefault) setSetDefaultAddressId(addr.id); }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#004945] mb-0.5">{addr.label}</p>
                    <p className="text-xs text-[#1A1A1A]">{addr.street}{addr.unit ? `, ${addr.unit}` : ""}</p>
                    <p className="text-xs text-[#9E9E9E]">{addr.city}, {addr.province} {addr.postal}</p>
                    {addr.instructions && <p className="text-[11px] text-[#9E9E9E] italic mt-0.5">{addr.instructions}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isDefault && (
                      <div className="w-8 h-8 rounded-full bg-[#7ED22A] flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {savedAddresses.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteAddressId(addr.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#C4BFB5] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setShowAddAddressModal(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-[#E8E4DC] rounded-xl text-xs font-medium text-[#9E9E9E] hover:border-[#7ED22A] hover:text-[#004945] hover:bg-[#EAF7D9]/40 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add another address
          </button>
        </div>
      </div>

      {/* ── Row 3: Payment + Subscription Management side by side ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">

      {/* Payment */}
      <div
        id="payment-section"
        ref={paymentRef}
        className={`bg-white rounded-2xl border p-5 transition-all duration-700 ${highlightSection === "payment" ? "border-[#7ED22A] ring-2 ring-[#7ED22A]/40" : "border-[#E8E4DC]"}`}
      >
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-4 h-4 text-[#004945]" />
          <h2 className="font-semibold text-[#004945] text-sm">Payment Method</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => { if (!card.isDefault) setSetDefaultCardId(card.id); }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all",
                card.isDefault
                  ? "border-[#B9EA91] bg-[#EAF7D9]/40 cursor-default"
                  : "border-[#E8E4DC] bg-[#FDFBF7] hover:border-[#7ED22A] hover:bg-[#EAF7D9]/20 cursor-pointer"
              )}
            >
              <div className={`w-10 h-7 ${card.color} rounded-md flex items-center justify-center text-white text-[11px] font-bold tracking-widest shrink-0`}>
                {card.brand === "Visa" ? "VISA" : "MC"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A]">{card.brand} ending in {card.last4}</p>
                <p className="text-xs text-[#9E9E9E]">Expires {card.expiry}</p>
              </div>
              {card.isDefault && (
                <div className="w-8 h-8 rounded-full bg-[#7ED22A] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline" onClick={() => setShowPaymentModal(true)}>
            Manage Payment Methods
          </Button>
          <p className="text-[11px] text-[#9E9E9E] flex items-center gap-1">
            <Info className="w-3 h-3" /> Secured by Shopify Payments
          </p>
        </div>
      </div>

      {/* Subscription Management */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 space-y-4">
        <p className="text-xs text-[#6B6B6B] tracking-wider font-semibold">
          Subscription management
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setPauseDuration(null); setShowPauseModal(true); }}
            className="text-sm font-medium text-[#6B6B6B] border border-[#D4CFC5] rounded-lg px-4 py-2.5 hover:border-[#004945] hover:text-[#004945] transition-all"
          >
            Pause subscription
          </button>
          <button
            onClick={() => { setCancelStep(1); setShowCancelConfirm(true); }}
            className="text-sm font-medium text-[#C4BFB5] border border-[#E8E4DC] rounded-lg px-4 py-2.5 hover:border-red-300 hover:text-red-400 transition-all"
          >
            Cancel subscription
          </button>
        </div>
      </div>

      </div>{/* end grid Row 3 */}

      <p className="text-center text-xs text-[#9E9E9E]">
        Prefer the old interface?{" "}
        <a href="#" className="text-[#004945] hover:underline font-medium">Switch to Classic Portal</a>
      </p>

      {/* ── Set Default Address Confirm ── */}
      {setDefaultAddressId && (() => {
        const addr = savedAddresses.find(a => a.id === setDefaultAddressId);
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E8E4DC]">
              <h3 className="font-bold text-[#004945] mb-2">Set as default address?</h3>
              {addr && (
                <div className="bg-[#FDFBF7] border border-[#E8E4DC] rounded-xl px-4 py-3 mb-4">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{addr.label}</p>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">{addr.street}{addr.unit ? `, ${addr.unit}` : ""}</p>
                  <p className="text-xs text-[#9E9E9E]">{addr.city}, {addr.province} {addr.postal}</p>
                </div>
              )}
              <p className="text-sm text-[#6B6B6B] mb-5">This address will be used for all future deliveries.</p>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setSetDefaultAddressId(null)}>Cancel</Button>
                <Button className="flex-1" onClick={() => {
                  setSavedAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === setDefaultAddressId })));
                  setSetDefaultAddressId(null);
                }}>Confirm</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Delete Address Confirm ── */}
      {deleteAddressId && (() => {
        const addr = savedAddresses.find(a => a.id === deleteAddressId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E8E4DC]">
              <h3 className="font-bold text-[#004945] mb-2">Remove address?</h3>
              {addr && (
                <div className="bg-[#FDFBF7] border border-[#E8E4DC] rounded-xl px-4 py-3 mb-4">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{addr.label}</p>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">{addr.street}{addr.unit ? `, ${addr.unit}` : ""}</p>
                  <p className="text-xs text-[#9E9E9E]">{addr.city}, {addr.province} {addr.postal}</p>
                </div>
              )}
              <p className="text-sm text-[#6B6B6B] mb-5">This address will be permanently removed from your account.</p>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setDeleteAddressId(null)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={() => {
                  setSavedAddresses(prev => prev.filter(a => a.id !== deleteAddressId));
                  setDeleteAddressId(null);
                }}>Remove</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Add Address Modal ── */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E8E4DC] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F0EBE0] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-[#7ED22A] uppercase tracking-wide">
                  {addAddressStep === 1 ? "Step 1 of 2 — Details" : "Step 2 of 2 — Confirm"}
                </p>
                <h3 className="font-bold text-[#004945] mt-0.5">
                  {addAddressStep === 1 ? "Add New Address" : "Save this address?"}
                </h3>
              </div>
              <button onClick={closeAddAddressModal} className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors">
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>
            <div className="px-5 py-4 max-h-[72vh] overflow-y-auto space-y-3">
              {addAddressStep === 1 && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-[#9E9E9E] mb-1 uppercase tracking-wide">Label (e.g. Home, Work)</label>
                    <input type="text" value={newAddress.label} onChange={e => setNewAddress(p => ({ ...p, label: e.target.value }))} placeholder="Work, Parents, Gym…" className="w-full px-3 py-2 rounded-xl border border-[#E8E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7]" />
                  </div>
                  {([
                    { key: "street",       label: "Street",        placeholder: "120 Bloor St E"  },
                    { key: "unit",         label: "Unit / Apt",    placeholder: "Apt 802"          },
                    { key: "city",         label: "City",          placeholder: "Toronto"          },
                    { key: "province",     label: "Province",      placeholder: "ON"               },
                    { key: "postal",       label: "Postal Code",   placeholder: "M4W 1B8"         },
                    { key: "buzzer",       label: "Buzzer Code",   placeholder: "802 (optional)"   },
                    { key: "instructions", label: "Delivery Note", placeholder: "Leave at door"    },
                  ] as { key: keyof typeof newAddress; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[11px] font-medium text-[#9E9E9E] mb-1 uppercase tracking-wide">{label}</label>
                      <input type="text" value={newAddress[key]} onChange={e => setNewAddress(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="w-full px-3 py-2 rounded-xl border border-[#E8E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7]" />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <Button
                      className="flex-1"
                      disabled={!newAddress.street || !newAddress.city || !newAddress.postal}
                      onClick={() => setAddAddressStep(2)}
                    >
                      Review <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="flex-1" onClick={closeAddAddressModal}>Cancel</Button>
                  </div>
                </>
              )}
              {addAddressStep === 2 && (
                <>
                  <div className="bg-[#FDFBF7] border border-[#E8E4DC] rounded-xl p-4 space-y-1.5">
                    <p className="font-semibold text-[#004945]">{newAddress.label || "New Address"}</p>
                    <p className="text-sm text-[#1A1A1A]">{newAddress.street}{newAddress.unit ? `, ${newAddress.unit}` : ""}</p>
                    <p className="text-sm text-[#6B6B6B]">{newAddress.city}, {newAddress.province} {newAddress.postal}</p>
                    {newAddress.buzzer && <p className="text-xs text-[#9E9E9E]">Buzzer: {newAddress.buzzer}</p>}
                    {newAddress.instructions && <p className="text-xs text-[#9E9E9E] italic">{newAddress.instructions}</p>}
                  </div>
                  <p className="text-xs text-[#6B6B6B] text-center">Does everything look correct?</p>
                  <div className="flex gap-2 pt-1">
                    <Button variant="ghost" className="flex-1" onClick={() => setAddAddressStep(1)}>Edit</Button>
                    <Button className="flex-1" onClick={() => {
                      setSavedAddresses(prev => [...prev, {
                        id: `addr_${Date.now()}`,
                        label: newAddress.label || "New Address",
                        street: newAddress.street, unit: newAddress.unit,
                        city: newAddress.city, province: newAddress.province,
                        postal: newAddress.postal, buzzer: newAddress.buzzer,
                        instructions: newAddress.instructions, isDefault: false,
                      }]);
                      closeAddAddressModal();
                    }}>Save Address</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Set Default Card Confirm ── */}
      {setDefaultCardId && (() => {
        const card = cards.find(c => c.id === setDefaultCardId);
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E8E4DC]">
              <h3 className="font-bold text-[#004945] mb-2">Set as default card?</h3>
              {card && (
                <div className="flex items-center gap-3 bg-[#FDFBF7] border border-[#E8E4DC] rounded-xl px-4 py-3 mb-4">
                  <div className={`w-10 h-7 ${card.color} rounded-md flex items-center justify-center text-white text-[11px] font-bold tracking-widest shrink-0`}>
                    {card.brand === "Visa" ? "VISA" : "MC"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">{card.brand} ending in {card.last4}</p>
                    <p className="text-xs text-[#9E9E9E]">Expires {card.expiry}</p>
                  </div>
                </div>
              )}
              <p className="text-sm text-[#6B6B6B] mb-5">This card will be used for all future billing.</p>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setSetDefaultCardId(null)}>Cancel</Button>
                <Button className="flex-1" onClick={() => {
                  setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === setDefaultCardId })));
                  setSetDefaultCardId(null);
                }}>Confirm</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Delete Card Confirm ── */}
      {deleteCardId && (() => {
        const card = cards.find(c => c.id === deleteCardId);
        return (
          <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E8E4DC]">
              <h3 className="font-bold text-[#004945] mb-2">Remove card?</h3>
              {card && (
                <div className="flex items-center gap-3 bg-[#FDFBF7] border border-[#E8E4DC] rounded-xl px-4 py-3 mb-4">
                  <div className={`w-10 h-7 ${card.color} rounded-md flex items-center justify-center text-white text-[11px] font-bold tracking-widest shrink-0`}>
                    {card.brand === "Visa" ? "VISA" : "MC"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">{card.brand} ending in {card.last4}</p>
                    <p className="text-xs text-[#9E9E9E]">Expires {card.expiry}</p>
                  </div>
                </div>
              )}
              <p className="text-sm text-[#6B6B6B] mb-5">This card will be permanently removed from your account.</p>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setDeleteCardId(null)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={() => {
                  setCards(prev => prev.filter(c => c.id !== deleteCardId));
                  setDeleteCardId(null);
                }}>Remove Card</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Payment Method modal ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-[#E8E4DC] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F0EBE0] flex items-center justify-between">
              <h3 className="font-bold text-[#004945]">Payment Methods</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors">
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              {cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => { if (!card.isDefault) setSetDefaultCardId(card.id); }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all",
                    card.isDefault
                      ? "border-[#7ED22A] bg-[#EAF7D9]/40 cursor-default"
                      : "border-[#E8E4DC] hover:border-[#7ED22A] hover:bg-[#EAF7D9]/20 cursor-pointer"
                  )}
                >
                  <div className={`w-10 h-7 ${card.color} rounded-md flex items-center justify-center text-white text-[11px] font-bold tracking-widest shrink-0`}>
                    {card.brand === "Visa" ? "VISA" : "MC"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A]">{card.brand} ending in {card.last4}</p>
                    <p className="text-xs text-[#9E9E9E]">Expires {card.expiry}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {card.isDefault && (
                      <div className="w-8 h-8 rounded-full bg-[#7ED22A] flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {cards.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteCardId(card.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#C4BFB5] hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={() => { setShowPaymentModal(false); setShowAddCardModal(true); }}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#E8E4DC] rounded-xl text-sm font-medium text-[#9E9E9E] hover:border-[#7ED22A] hover:text-[#004945] hover:bg-[#EAF7D9]/40 transition-all"
              >
                <Plus className="w-4 h-4" /> Add new card
              </button>

              <p className="text-[11px] text-[#9E9E9E] text-center flex items-center justify-center gap-1">
                <Info className="w-3 h-3" /> Secured by Shopify Payments
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Card Modal ── */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-[#E8E4DC] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F0EBE0] flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-[#7ED22A] uppercase tracking-wide">
                  {addCardStep === 1 ? "Step 1 of 2 — Card details" : addCardStep === 2 ? "Step 2 of 2 — Confirm" : "Done"}
                </p>
                <h3 className="font-bold text-[#004945] mt-0.5">
                  {addCardStep === 1 ? "Add New Card" : addCardStep === 2 ? "Confirm New Card" : "Card Added!"}
                </h3>
              </div>
              <button onClick={closeAddCardModal} className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors">
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>
            <div className="px-5 py-4">
              {addCardStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#9E9E9E] mb-1 uppercase tracking-wide">Cardholder Name</label>
                    <input type="text" value={newCard.cardHolder} onChange={e => setNewCard(p => ({ ...p, cardHolder: e.target.value }))} placeholder="Sarah Johnson" className="w-full px-3 py-2 rounded-xl border border-[#E8E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#9E9E9E] mb-1 uppercase tracking-wide">Card Number</label>
                    <input
                      type="text"
                      value={newCard.cardNumber}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                        const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
                        setNewCard(p => ({ ...p, cardNumber: formatted }));
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7] font-mono tracking-wider"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#9E9E9E] mb-1 uppercase tracking-wide">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={newCard.expiry}
                        onChange={e => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setNewCard(p => ({ ...p, expiry: digits.length > 2 ? `${digits.slice(0,2)}/${digits.slice(2)}` : digits }));
                        }}
                        placeholder="08/27"
                        maxLength={5}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#9E9E9E] mb-1 uppercase tracking-wide">CVV</label>
                      <input
                        type="text"
                        value={newCard.cvv}
                        onChange={e => setNewCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7]"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#9E9E9E] flex items-center gap-1 justify-center">
                    <Info className="w-3 h-3" /> Secured by Shopify Payments — card info is encrypted
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      className="flex-1"
                      disabled={!newCard.cardHolder || newCard.cardNumber.replace(/\s/g, "").length < 16 || newCard.expiry.length < 5 || newCard.cvv.length < 3}
                      onClick={() => setAddCardStep(2)}
                    >
                      Review <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" className="flex-1" onClick={closeAddCardModal}>Cancel</Button>
                  </div>
                </div>
              )}
              {addCardStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-[#FDFBF7] border border-[#E8E4DC] rounded-xl p-4 space-y-1.5">
                    <p className="text-xs text-[#9E9E9E] font-medium uppercase tracking-wide">Card details</p>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{newCard.cardHolder}</p>
                    <p className="text-sm text-[#1A1A1A] font-mono tracking-wider">•••• •••• •••• {newCard.cardNumber.replace(/\s/g, "").slice(-4)}</p>
                    <p className="text-xs text-[#9E9E9E]">Expires {newCard.expiry}</p>
                  </div>
                  <p className="text-xs text-[#6B6B6B] text-center">Confirm adding this card to your account?</p>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1" onClick={() => setAddCardStep(1)}>Back</Button>
                    <Button className="flex-1" onClick={() => {
                      const digits = newCard.cardNumber.replace(/\s/g, "");
                      const brand = digits.startsWith("4") ? "Visa" : "Mastercard";
                      setCards(prev => [...prev, {
                        id: `card_${Date.now()}`,
                        brand,
                        last4: digits.slice(-4),
                        expiry: newCard.expiry,
                        isDefault: false,
                        color: brand === "Visa" ? "bg-blue-600" : "bg-red-500",
                      }]);
                      setAddCardStep(3);
                    }}>Add Card</Button>
                  </div>
                </div>
              )}
              {addCardStep === 3 && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 bg-[#EAF7D9] rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7 text-[#7ED22A]" />
                  </div>
                  <p className="font-bold text-[#004945]">Card added successfully!</p>
                  <p className="text-sm text-[#6B6B6B]">Your new card is ready to use for future billing.</p>
                  <Button className="w-full" onClick={closeAddCardModal}>Done</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Pause modal ── */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E8E4DC]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#004945]">Pause subscription</h3>
              <button onClick={() => setShowPauseModal(false)} className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors">
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Pausing resets your <strong>active week streak</strong>, but you keep your{" "}
                <strong>{tier.charAt(0).toUpperCase() + tier.slice(1)}</strong> membership tier.
              </p>
            </div>

            <p className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider mb-2">How long?</p>
            <div className="space-y-2 mb-5">
              {([
                { id: "2w"         as const, label: "2 weeks",                sub: "Resume automatically on May 20"   },
                { id: "4w"         as const, label: "4 weeks",                sub: "Resume automatically on Jun 3"    },
                { id: "indefinite" as const, label: "Until I resume manually", sub: "I'll come back when I'm ready"  },
              ]).map(({ id, label, sub }) => (
                <button
                  key={id}
                  onClick={() => setPauseDuration(id)}
                  className={cn(
                    "w-full text-left flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all",
                    pauseDuration === id ? "border-[#7ED22A] bg-[#EAF7D9]" : "border-[#E8E4DC] hover:border-[#B9EA91]"
                  )}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{label}</p>
                    <p className="text-xs text-[#9E9E9E]">{sub}</p>
                  </div>
                  {pauseDuration === id && <Check className="w-4 h-4 text-[#004945] shrink-0" />}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Button className="w-full" disabled={!pauseDuration} onClick={() => setShowPauseModal(false)}>
                Confirm Pause
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setShowPauseModal(false)}>
                Keep subscription active
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel confirmation modal ── */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E8E4DC]">

            {cancelStep === 1 && (
              <>
                <h3 className="font-bold text-lg text-[#004945] mb-2">Cancel your subscription?</h3>
                <p className="text-sm text-[#6B6B6B] mb-5">
                  You&apos;ll lose your <span className="font-semibold text-orange-500">{streak}-week streak</span> and all the perks that come with your current plan.
                </p>
                <div className="space-y-2">
                  <Button className="w-full" onClick={() => setShowCancelConfirm(false)}>
                    Keep My Subscription
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={() => setCancelStep(2)}>
                    Cancel Anyway
                  </Button>
                </div>
              </>
            )}

            {cancelStep === 2 && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-[#004945]">Wait — one last offer</h3>
                  <button
                    onClick={() => { setShowCancelConfirm(false); setCancelStep(1); }}
                    className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors"
                  >
                    <X className="w-4 h-4 text-[#6B6B6B]" />
                  </button>
                </div>

                <div className="bg-[#EAF7D9] border border-[#B9EA91] rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
                  <Gift className="w-5 h-5 text-[#004945] shrink-0" />
                  <p className="text-sm font-semibold text-[#004945]">
                    Free delivery on your next order — on us.
                  </p>
                </div>

                <p className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider mb-2">Here&apos;s what you&apos;ll lose</p>
                <ul className="space-y-2 mb-5">
                  {[
                    { icon: <Flame className="w-4 h-4 text-orange-500" />, label: `${streak}-week streak`, sub: "Reset to zero on cancellation" },
                    { icon: <Trophy className="w-4 h-4 text-yellow-600" />, label: `${tier.charAt(0).toUpperCase() + tier.slice(1)} membership`, sub: "All tier perks will be removed" },
                    { icon: <UtensilsCrossed className="w-4 h-4 text-[#004945]" />, label: "Personalized meal curation", sub: "Weekly meals matched to your plan" },
                    { icon: <Lock className="w-4 h-4 text-[#6B6B6B]" />, label: "Exclusive member meals", sub: "Members-only catalog access" },
                  ].map(({ icon, label, sub }) => (
                    <li key={label} className="flex items-start gap-3 px-3 py-2 bg-[#FDFBF7] border border-[#F0EBE0] rounded-xl">
                      <div className="w-7 h-7 rounded-lg bg-[#F0EBE0] flex items-center justify-center shrink-0 mt-0.5">{icon}</div>
                      <div>
                        <p className="text-xs font-semibold text-[#1A1A1A]">{label}</p>
                        <p className="text-[11px] text-[#9E9E9E] mt-0.5">{sub}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  <Button className="w-full" onClick={() => { setShowCancelConfirm(false); setCancelStep(1); }}>
                    Keep My Subscription
                  </Button>
                  <Button variant="destructive" className="w-full" onClick={() => { setShowCancelConfirm(false); setCancelStep(1); }}>
                    Confirm Cancellation
                  </Button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
