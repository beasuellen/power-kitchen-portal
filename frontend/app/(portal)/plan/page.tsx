"use client";

import { useState, useEffect, useRef } from "react";
import { mockSubscription, mockSubscriptionPlans, mockMealPlanTypes, type DietaryTag } from "@/lib/mock-data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useOrderStore } from "@/lib/useOrderStore";
import {
  Package, Truck, UtensilsCrossed, CreditCard, MapPin,
  Edit3, Check, ChevronDown, AlertTriangle, Info, X, ArrowRight, ChevronRight, Plus, Trash2,
  Zap, Trophy, Flame, Leaf, TrendingUp, Droplets, Heart, Gift, Lock,
} from "lucide-react";
import { DietaryIcon } from "@/components/ui/DietaryIcon";

// Aligned with RESTRICTION_OPTIONS in OrderDetailClient
const dietaryOptions: { tag: DietaryTag; label: string; desc: string }[] = [
  { tag: "DF",  label: "Dairy Free",  desc: "No milk, cheese, butter" },
  { tag: "GF",  label: "Gluten Free", desc: "No wheat, barley, rye" },
  { tag: "H",   label: "Halal",       desc: "Halal-certified only" },
  { tag: "NF",  label: "Nut Free",    desc: "No tree nuts or peanuts" },
  { tag: "SF",  label: "Soy Free",    desc: "No soy-derived ingredients" },
  { tag: "V",   label: "Vegan",       desc: "100% plant-based meals" },
];

const mealPlanIconMap: Record<string, React.ReactNode> = {
  power:       <Zap className="w-6 h-6 text-[#7ED22A]" />,
  pro_athlete: <Trophy className="w-6 h-6 text-[#7ED22A]" />,
  lean_muscle: <Flame className="w-6 h-6 text-[#7ED22A]" />,
  low_carb:    <Leaf className="w-6 h-6 text-[#7ED22A]" />,
  clean_bulk:  <TrendingUp className="w-6 h-6 text-[#7ED22A]" />,
  vegan:       <Leaf className="w-6 h-6 text-[#7ED22A]" />,
  keto:        <Droplets className="w-6 h-6 text-[#7ED22A]" />,
  glp1:        <Heart className="w-6 h-6 text-[#7ED22A]" />,
};

const addressFields = [
  { key: "street",       label: "Street",        placeholder: "120 Bloor St E" },
  { key: "unit",         label: "Unit / Apt",    placeholder: "Apt 802" },
  { key: "city",         label: "City",          placeholder: "Toronto" },
  { key: "province",     label: "Province",      placeholder: "ON" },
  { key: "postal",       label: "Postal Code",   placeholder: "M4W 1B8" },
  { key: "buzzer",       label: "Buzzer Code",   placeholder: "802" },
  { key: "instructions", label: "Delivery note", placeholder: "Leave at door" },
];

const deliveryDays = ["Sunday", "Wednesday"];

