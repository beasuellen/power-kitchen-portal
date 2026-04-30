"use client";

import { useState } from "react";
import { mockSubscription, mockSubscriptionPlans, mockMealPlanTypes } from "@/lib/mock-data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Package, Truck, UtensilsCrossed, CreditCard, MapPin,
  Edit3, Check, ChevronDown, AlertTriangle, Info, X, ArrowRight, ChevronRight,
} from "lucide-react";

// ─── Dietary toggles ───────────────────────────────────────────────
const dietaryOptions = [
  { id: "dairy_free",  label: "Dairy Free",  icon: "🥛", desc: "No milk, cheese, butter" },
  { id: "gluten_free", label: "Gluten Free",  icon: "🌾", desc: "No wheat, barley, rye" },
  { id: "halal",       label: "Halal",        icon: "☪️",  desc: "Halal-certified only" },
  { id: "nut_free",    label: "Nut Free",     icon: "🥜", desc: "No tree nuts or peanuts" },
  { id: "soy_free",    label: "Soy Free",     icon: "🫘", desc: "No soy-derived ingredients" },
  { id: "spice_free",  label: "Spice Free",   icon: "🌶️", desc: "Mild preparations only" },
];

// ─── Address form fields ───────────────────────────────────────────
const addressFields = [
  { key: "street",       label: "Street",       placeholder: "120 Bloor St E" },
  { key: "unit",         label: "Unit / Apt",   placeholder: "Apt 802" },
  { key: "city",         label: "City",         placeholder: "Toronto" },
  { key: "province",     label: "Province",     placeholder: "ON" },
  { key: "postal",       label: "Postal Code",  placeholder: "M4W 1B8" },
  { key: "buzzer",       label: "Buzzer Code",  placeholder: "802" },
  { key: "instructions", label: "Delivery note",placeholder: "Leave at door" },
];

const deliveryDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function PlanPage() {
  const { planName, mealsPerWeek, weeklyTotal, status, startDate, nextBillingDate, deliveryDay, streak } = mockSubscription;

  // Dietary state
  const [dietary, setDietary] = useState<string[]>(["dairy_free", "gluten_free"]);
  const [dietarySaved, setDietarySaved] = useState(false);
  const toggleDietary = (id: string) => { setDietary((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]); setDietarySaved(false); };
  const saveDietary = async () => { await new Promise((r) => setTimeout(r, 600)); setDietarySaved(true); };

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

  // Change plan modal
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [changePlanStep, setChangePlanStep] = useState<1 | 2 | 3>(1);
  const [selectedNewPlan, setSelectedNewPlan] = useState<typeof mockSubscriptionPlans[0] | null>(null);
  const [currentPlan, setCurrentPlan] = useState(mockSubscriptionPlans.find((p) => p.name === planName) ?? mockSubscriptionPlans[1]);

  // Active meal plan type
  const [activeMealPlan, setActiveMealPlan] = useState(mockMealPlanTypes.find((m) => m.id === "pro_athlete") ?? mockMealPlanTypes[0]);
  const [showMealPlanPicker, setShowMealPlanPicker] = useState(false);

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

      {/* ── Row 1: Plan Overview + Delivery Day (side by side) ── */}
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
              { label: "Streak", value: `🔥 ${streak} weeks` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-[#9E9E9E]">{label}</span>
                <span className="text-sm font-medium text-[#1A1A1A]">{value}</span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 rounded-xl border border-[#E8E4DC] text-xs font-medium text-[#004945] hover:bg-[#EAF7D9] transition-colors">
            Change Plan
          </button>
        </div>

        {/* Delivery Preferences */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-[#004945]" />
            <h2 className="font-semibold text-[#004945] text-sm">Delivery Preferences</h2>
          </div>

          {/* Delivery day picker */}
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

          {/* Delivery method toggle */}
          <div className="mb-3">
            <p className="text-xs text-[#9E9E9E] mb-1">Delivery method</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "delivery" as const, label: "🚚 Local Delivery" },
                { value: "pickup"   as const, label: "🏪 Pickup" },
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
                <p className="text-xs font-semibold text-amber-800">📍 Pickup location</p>
                <p className="text-xs text-amber-700 mt-0.5">3270 Steeles Ave W, Concord, ON · Mon–Fri 9am–6pm</p>
              </div>
            )}
          </div>

          {/* Delivery note */}
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

      {/* ── Row 2: Address + Payment (side by side) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Address — inline edit */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#004945]" />
              <h2 className="font-semibold text-[#004945] text-sm">Delivery Address</h2>
            </div>
            {!editingAddress && (
              <button
                onClick={() => setEditingAddress(true)}
                className="flex items-center gap-1 text-xs text-[#004945] hover:text-[#7ED22A] transition-colors font-medium"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
            )}
          </div>

          {!editingAddress ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#1A1A1A]">{address.street}</p>
              {address.unit && <p className="text-sm text-[#6B6B6B]">{address.unit}</p>}
              <p className="text-sm text-[#6B6B6B]">{address.city}, {address.province} {address.postal}</p>
              {address.buzzer && <p className="text-xs text-[#9E9E9E]">Buzzer: {address.buzzer}</p>}
              {address.instructions && <p className="text-xs text-[#9E9E9E] italic">{address.instructions}</p>}
              {addressSaved && (
                <p className="text-xs text-[#7ED22A] font-medium flex items-center gap-1 mt-1">
                  <Check className="w-3 h-3" /> Address saved
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {addressFields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-[10px] font-medium text-[#9E9E9E] mb-0.5 uppercase tracking-wide">{label}</label>
                  <input
                    type="text"
                    value={address[key as keyof typeof address]}
                    onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7]"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="flex-1" onClick={saveAddress}>Save Address</Button>
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => setEditingAddress(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>

        {/* Payment — inline, no redirect */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-[#004945]" />
            <h2 className="font-semibold text-[#004945] text-sm">Payment Method</h2>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FDFBF7] border border-[#E8E4DC] mb-4">
            <div className="w-10 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white text-[9px] font-bold tracking-widest shrink-0">
              VISA
            </div>
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">Visa ending in 4242</p>
              <p className="text-xs text-[#9E9E9E]">Expires 08/27</p>
            </div>
          </div>

          <Button size="sm" variant="outline" className="w-full mb-2">
            Update Payment Method
          </Button>
          <p className="text-[10px] text-[#9E9E9E] text-center flex items-center justify-center gap-1">
            <Info className="w-3 h-3" /> Secured by Shopify Payments
          </p>
        </div>
      </div>

      {/* ── Subscription + Meal Plan (2 columns) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Current Subscription */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#004945]" />
              <h2 className="font-semibold text-[#004945] text-sm">Subscription Plan</h2>
            </div>
            <span className="text-[10px] font-semibold text-[#7ED22A] bg-[#EAF7D9] px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" /> Active
            </span>
          </div>

          <div className="bg-[#EAF7D9] border border-[#B9EA91] rounded-xl p-3.5 mb-3">
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

          <button
            onClick={openChangePlan}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[#E8E4DC] text-xs font-medium text-[#6B6B6B] hover:border-[#004945] hover:text-[#004945] transition-colors"
          >
            Change subscription plan <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Current Meal Plan */}
        <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-[#004945]" />
              <h2 className="font-semibold text-[#004945] text-sm">Meal Plan Type</h2>
            </div>
            <button
              onClick={() => setShowMealPlanPicker(true)}
              className="text-[10px] font-medium text-[#004945] hover:underline"
            >
              Change
            </button>
          </div>

          <div className="bg-[#EAF7D9] border border-[#B9EA91] rounded-xl p-3.5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeMealPlan.emoji}</span>
              <div>
                <p className="font-bold text-[#004945]">{activeMealPlan.name}</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5 leading-snug">{activeMealPlan.description}</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-[#9E9E9E] mt-3 leading-relaxed">
            Your weekly meals are curated based on this plan. You can change it at any time and it will apply from your next order.
          </p>
        </div>
      </div>

      {/* ── Change Plan Modal ── */}
      {showChangePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E8E4DC] overflow-hidden">

            {/* Modal header */}
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
              {/* Step 1 — Pick a plan */}
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
                  <Button
                    className="w-full mt-2"
                    disabled={!selectedNewPlan}
                    onClick={() => setChangePlanStep(2)}
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Step 2 — Confirm */}
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

              {/* Step 3 — Success */}
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

      {/* ── Meal Plan Picker Modal ── */}
      {showMealPlanPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E8E4DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0EBE0] flex items-center justify-between">
              <h3 className="font-bold text-[#004945]">Choose your Meal Plan</h3>
              <button onClick={() => setShowMealPlanPicker(false)} className="p-2 rounded-lg hover:bg-[#F0EBE0] transition-colors">
                <X className="w-4 h-4 text-[#6B6B6B]" />
              </button>
            </div>
            <div className="px-6 py-4 grid grid-cols-2 gap-2 max-h-[70vh] overflow-y-auto">
              {mockMealPlanTypes.map((mp) => {
                const isActive = mp.id === activeMealPlan.id;
                return (
                  <button
                    key={mp.id}
                    onClick={() => { setActiveMealPlan(mp); setShowMealPlanPicker(false); }}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      isActive ? "border-[#7ED22A] bg-[#EAF7D9]" : "border-[#E8E4DC] hover:border-[#B9EA91]"
                    )}
                  >
                    <span className="text-2xl">{mp.emoji}</span>
                    <p className="text-xs font-bold text-[#004945] mt-1">{mp.name}</p>
                    <p className="text-[10px] text-[#9E9E9E] mt-0.5 leading-tight">{mp.description}</p>
                    {isActive && <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#7ED22A] mt-1"><Check className="w-2.5 h-2.5" /> Selected</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Dietary Restrictions — full width, icon toggles ── */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-[#004945]" />
            <h2 className="font-semibold text-[#004945] text-sm">Dietary Restrictions</h2>
          </div>
          <Button
            size="sm"
            variant={dietarySaved ? "secondary" : "primary"}
            onClick={saveDietary}
          >
            {dietarySaved ? <><Check className="w-3.5 h-3.5" /> Saved</> : "Save"}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {dietaryOptions.map((opt) => {
            const active = dietary.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleDietary(opt.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                  active
                    ? "bg-[#EAF7D9] border-[#B9EA91]"
                    : "bg-[#FDFBF7] border-[#E8E4DC] hover:border-[#B9EA91]"
                )}
              >
                <span className="text-xl shrink-0">{opt.icon}</span>
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

        {/* Avoid list teaser */}
        <div className="mt-4 px-3 py-2.5 rounded-xl bg-[#F0EBE0] border border-[#E8E4DC] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#004945]">Avoid List</p>
            <p className="text-[10px] text-[#9E9E9E] mt-0.5">Block specific ingredients from your recommendations</p>
          </div>
          <span className="text-[10px] font-semibold text-[#004945] bg-[#B9EA91] px-2 py-0.5 rounded-full">
            Coming Soon
          </span>
        </div>
      </div>

      {/* ── Danger zone — subtle ── */}
      <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-[#9E9E9E]" />
          <h2 className="text-sm font-semibold text-[#9E9E9E]">Subscription Management</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="text-xs text-[#6B6B6B] border border-[#E8E4DC] rounded-xl px-4 py-2 hover:bg-[#FDFBF7] transition-colors">
            Pause Subscription
          </button>
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="text-xs text-red-500 border border-red-200 rounded-xl px-4 py-2 hover:bg-red-50 transition-colors"
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Classic portal link */}
      <p className="text-center text-xs text-[#9E9E9E]">
        Prefer the old interface?{" "}
        <a href="#" className="text-[#004945] hover:underline font-medium">Switch to Classic Portal</a>
      </p>

      {/* Cancel confirmation modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E8E4DC]">
            <h3 className="font-bold text-lg text-[#004945] mb-1">Cancel your subscription?</h3>
            <p className="text-sm text-[#6B6B6B] mb-2">
              You&apos;ll lose your <span className="font-semibold text-orange-500">🔥 {mockSubscription.streak}-week streak</span> and{" "}
              <span className="font-semibold">${mockSubscription.storeCredit.toFixed(2)} in store credits</span>.
            </p>
            <p className="text-sm text-[#6B6B6B] mb-5">
              Before you go — would a free delivery on your next order change your mind?
            </p>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => setShowCancelConfirm(false)}>
                Keep My Subscription
              </Button>
              <Button variant="destructive" className="w-full" onClick={() => setShowCancelConfirm(false)}>
                Cancel Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