export default function PlanPage() {
  const { planName, mealsPerWeek, weeklyTotal, status, startDate, nextBillingDate, deliveryDay, streak, tier } = mockSubscription;

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

  // Address state
  const [address, setAddress] = useState({ street: "120 Bloor St East", unit: "Apt 802", city: "Toronto", province: "ON", postal: "M4W 1B8", buzzer: "802", instructions: "Leave at door" });
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const saveAddress = async () => { await new Promise((r) => setTimeout(r, 600)); setEditingAddress(false); setAddressSaved(true); setTimeout(() => setAddressSaved(false), 3000); };

  // Delivery day state
  const [selectedDay, setSelectedDay] = useState(deliveryDay);
  const [showDayPicker, setShowDayPicker] = useState(false);

  // Delivery method state
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(mockSubscription.deliveryMethod);

  // Cancel confirm
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelStep, setCancelStep] = useState<1 | 2>(1);

  // Pause modal
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseDuration, setPauseDuration] = useState<"2w" | "4w" | "indefinite" | null>(null);

  // Payment method modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cards, setCards] = useState([
    { id: "card_001", brand: "Visa",       last4: "4242", expiry: "08/27", isDefault: true,  color: "bg-blue-600"   },
    { id: "card_002", brand: "Mastercard", last4: "8834", expiry: "03/26", isDefault: false, color: "bg-red-500"    },
  ]);

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

  // Add address modal
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addAddressStep, setAddAddressStep] = useState<1 | 2>(1);
  const emptyNewAddress = { label: "", street: "", unit: "", city: "Toronto", province: "ON", postal: "", buzzer: "", instructions: "" };
  const [newAddress, setNewAddress] = useState(emptyNewAddress);
  const closeAddAddressModal = () => { setShowAddAddressModal(false); setAddAddressStep(1); setNewAddress(emptyNewAddress); };

  // Delete address confirm
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);

  // Add card modal
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [addCardStep, setAddCardStep] = useState<1 | 2 | 3>(1);
  const emptyNewCard = { cardNumber: "", cardHolder: "", expiry: "", cvv: "" };
  const [newCard, setNewCard] = useState(emptyNewCard);
  const closeAddCardModal = () => { setShowAddCardModal(false); setAddCardStep(1); setNewCard(emptyNewCard); };

  // Delete / set-default card confirms
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);
  const [setDefaultCardId, setSetDefaultCardId] = useState<string | null>(null);

  // Multiple addresses
  const [savedAddresses, setSavedAddresses] = useState([
    { id: "addr_home", label: "Home", street: "120 Bloor St East", unit: "Apt 802", city: "Toronto", province: "ON", postal: "M4W 1B8", buzzer: "802", instructions: "Leave at door", isDefault: true },
    { id: "addr_work", label: "Work", street: "181 Bay St", unit: "Suite 1800", city: "Toronto", province: "ON", postal: "M5J 2T3", buzzer: "", instructions: "Ask at reception", isDefault: false },
  ]);
  const [activeAddressId, setActiveAddressId] = useState("addr_home");
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("");

  // Change plan modal
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [changePlanStep, setChangePlanStep] = useState<1 | 2 | 3>(1);
  const [selectedNewPlan, setSelectedNewPlan] = useState<typeof mockSubscriptionPlans[0] | null>(null);
  const [currentPlan, setCurrentPlan] = useState(mockSubscriptionPlans.find((p) => p.name === planName) ?? mockSubscriptionPlans[1]);

  // Active meal plan type
  const [activeMealPlan, setActiveMealPlan] = useState(mockMealPlanTypes.find((m) => m.id === "pro_athlete") ?? mockMealPlanTypes[0]);
  const [showMealPlanPicker, setShowMealPlanPicker] = useState(false);
  const [mealPlanStep, setMealPlanStep] = useState<1 | 2 | 3>(1);
  const [pendingMealPlan, setPendingMealPlan] = useState<typeof mockMealPlanTypes[0] | null>(null);

  const mealPlanBenefits: Record<string, string[]> = {
    power:       ["Balanced macros for everyday health", "Variety of proteins & grains", "Great for maintaining weight"],
    pro_athlete: ["High protein for performance", "Optimized for recovery days", "Fuels intense training sessions"],
    lean_muscle: ["Calorie-controlled with high protein", "Supports muscle gain & fat loss", "Lean proteins & complex carbs"],
    low_carb:    ["Under 30g carbs per meal", "Blood sugar friendly", "Supports weight loss goals"],
    clean_bulk:  ["High protein & high carb", "Calorie-dense for muscle growth", "Supports strength training"],
    vegan:       ["100% plant-based ingredients", "Rich in fiber & antioxidants", "Ethically sourced produce"],
    keto:        ["Under 10g net carbs per meal", "High healthy fats", "Keeps you in ketosis"],
    glp1:        ["Optimized portion sizes", "Low glycemic ingredients", "Supports medication effectiveness"],
  };

  const openMealPlanPicker = () => { setMealPlanStep(1); setPendingMealPlan(null); setShowMealPlanPicker(true); };
  const closeMealPlanModal = () => { setShowMealPlanPicker(false); setPendingMealPlan(null); setMealPlanStep(1); };

  const openChangePlan = () => { setChangePlanStep(1); setSelectedNewPlan(null); setShowChangePlan(true); };
  const closePlanModal = () => { setShowChangePlan(false); setSelectedNewPlan(null); setChangePlanStep(1); };
  const confirmPlanChange = () => {
    if (selectedNewPlan) { setCurrentPlan(selectedNewPlan); }
    setChangePlanStep(3);
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-[#004945]">My Plan</h1>
        <p className="text-sm text-[#6B6B6B] mt-0.5">Manage your subscription, preferences and delivery</p>
      </div>

      {/* ── Row 1: Plan Overview + Delivery Day ── */}
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
              { label: "Plan", value: planName },
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
          <button onClick={openChangePlan} className="mt-4 w-full py-2 rounded-xl border border-[#E8E4DC] text-xs font-medium text-[#004945] hover:bg-[#EAF7D9] transition-colors">
            Change Plan
          </button>
        </div>

        {/* Delivery Preferences */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-[#004945]" />
            <h2 className="font-semibold text-[#004945] text-sm">Delivery Preferences</h2>
          </div>

          <div className="mb-3">
            <p className="text-xs text-[#9E9E9E] mb-1">Delivery day</p>
            <div className="relative">
              <button
                onClick={() => setShowDayPicker((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[#E8E4DC] text-sm text-[#004945] font-medium hover:bg-[#FDFBF7] transition-colors"
              >
                {selectedDay}
                <ChevronDown className="w-4 h-4 text-[#9E9E9E]" />
              </button>
              {showDayPicker && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-[#E8E4DC] rounded-xl shadow-lg z-10 overflow-hidden">
                  {deliveryDays.map((day) => (
                    <button
                      key={day}
                      onClick={() => { setSelectedDay(day); setShowDayPicker(false); }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm transition-colors",
                        day === selectedDay
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
          </div>

          <div className="mb-3">
            <p className="text-xs text-[#9E9E9E] mb-1">Delivery method</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "delivery" as const, label: "Local Delivery" },
                { value: "pickup"   as const, label: "Pickup" },
              ]).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setDeliveryMethod(value)}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-medium border-2 transition-all",
                    deliveryMethod === value
                      ? "bg-[#EAF7D9] border-[#7ED22A] text-[#004945]"
                      : "border-[#E8E4DC] text-[#9E9E9E] hover:border-[#B9EA91] hover:text-[#004945]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {deliveryMethod === "pickup" && (
              <div className="mt-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <MapPin className="w-3 h-3 text-amber-700" />
                    <p className="text-xs font-semibold text-amber-800">Pickup location</p>
                  </div>
                <p className="text-xs text-amber-700 mt-0.5">3270 Steeles Ave W, Concord, ON · Mon–Fri 9am–6pm</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs text-[#9E9E9E] mb-1">Delivery instructions</p>
            <input
              type="text"
              defaultValue="Leave at door"
              className="w-full px-3 py-2 rounded-xl border border-[#E8E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7]"
              placeholder="e.g. Leave at door"
            />
          </div>
        </div>
      </div>

      {/* ── Row 2: Address + Payment ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Address */}
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
              const isActive = addr.id === activeAddressId;
              return (
                <div
                  key={addr.id}
                  onClick={() => setActiveAddressId(addr.id)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                    isActive ? "border-[#7ED22A] bg-[#EAF7D9]" : "border-[#E8E4DC] hover:border-[#B9EA91]"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-[#004945]">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="text-[9px] font-semibold text-[#7ED22A] bg-white border border-[#B9EA91] px-1.5 py-0.5 rounded-full">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-[#1A1A1A]">{addr.street}{addr.unit ? `, ${addr.unit}` : ""}</p>
                    <p className="text-xs text-[#9E9E9E]">{addr.city}, {addr.province} {addr.postal}</p>
                    {addr.instructions && <p className="text-[10px] text-[#9E9E9E] italic mt-0.5">{addr.instructions}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!addr.isDefault && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSavedAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addr.id }))); }}
                        className="text-[10px] text-[#004945] hover:underline px-1"
                      >
                        Set default
                      </button>
                    )}
                    {savedAddresses.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteAddressId(addr.id); }}
                        className="p-1 rounded-lg hover:bg-red-50 text-[#C4BFB5] hover:text-red-400 transition-colors"
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

        {/* Payment */}
        <div
          id="payment-section"
          ref={paymentRef}
          className={`bg-white rounded-2xl border p-5 flex flex-col transition-all duration-700 ${highlightSection === "payment" ? "border-[#7ED22A] ring-2 ring-[#7ED22A]/40" : "border-[#E8E4DC]"}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-[#004945]" />
            <h2 className="font-semibold text-[#004945] text-sm">Payment Method</h2>
          </div>

          <div className="space-y-2 mb-4">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => setShowPaymentModal(true)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all hover:border-[#7ED22A] hover:bg-[#EAF7D9]/30",
                  card.isDefault ? "border-[#B9EA91] bg-[#EAF7D9]/40" : "border-[#E8E4DC] bg-[#FDFBF7]"
                )}
              >
                <div className={`w-10 h-7 ${card.color} rounded-md flex items-center justify-center text-white text-[9px] font-bold tracking-widest shrink-0`}>
                  {card.brand === "Visa" ? "VISA" : "MC"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A]">{card.brand} ending in {card.last4}</p>
                  <p className="text-xs text-[#9E9E9E]">Expires {card.expiry}</p>
                </div>
                {card.isDefault && (
                  <span className="text-[9px] font-semibold text-[#7ED22A] bg-white border border-[#B9EA91] px-1.5 py-0.5 rounded-full shrink-0">Default</span>
                )}
              </button>
            ))}
          </div>

          <Button size="sm" variant="outline" className="w-full mb-2" onClick={() => setShowPaymentModal(true)}>
            Manage Payment Methods
          </Button>
          <p className="text-[10px] text-[#9E9E9E] text-center flex items-center justify-center gap-1">
            <Info className="w-3 h-3" /> Secured by Shopify Payments
          </p>
        </div>
      </div>

      {/* ── Subscription Plan + Meal Plan (2 columns) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">

        {/* Subscription Plan */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#004945]" />
              <h2 className="font-semibold text-[#004945] text-sm">Subscription Plan</h2>
            </div>
            <span className="text-[10px] font-semibold text-[#7ED22A] bg-[#EAF7D9] px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" /> Active
            </span>
          </div>

          <div className="bg-[#EAF7D9] border border-[#B9EA91] rounded-xl p-3.5 flex-1">
            <p className="font-bold text-[#004945]">{currentPlan.name}</p>
            <p className="text-xs text-[#6B6B6B] mt-0.5">{currentPlan.tagline}</p>
            <ul className="mt-2 space-y-1">
              {currentPlan.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B]">
                  <Check className="w-3 h-3 text-[#7ED22A] shrink-0" /> {perk}
                </li>
              ))}
            </ul>
            <p className="mt-2.5 text-sm font-bold text-[#004945]">
              ${currentPlan.pricePerMeal.toFixed(2)}<span className="text-xs font-normal text-[#9E9E9E]">/meal</span>
            </p>
          </div>

          <div className="flex justify-end mt-3">
            <button
              onClick={openChangePlan}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-[#E8E4DC] text-xs font-medium text-[#6B6B6B] hover:border-[#004945] hover:text-[#004945] transition-colors"
            >
              Change subscription plan <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Meal Plan */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <UtensilsCrossed className="w-4 h-4 text-[#004945]" />
            <h2 className="font-semibold text-[#004945] text-sm">Meal Plan</h2>
          </div>

          <div className="bg-[#EAF7D9] border border-[#B9EA91] rounded-xl p-3.5 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#004945] flex items-center justify-center shrink-0">
                {mealPlanIconMap[activeMealPlan.id] ?? <Zap className="w-5 h-5 text-[#7ED22A]" />}
              </div>
              <div>
                <p className="font-bold text-[#004945]">{activeMealPlan.name}</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5 leading-snug">{activeMealPlan.description}</p>
              </div>
            </div>
            <p className="text-[10px] text-[#6B6B6B] mt-3 leading-relaxed">
              Your weekly meals are curated based on this plan. You can change it at any time and it will apply from your next order.
            </p>
          </div>

          <div className="flex justify-end mt-3">
            <button
              onClick={openMealPlanPicker}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-[#E8E4DC] text-xs font-medium text-[#6B6B6B] hover:border-[#004945] hover:text-[#004945] transition-colors"
            >
              Change meal plan <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Change Plan Modal ── */}
      {showChangePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E8E4DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0EBE0] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-[#7ED22A] uppercase tracking-wide">
                  {changePlanStep === 1 ? "Step 1 of 2 — Choose plan" : changePlanStep === 2 ? "Step 2 of 2 — Confirm" : "Done"}
                </p>
                <h3 className="font-bold text-[#004945] mt-0.5">
                  {changePlanStep === 1 ? "Change Subscription Plan" : changePlanStep === 2 ? "Confirm Your Change" : "Plan Updated!"}
                </h3>
              </div>
              <button onClick={closePlanModal} className="p-2 rounded-lg hover:bg-[#F0EBE0] transition-colors">
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>

            <div className="px-6 py-5">
              {changePlanStep === 1 && (
                <div className="space-y-3">
                  {mockSubscriptionPlans.map((plan) => {
                    const isCurrent = plan.id === currentPlan.id;
                    const isSelected = selectedNewPlan?.id === plan.id;
                    return (
                      <button
                        key={plan.id}
                        disabled={isCurrent}
                        onClick={() => setSelectedNewPlan(plan)}
                        className={cn(
                          "w-full text-left rounded-xl border-2 p-4 transition-all",
                          isCurrent ? "border-[#E8E4DC] opacity-50 cursor-not-allowed bg-[#FDFBF7]"
                          : isSelected ? "border-[#7ED22A] bg-[#EAF7D9]"
                          : "border-[#E8E4DC] hover:border-[#B9EA91]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-[#004945] text-sm">{plan.name}</p>
                            <p className="text-[11px] text-[#9E9E9E]">{plan.tagline}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-[#004945]">${plan.pricePerMeal.toFixed(2)}<span className="text-[10px] font-normal text-[#9E9E9E]">/meal</span></p>
                            {isCurrent && <span className="text-[10px] text-[#7ED22A] font-semibold">Current</span>}
                            {isSelected && <Check className="w-4 h-4 text-[#7ED22A] ml-auto mt-0.5" />}
                          </div>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {plan.perks.map((perk) => (
                            <li key={perk} className="flex items-center gap-1.5 text-[11px] text-[#6B6B6B]">
                              <Check className="w-2.5 h-2.5 text-[#7ED22A] shrink-0" /> {perk}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                  <Button className="w-full mt-2" disabled={!selectedNewPlan} onClick={() => setChangePlanStep(2)}>
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {changePlanStep === 2 && selectedNewPlan && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-[#FDFBF7] rounded-xl border border-[#E8E4DC]">
                    <div className="flex-1 text-center">
                      <p className="text-[10px] text-[#9E9E9E] mb-0.5">Current</p>
                      <p className="text-sm font-bold text-[#004945]">{currentPlan.name}</p>
                      <p className="text-xs text-[#9E9E9E]">${currentPlan.pricePerMeal.toFixed(2)}/meal</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9E9E9E] shrink-0" />
                    <div className="flex-1 text-center">
                      <p className="text-[10px] text-[#9E9E9E] mb-0.5">New</p>
                      <p className="text-sm font-bold text-[#7ED22A]">{selectedNewPlan.name}</p>
                      <p className="text-xs text-[#9E9E9E]">${selectedNewPlan.pricePerMeal.toFixed(2)}/meal</p>
                    </div>
                  </div>

                  <div className="bg-[#FDFBF7] rounded-xl border border-[#E8E4DC] p-4 space-y-2.5">
                    <p className="text-xs font-semibold text-[#004945]">Payment & Billing</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white text-[9px] font-bold tracking-widest shrink-0">VISA</div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]">Visa ending in 4242</p>
                        <p className="text-xs text-[#9E9E9E]">Expires 08/27 · Next charge on {formatDate(mockSubscription.nextBillingDate, { month: "short", day: "numeric" })}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-[#F0EBE0]">
                      <span className="text-xs text-[#6B6B6B]">New weekly total ({mealsPerWeek} meals)</span>
                      <span className="text-sm font-bold text-[#004945]">{formatCurrency(selectedNewPlan.pricePerMeal * mealsPerWeek)}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#9E9E9E] text-center">
                    Your plan change takes effect on your next billing date. You can cancel or change again at any time.
                  </p>

                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1" onClick={() => setChangePlanStep(1)}>Back</Button>
                    <Button className="flex-1" onClick={confirmPlanChange}>Confirm Change</Button>
                  </div>
                </div>
              )}

              {changePlanStep === 3 && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 bg-[#EAF7D9] rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7 text-[#7ED22A]" />
                  </div>
                  <p className="font-bold text-[#004945]">Plan updated to {currentPlan.name}!</p>
                  <p className="text-sm text-[#6B6B6B]">Your new plan takes effect on your next billing date. All future orders will reflect the updated pricing.</p>
                  <Button className="w-full" onClick={closePlanModal}>Done</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Meal Plan Modal (multi-step) ── */}
      {showMealPlanPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E8E4DC] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#F0EBE0] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-[#7ED22A] uppercase tracking-wide">
                  {mealPlanStep === 1 ? "Step 1 of 2 — Choose plan" : mealPlanStep === 2 ? "Step 2 of 2 — Compare & Confirm" : "Done"}
                </p>
                <h3 className="font-bold text-[#004945] mt-0.5">
                  {mealPlanStep === 1 ? "Change Meal Plan" : mealPlanStep === 2 ? "Here's what changes" : "Meal Plan Updated!"}
                </h3>
              </div>
              <button onClick={closeMealPlanModal} className="p-2 rounded-lg hover:bg-[#F0EBE0] transition-colors">
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>

            <div className="px-6 py-5">
              {/* Step 1 — Pick */}
              {mealPlanStep === 1 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-1">
                    {mockMealPlanTypes.map((mp) => {
                      const isActive = mp.id === activeMealPlan.id;
                      const isSelected = pendingMealPlan?.id === mp.id;
                      return (
                        <button
                          key={mp.id}
                          disabled={isActive}
                          onClick={() => setPendingMealPlan(mp)}
                          className={cn(
                            "p-3 rounded-xl border-2 text-left transition-all",
                            isActive ? "border-[#E8E4DC] opacity-50 cursor-not-allowed bg-[#FDFBF7]"
                            : isSelected ? "border-[#7ED22A] bg-[#EAF7D9]"
                            : "border-[#E8E4DC] hover:border-[#B9EA91]"
                          )}
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#004945] flex items-center justify-center mb-1">
                            {mealPlanIconMap[mp.id] ?? <Zap className="w-4 h-4 text-[#7ED22A]" />}
                          </div>
                          <p className="text-xs font-bold text-[#004945] mt-0.5">{mp.name}</p>
                          <p className="text-[10px] text-[#9E9E9E] mt-0.5 leading-tight">{mp.description}</p>
                          {isActive && <span className="text-[10px] text-[#7ED22A] font-semibold mt-1 block">Current</span>}
                          {isSelected && <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#7ED22A] mt-1"><Check className="w-2.5 h-2.5" /> Selected</span>}
                        </button>
                      );
                    })}
                  </div>
                  <Button className="w-full" disabled={!pendingMealPlan} onClick={() => setMealPlanStep(2)}>
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Step 2 — Benefits comparison */}
              {mealPlanStep === 2 && pendingMealPlan && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Current plan */}
                    <div className="bg-[#FDFBF7] border border-[#E8E4DC] rounded-xl p-4">
                      <p className="text-[10px] font-semibold text-[#9E9E9E] uppercase tracking-wide mb-2">Leaving</p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#D0E8BF] flex items-center justify-center shrink-0">
                          {mealPlanIconMap[activeMealPlan.id] ?? <Zap className="w-4 h-4 text-[#004945]" />}
                        </div>
                        <p className="font-bold text-[#004945] text-sm">{activeMealPlan.name}</p>
                      </div>
                      <ul className="space-y-1.5">
                        {(mealPlanBenefits[activeMealPlan.id] ?? []).map((b) => (
                          <li key={b} className="flex items-start gap-1.5 text-[11px] text-[#6B6B6B]">
                            <span className="text-[#9E9E9E] shrink-0 mt-0.5">–</span> {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* New plan */}
                    <div className="bg-[#EAF7D9] border border-[#B9EA91] rounded-xl p-4">
                      <p className="text-[10px] font-semibold text-[#7ED22A] uppercase tracking-wide mb-2">Joining</p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-[#004945] flex items-center justify-center shrink-0">
                          {mealPlanIconMap[pendingMealPlan.id] ?? <Zap className="w-4 h-4 text-[#7ED22A]" />}
                        </div>
                        <p className="font-bold text-[#004945] text-sm">{pendingMealPlan.name}</p>
                      </div>
                      <ul className="space-y-1.5">
                        {(mealPlanBenefits[pendingMealPlan.id] ?? []).map((b) => (
                          <li key={b} className="flex items-start gap-1.5 text-[11px] text-[#004945]">
                            <Check className="w-3 h-3 text-[#7ED22A] shrink-0 mt-0.5" /> {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <p className="text-xs text-amber-800">
                      Your meals will be curated based on <span className="font-semibold">{pendingMealPlan.name}</span> starting from your next order.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1" onClick={() => setMealPlanStep(1)}>Back</Button>
                    <Button className="flex-1" onClick={() => { setActiveMealPlan(pendingMealPlan); setMealPlanStep(3); }}>
                      Confirm Change
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3 — Success */}
              {mealPlanStep === 3 && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 bg-[#004945] rounded-full flex items-center justify-center mx-auto">
                    {mealPlanIconMap[activeMealPlan.id] ?? <Zap className="w-7 h-7 text-[#7ED22A]" />}
                  </div>
                  <p className="font-bold text-[#004945]">Switched to {activeMealPlan.name}!</p>
                  <p className="text-sm text-[#6B6B6B]">Your meals will be curated based on your new plan from your next order.</p>
                  <Button className="w-full" onClick={closeMealPlanModal}>Done</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Dietary Restrictions ── */}
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

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {dietaryOptions.map((opt) => {
            const active = dietary.includes(opt.tag);
            return (
              <button
                key={opt.tag}
                onClick={() => toggleDietary(opt.tag)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                  active
                    ? "bg-[#EAF7D9] border-[#B9EA91]"
                    : "bg-[#FDFBF7] border-[#E8E4DC] hover:border-[#B9EA91]"
                )}
              >
                <DietaryIcon tag={opt.tag} size={20} className="shrink-0" />
                <div>
                  <p className={cn("text-xs font-semibold", active ? "text-[#004945]" : "text-[#1A1A1A]")}>
                    {opt.label}
                  </p>
                  <p className="text-[10px] text-[#9E9E9E] mt-0.5">{opt.desc}</p>
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

      {/* ── Danger zone ── */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-[#9E9E9E]" />
          <h2 className="text-sm font-semibold text-[#9E9E9E]">Subscription Management</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setPauseDuration(null); setShowPauseModal(true); }}
            className="text-xs font-semibold text-white bg-[#004945] rounded-xl px-4 py-2 hover:bg-[#003835] transition-colors"
          >
            Pause Subscription
          </button>
          <button
            onClick={() => { setCancelStep(1); setShowCancelConfirm(true); }}
            className="text-xs text-[#9E9E9E] border border-[#E8E4DC] rounded-xl px-4 py-2 hover:bg-[#FDFBF7] hover:text-[#6B6B6B] transition-colors"
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-[#9E9E9E]">
        Prefer the old interface?{" "}
        <a href="#" className="text-[#004945] hover:underline font-medium">Switch to Classic Portal</a>
      </p>

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

      {/* ── Payment Method modal ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
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
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all",
                    card.isDefault ? "border-[#7ED22A] bg-[#EAF7D9]/40" : "border-[#E8E4DC]"
                  )}
                >
                  <div className={`w-10 h-7 ${card.color} rounded-md flex items-center justify-center text-white text-[9px] font-bold tracking-widest shrink-0`}>
                    {card.brand === "Visa" ? "VISA" : "MC"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A]">{card.brand} ending in {card.last4}</p>
                    <p className="text-xs text-[#9E9E9E]">Expires {card.expiry}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {card.isDefault ? (
                      <span className="text-[9px] font-semibold text-[#7ED22A] bg-white border border-[#B9EA91] px-1.5 py-0.5 rounded-full">Default</span>
                    ) : (
                      <button
                        onClick={() => setSetDefaultCardId(card.id)}
                        className="text-[10px] text-[#004945] hover:underline px-1"
                      >
                        Set default
                      </button>
                    )}
                    {cards.length > 1 && (
                      <button
                        onClick={() => setDeleteCardId(card.id)}
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

              <p className="text-[10px] text-[#9E9E9E] text-center flex items-center justify-center gap-1">
                <Info className="w-3 h-3" /> Secured by Shopify Payments
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Address Modal ── */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E8E4DC] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F0EBE0] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-[#7ED22A] uppercase tracking-wide">
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
                    <label className="block text-[10px] font-medium text-[#9E9E9E] mb-1 uppercase tracking-wide">Label (e.g. Home, Work)</label>
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
                      <label className="block text-[10px] font-medium text-[#9E9E9E] mb-1 uppercase tracking-wide">{label}</label>
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
                  if (activeAddressId === deleteAddressId) {
                    const remaining = savedAddresses.filter(a => a.id !== deleteAddressId);
                    setActiveAddressId(remaining[0]?.id ?? "");
                  }
                  setDeleteAddressId(null);
                }}>Remove</Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Set Default Card Confirm ── */}
      {setDefaultCardId && (() => {
        const card = cards.find(c => c.id === setDefaultCardId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E8E4DC]">
              <h3 className="font-bold text-[#004945] mb-2">Set as default card?</h3>
              {card && (
                <div className="flex items-center gap-3 bg-[#FDFBF7] border border-[#E8E4DC] rounded-xl px-4 py-3 mb-4">
                  <div className={`w-10 h-7 ${card.color} rounded-md flex items-center justify-center text-white text-[9px] font-bold tracking-widest shrink-0`}>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E8E4DC]">
              <h3 className="font-bold text-[#004945] mb-2">Remove card?</h3>
              {card && (
                <div className="flex items-center gap-3 bg-[#FDFBF7] border border-[#E8E4DC] rounded-xl px-4 py-3 mb-4">
                  <div className={`w-10 h-7 ${card.color} rounded-md flex items-center justify-center text-white text-[9px] font-bold tracking-widest shrink-0`}>
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

      {/* ── Add Card Modal ── */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-[#E8E4DC] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F0EBE0] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-[#7ED22A] uppercase tracking-wide">
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
                    <label className="block text-[10px] font-medium text-[#9E9E9E] mb-1 uppercase tracking-wide">Cardholder Name</label>
                    <input type="text" value={newCard.cardHolder} onChange={e => setNewCard(p => ({ ...p, cardHolder: e.target.value }))} placeholder="Sarah Johnson" className="w-full px-3 py-2 rounded-xl border border-[#E8E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-[#9E9E9E] mb-1 uppercase tracking-wide">Card Number</label>
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
                      <label className="block text-[10px] font-medium text-[#9E9E9E] mb-1 uppercase tracking-wide">Expiry (MM/YY)</label>
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
                      <label className="block text-[10px] font-medium text-[#9E9E9E] mb-1 uppercase tracking-wide">CVV</label>
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
                  <p className="text-[10px] text-[#9E9E9E] flex items-center gap-1 justify-center">
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

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E8E4DC]">

            {cancelStep === 1 && (
              <>
                <h3 className="font-bold text-lg text-[#004945] mb-2">Cancel your subscription?</h3>
                <p className="text-sm text-[#6B6B6B] mb-5">
                  You&apos;ll lose your <span className="font-semibold text-orange-500">{mockSubscription.streak}-week streak</span> and all the perks that come with your current plan.
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
                    { icon: <Flame className="w-4 h-4 text-orange-500" />, label: `${mockSubscription.streak}-week streak`, sub: "Reset to zero on cancellation" },
                    { icon: <Trophy className="w-4 h-4 text-yellow-600" />, label: `${tier.charAt(0).toUpperCase() + tier.slice(1)} membership`, sub: "All tier perks will be removed" },
                    { icon: <UtensilsCrossed className="w-4 h-4 text-[#004945]" />, label: "Personalized meal curation", sub: "Weekly meals matched to your plan" },
                    { icon: <Lock className="w-4 h-4 text-[#6B6B6B]" />, label: "Exclusive member meals", sub: "Members-only catalog access" },
                  ].map(({ icon, label, sub }) => (
                    <li key={label} className="flex items-start gap-3 px-3 py-2 bg-[#FDFBF7] border border-[#F0EBE0] rounded-xl">
                      <div className="w-7 h-7 rounded-lg bg-[#F0EBE0] flex items-center justify-center shrink-0 mt-0.5">{icon}</div>
                      <div>
                        <p className="text-xs font-semibold text-[#1A1A1A]">{label}</p>
                        <p className="text-[10px] text-[#9E9E9E] mt-0.5">{sub}</p>
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
