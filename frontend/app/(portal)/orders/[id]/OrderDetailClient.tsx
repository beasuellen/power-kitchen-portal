"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mockOrders, mockSubscription } from "@/lib/mock-data";
import type { Order, OrderItem, Meal, DietaryTag } from "@/lib/mock-data";
import { ProductSuggestions } from "@/components/dashboard/ProductSuggestions";
import { formatDate, formatShortDate, formatCurrency } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DietaryPills } from "@/components/ui/DietaryPills";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Lock, SkipForward, Plus, Trash2,
  RefreshCw, Minus, AlertCircle, Check, Info, ShoppingCart, X, AlertTriangle, CalendarDays,
  Tag, Wallet, Gift, RotateCcw, SlidersHorizontal, Star, Zap, Trophy, Flame, Leaf, TrendingUp, Droplets, Heart, Package, Salad,
} from "lucide-react";
import { DietaryIcon } from "@/components/ui/DietaryIcon";
import { AddSwapPanel } from "@/components/meals/AddSwapPanel";
import type { AddMealEntry } from "@/lib/useOrderStore";
import { MealDetailModal } from "@/components/meals/MealDetailModal";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/lib/useOrderStore";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

const PLAN_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  "Power":        { icon: <Zap className="w-2.5 h-2.5" />,       color: "bg-yellow-50 text-yellow-700 border-yellow-200"   },
  "Pro Athlete":  { icon: <Trophy className="w-2.5 h-2.5" />,    color: "bg-blue-50 text-blue-700 border-blue-200"         },
  "Lean Muscle":  { icon: <Flame className="w-2.5 h-2.5" />,     color: "bg-orange-50 text-orange-700 border-orange-200"   },
  "Low Carb":     { icon: <Leaf className="w-2.5 h-2.5" />,      color: "bg-green-50 text-green-700 border-green-200"      },
  "Clean Bulking":{ icon: <TrendingUp className="w-2.5 h-2.5" />,color: "bg-purple-50 text-purple-700 border-purple-200"   },
  "Vegan":        { icon: <Leaf className="w-2.5 h-2.5" />,      color: "bg-emerald-50 text-emerald-700 border-emerald-200"},
  "Keto":         { icon: <Droplets className="w-2.5 h-2.5" />,  color: "bg-lime-50 text-lime-700 border-lime-200"         },
  "GLP-1 Support":{ icon: <Heart className="w-2.5 h-2.5" />,     color: "bg-pink-50 text-pink-700 border-pink-200"         },
};

function PlanTypeTag({ planType }: { planType: string }) {
  const config = PLAN_TYPE_CONFIG[planType] ?? { icon: null, color: "bg-[#F0EBE0] text-[#6B6B6B] border-[#E8E4DC]" };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.color}`}>
      {config.icon} {planType}
    </span>
  );
}

interface DraftChange { type: "add" | "remove" | "quantity" | "swap"; description: string; }
interface DraftItem extends OrderItem { }
type PromoTab = "discount" | "credit" | "gift";
type RestrictionStep = "edit" | "scope" | "confirm";

const RESTRICTION_OPTIONS: { tag: DietaryTag; label: string }[] = [
  { tag: "GF", label: "Gluten free" },
  { tag: "DF", label: "Dairy free" },
  { tag: "NF", label: "Nut free" },
  { tag: "SF", label: "Soy free" },
  { tag: "H",  label: "Halal" },
  { tag: "V",  label: "Vegan" },
];

export function OrderDetailClient({ order }: { order: Order }) {
  const isEditable = order.status === "customizable";
  const router = useRouter();

  // Global store — only written on explicit Save
  const { syncItems, skipOrder, unskipOrder, orderSkipped, globalRestrictions, setGlobalRestrictions } = useOrderStore();

  // ── Local working copy — mutations stay here until Save ──
  const [draftItems, setDraftItems] = useState<DraftItem[]>(
    // initialise from store so we reflect any previously saved state
    isEditable
      ? useOrderStore.getState().draftItems.map((i) => ({ ...i }))
      : order.items.map((i) => ({ ...i }))
  );
  const [changes, setChanges] = useState<DraftChange[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [swappingItem, setSwappingItem] = useState<DraftItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<DraftItem | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavHref, setPendingNavHref] = useState<string | null>(null);

  // Derive selected item live from draftItems so modal always shows current quantity
  const selectedItem = selectedItemId
    ? draftItems.find((i) => i.id === selectedItemId) ?? null
    : null;

  const hasChanges = changes.length > 0;
  const draftTotal = draftItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  // ── Unsaved-changes navigation guard ──────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges && isEditable) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges, isEditable]);

  const handleNavAttempt = (href: string) => {
    if (hasChanges && isEditable) {
      setPendingNavHref(href);
      setShowLeaveModal(true);
    } else {
      router.push(href);
    }
  };

  const handleLeaveWithoutSaving = () => {
    setShowLeaveModal(false);
    if (pendingNavHref) router.push(pendingNavHref);
  };

  const handleSaveAndLeave = async () => {
    await handleSave();
    setShowLeaveModal(false);
    if (pendingNavHref) router.push(pendingNavHref);
  };

  // ── Promo / credits ──────────────────────────────────────────────
  const [activePromoTab, setActivePromoTab] = useState<PromoTab | null>("discount");
  const [discountInput, setDiscountInput] = useState("");
  const [giftInput, setGiftInput] = useState("");
  const [appliedPromos, setAppliedPromos] = useState<{ id: string; label: string; amount: number }[]>([]);
  const MOCK_STORE_CREDIT = 12.50;
  const creditAlreadyApplied = appliedPromos.some((p) => p.id === "credit");

  const promoDiscount = appliedPromos.reduce((s, p) => s + p.amount, 0);
  const orderTotal    = Math.max(0, draftTotal - promoDiscount);

  // ── One discount at a time: block new promos while one is applied ──
  const hasAppliedPromo = appliedPromos.length > 0;

  const applyDiscountCode = () => {
    if (hasAppliedPromo) return;
    const code = discountInput.trim().toUpperCase();
    if (!code) return;
    const discount = code === "POWER10" ? draftTotal * 0.1
      : code === "WELCOME5" ? 5
      : null;
    if (discount === null) { alert("Invalid code. Try POWER10 or WELCOME5."); return; }
    setAppliedPromos([{ id: `code_${code}`, label: `Code "${code}"`, amount: discount }]);
    setDiscountInput("");
    setActivePromoTab(null);
  };

  const applyStoreCredit = () => {
    if (hasAppliedPromo) return;
    setAppliedPromos([{ id: "credit", label: "Store Credit", amount: Math.min(MOCK_STORE_CREDIT, draftTotal) }]);
    setActivePromoTab(null);
  };

  const applyGiftCard = () => {
    if (hasAppliedPromo) return;
    const code = giftInput.trim().toUpperCase();
    if (!code) return;
    const amount = code === "GIFT25" ? 25 : code === "GIFT50" ? 50 : null;
    if (amount === null) { alert("Invalid gift card. Try GIFT25 or GIFT50."); return; }
    setAppliedPromos([{ id: `gift_${code}`, label: `Gift Card (${code})`, amount }]);
    setGiftInput("");
    setActivePromoTab(null);
  };

  // Removing a promo also clears the open tab so the panel resets cleanly
  const removePromo = (id: string) => {
    setAppliedPromos((prev) => prev.filter((p) => p.id !== id));
    setActivePromoTab(null);
  };

  // ── Dietary restrictions popover — source of truth is the global store ──
  const [currentRestrictions, setCurrentRestrictions] = useState<DietaryTag[]>(globalRestrictions);
  const [showRestrictionsPanel, setShowRestrictionsPanel] = useState(false);
  const [draftRestrictions, setDraftRestrictions] = useState<DietaryTag[]>([]);
  const [restrictionStep, setRestrictionStep] = useState<RestrictionStep>("edit");
  const [restrictionScope, setRestrictionScope] = useState<"order" | "all" | null>(null);
  const restrictionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (restrictionsRef.current && !restrictionsRef.current.contains(e.target as Node)) {
        setShowRestrictionsPanel(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openRestrictionsPanel = () => {
    setDraftRestrictions([...currentRestrictions]);
    setRestrictionStep("edit");
    setRestrictionScope(null);
    setShowRestrictionsPanel(true);
  };

  const toggleRestriction = (tag: DietaryTag) => {
    setDraftRestrictions((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveRestrictions = () => {
    setCurrentRestrictions(draftRestrictions);
    if (restrictionScope === "all") setGlobalRestrictions(draftRestrictions);
    setShowRestrictionsPanel(false);
  };

  const addChange = useCallback((change: DraftChange) => {
    setChanges((prev) => [...prev, change]);
    setSaved(false);
  }, []);

  // ── Local mutations (do NOT touch the store yet) ──
  const handleQuantityChange = (itemId: string, delta: number) => {
    setDraftItems((prev) =>
      prev
        .map((item) => item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
        .filter((i) => i.quantity > 0)
    );
    addChange({ type: "quantity", description: delta > 0 ? "Increased quantity" : "Decreased quantity" });
  };

  const handleRemove = (item: DraftItem) => {
    setDraftItems((prev) => prev.filter((i) => i.id !== item.id));
    addChange({ type: "remove", description: `Removed ${item.meal.name}` });
    setRemoveTarget(null);
  };

  const handleAddMeals = (entries: AddMealEntry[]) => {
    setDraftItems((prev) => {
      const updated = prev.map((i) => ({ ...i }));
      for (const { meal, qty, orderType } of entries) {
        const existing = updated.find((i) => i.meal.id === meal.id);
        if (existing) {
          existing.quantity += qty;
        } else {
          updated.push({
            id: `draft_${Math.random().toString(36).slice(2)}`,
            meal,
            quantity: qty,
            unitPrice: meal.price,
            orderType,
          });
        }
      }
      return updated;
    });

    for (const { meal, qty, orderType } of entries) {
      const label = orderType === 'one-time' ? 'this order only' : 'all future orders';
      addChange({ type: "add", description: `Added ${qty}× ${meal.name} (${label})` });
    }
    setShowAddPanel(false);
  };

  const handleSwap = (targetMeal: Meal) => {
    if (!swappingItem) return;
    setDraftItems((prev) =>
      prev.map((i) => i.id === swappingItem.id ? { ...i, meal: targetMeal, unitPrice: targetMeal.price } : i)
    );
    addChange({ type: "swap", description: `Swapped ${swappingItem.meal.name} → ${targetMeal.name}` });
    setSwappingItem(null);
    setShowAddPanel(false);
  };

  const handleEditInOrder = (edits: { mealId: string; newQty: number }[]) => {
    setDraftItems((prev) =>
      prev
        .map((item) => {
          const edit = edits.find((e) => e.mealId === item.meal.id);
          if (!edit) return item;
          return { ...item, quantity: edit.newQty };
        })
        .filter((i) => i.quantity > 0)
    );
    for (const edit of edits) {
      addChange({ type: "quantity", description: `Updated ${edit.newQty}× ${edits.find(e => e.mealId === edit.mealId) ? draftItems.find(i => i.meal.id === edit.mealId)?.meal.name ?? "meal" : "meal"}` });
    }
  };

  // ── Save → write to global store → dashboard + orders list update ──
  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    setChanges([]);
    if (isEditable) syncItems(draftItems);
  };

  // ── Discard → reset local copy back to last saved state ──
  const handleDiscard = () => {
    setDraftItems(
      isEditable
        ? useOrderStore.getState().draftItems.map((i) => ({ ...i }))
        : order.items.map((i) => ({ ...i }))
    );
    setChanges([]);
    setSaved(false);
  };

  const handleConfirmSkip = () => {
    skipOrder();           // global skip
    setShowSkipModal(false);
  };

  // ── Skipped view — show next locked order ──
  if (isEditable && orderSkipped) {
    const nextLocked = mockOrders.find((o) => o.status === "locked");
    const lockedItems = nextLocked?.items ?? [];
    const lockedTotal = lockedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const lockedMeals = lockedItems.reduce((s, i) => s + i.quantity, 0);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <Link href="/orders" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9E9E9E] hover:text-[#004945] border border-[#E8E4DC] hover:border-[#B9EA91] hover:bg-[#EAF7D9]/50 rounded-lg px-3 py-1.5 transition-all group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            View all orders
          </Link>
          <h1 className="text-xl font-bold text-[#004945]">
            {formatDate(order.deliveryDate, { weekday: "long", month: "long", day: "numeric" })}
          </h1>
        </div>

        {/* Skipped notice */}
        <div className="flex items-center justify-between bg-[#F7F3EC] border border-[#E8E4DC] rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0">
              <SkipForward className="w-4 h-4 text-[#9E9E9E]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">Delivery skipped</p>
              <p className="text-xs text-[#9E9E9E]">You won't be charged for this week</p>
            </div>
          </div>
          <button
            onClick={unskipOrder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#004945] bg-white border border-[#B9EA91] hover:bg-[#EAF7D9] transition-colors shrink-0"
          >
            <RotateCcw className="w-3 h-3" /> Reactivate
          </button>
        </div>

        {/* Next order — locked */}
        {nextLocked && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-wider mb-1">Your next delivery</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#004945]">
                    {formatDate(nextLocked.deliveryDate, { weekday: "long", month: "long", day: "numeric" })}
                  </h2>
                  <Badge variant="gray"><Lock className="w-2.5 h-2.5 mr-1 inline" /> Locked</Badge>
                </div>
              </div>
            </div>

            {/* Opens for editing notice */}
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700">
                Opens for editing on <span className="font-semibold">{formatDate(nextLocked.cutoffDate, { weekday: "long", month: "long", day: "numeric" })}</span>
              </p>
            </div>

            {/* Meals grid — read only */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lockedItems.map((item) => (
                <Card key={item.id} className="flex flex-col opacity-80">
                  <div className="flex gap-4 p-5 flex-1">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#F0EBE0] shrink-0">
                      <Image src={item.meal.imageUrl} alt={item.meal.name} fill className="object-cover" sizes="80px" />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <p className="font-semibold text-sm text-[#1A1A1A] leading-snug">{item.meal.name}</p>
                      <div className="mt-1.5"><PlanTypeTag planType={item.meal.planType} /></div>
                      <DietaryPills tags={item.meal.dietaryTags} className="mt-2" />
                      <div className="mt-3">
                        {item.quantity > 1 ? (
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-base text-[#004945]">{formatCurrency(item.quantity * item.unitPrice)}</span>
                            <span className="text-xs text-[#9E9E9E]">{formatCurrency(item.unitPrice)} each</span>
                          </div>
                        ) : (
                          <span className="font-bold text-base text-[#004945]">{formatCurrency(item.unitPrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Locked footer */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-[#F0EBE0] bg-[#FDFBF7] rounded-b-xl">
                    <span className="text-xs text-[#9E9E9E] flex items-center gap-1.5">
                      <Lock className="w-3 h-3" /> Qty: {item.quantity}
                    </span>
                    <span className="text-xs text-[#9E9E9E]">{item.meal.calories} cal</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Summary footer */}
            <div className="flex items-center justify-between bg-white border border-[#F0EBE0] rounded-2xl px-5 py-4">
              <div>
                <p className="text-xs text-[#9E9E9E]">{lockedMeals} meals · locked order</p>
                <p className="text-xl font-bold text-[#004945]">{formatCurrency(lockedTotal)}</p>
              </div>
              <Link href="/orders">
                <Button variant="outline" size="sm">See all orders <ArrowLeft className="w-3.5 h-3.5 rotate-180" /></Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        {/* Back link */}
        <button
          onClick={() => handleNavAttempt("/orders")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9E9E9E] hover:text-[#004945] border border-[#E8E4DC] hover:border-[#B9EA91] hover:bg-[#EAF7D9]/50 rounded-lg px-3 py-1.5 transition-all group"
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          View all orders
        </button>

        {/* Title row */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-[#004945]">
                {formatDate(order.deliveryDate, { weekday: "long", month: "long", day: "numeric" })}
              </h1>
              {isEditable ? (
                <Badge variant="green">Ready to customize</Badge>
              ) : order.status === "locked" ? (
                <Badge variant="gray"><Lock className="w-2.5 h-2.5 mr-1" /> Locked</Badge>
              ) : (
                <Badge variant="gray">Delivered</Badge>
              )}
            </div>
            <p className="text-sm text-[#9E9E9E] mt-0.5">
              Billed {formatShortDate(order.billingDate)} · Cutoff {formatShortDate(order.cutoffDate)}
            </p>
          </div>
          {isEditable && (
            <Button variant="destructive" size="sm" onClick={() => setShowSkipModal(true)} className="shrink-0">
              <SkipForward className="w-3.5 h-3.5" /> Skip Order
            </Button>
          )}
        </div>
      </div>

      {/* Locked notice */}
      {order.status === "locked" && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            This order is locked. Customization opens on <strong>{formatShortDate(order.cutoffDate)}</strong>.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meals grid */}
        <div className="lg:col-span-2 space-y-4">

          {/* ── Nutritionist banner — top of editable order ── */}
          {isEditable && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("openNutritionistPanel"))}
              className="w-full flex items-center gap-3 bg-[#EAF7D9] hover:bg-[#D6F0B8] border border-[#B9EA91] rounded-xl px-4 py-2.5 transition-colors text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#004945] flex items-center justify-center shrink-0">
                <Salad className="w-3.5 h-3.5 text-[#7ED22A]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#004945]">Not sure what to order?</p>
                <p className="text-[11px] text-[#6B6B6B] truncate">Our nutritionists can help you build the perfect plan</p>
              </div>
              <span className="text-xs font-semibold text-[#004945] whitespace-nowrap group-hover:underline shrink-0">
                Talk to a nutritionist →
              </span>
            </button>
          )}

          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#004945]">
              Your Meals
              <span className="ml-2 text-sm font-normal text-[#9E9E9E]">
                ({draftItems.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
            </h2>
            {isEditable && (
              <div className="flex items-center gap-2">

                {/* ── Dietary restrictions button + popover ── */}
                <div className="relative" ref={restrictionsRef}>
                  <button
                    onClick={openRestrictionsPanel}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-medium border rounded-lg px-2.5 py-1.5 transition-colors",
                      showRestrictionsPanel
                        ? "bg-[#EAF7D9] border-[#7ED22A] text-[#004945]"
                        : "bg-white border-[#E8E4DC] text-[#6B6B6B] hover:border-[#B9EA91] hover:text-[#004945]"
                    )}
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span className="hidden sm:inline">Restrictions</span>
                    {currentRestrictions.length > 0 && (
                      <span className="w-4 h-4 bg-[#004945] text-white text-[11px] font-bold rounded-full flex items-center justify-center leading-none">
                        {currentRestrictions.length}
                      </span>
                    )}
                  </button>

                  {/* Dropdown popover */}
                  {showRestrictionsPanel && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-[#E8E4DC] shadow-xl z-30 overflow-hidden">

                      {/* Step 1: edit */}
                      {restrictionStep === "edit" && (
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-[#1A1A1A]">Dietary restrictions</p>
                            <p className="text-[11px] text-[#9E9E9E] mt-0.5">Tap to toggle — no need to click edit first</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {RESTRICTION_OPTIONS.map(({ tag, label }) => {
                              const selected = draftRestrictions.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  onClick={() => toggleRestriction(tag)}
                                  className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all",
                                    selected
                                      ? "bg-[#EAF7D9] border-[#7ED22A] text-[#004945]"
                                      : "bg-white border-[#E8E4DC] text-[#6B6B6B] hover:border-[#B9EA91]"
                                  )}
                                >
                                  <DietaryIcon tag={tag} size={14} />
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                          {(() => {
                            const hasChanged =
                              draftRestrictions.length !== currentRestrictions.length ||
                              draftRestrictions.some((t) => !currentRestrictions.includes(t));
                            return hasChanged ? (
                              <button
                                onClick={() => setRestrictionStep("scope")}
                                className="w-full py-2.5 bg-[#004945] text-white text-xs font-semibold rounded-xl hover:bg-[#003835] transition-colors"
                              >
                                Save
                              </button>
                            ) : null;
                          })()}
                        </div>
                      )}

                      {/* Step 2: scope */}
                      {restrictionStep === "scope" && (
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-[#1A1A1A]">Apply changes to:</p>
                            <p className="text-[11px] text-[#9E9E9E] mt-0.5">Where should these restrictions apply?</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => { setRestrictionScope("order"); setRestrictionStep("confirm"); }}
                              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#E8E4DC] hover:border-[#7ED22A] hover:bg-[#EAF7D9] transition-all text-center"
                            >
                              <div className="w-10 h-10 rounded-xl bg-[#F0EBE0] flex items-center justify-center">
                                <Package className="w-5 h-5 text-[#6B6B6B]" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[#1A1A1A]">This order only</p>
                                <p className="text-[11px] text-[#9E9E9E] mt-0.5">Won't affect future orders</p>
                              </div>
                            </button>
                            <button
                              onClick={() => { setRestrictionScope("all"); setRestrictionStep("confirm"); }}
                              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[#E8E4DC] hover:border-[#7ED22A] hover:bg-[#EAF7D9] transition-all text-center"
                            >
                              <div className="w-10 h-10 rounded-xl bg-[#F0EBE0] flex items-center justify-center">
                                <RotateCcw className="w-5 h-5 text-[#6B6B6B]" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[#1A1A1A]">All my orders</p>
                                <p className="text-[11px] text-[#9E9E9E] mt-0.5">Updates your account preferences</p>
                              </div>
                            </button>
                          </div>
                          <button
                            onClick={() => setShowRestrictionsPanel(false)}
                            className="w-full text-center text-xs text-[#9E9E9E] hover:text-[#6B6B6B] py-1 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}

                      {/* Step 3: confirm */}
                      {restrictionStep === "confirm" && (() => {
                        const added = draftRestrictions.filter((t) => !currentRestrictions.includes(t));
                        const removed = currentRestrictions.filter((t) => !draftRestrictions.includes(t));
                        const label = (tags: DietaryTag[]) =>
                          tags.map((t) => RESTRICTION_OPTIONS.find((o) => o.tag === t)?.label ?? t).join(", ");

                        let actionText = "";
                        if (added.length > 0 && removed.length === 0)
                          actionText = `add ${label(added)}`;
                        else if (removed.length > 0 && added.length === 0)
                          actionText = `remove ${label(removed)}`;
                        else if (added.length > 0 && removed.length > 0)
                          actionText = `add ${label(added)} and remove ${label(removed)}`;
                        else
                          actionText = "keep your current restrictions";

                        const scopeSuffix = restrictionScope === "all" ? " for all your orders" : " for this order";

                        return (
                          <div className="p-4 space-y-3">
                            <div>
                              <p className="text-xs font-semibold text-[#1A1A1A]">Confirm your restrictions</p>
                              <p className="text-[11px] text-[#9E9E9E] mt-0.5">
                                {restrictionScope === "all"
                                  ? "This will update all your future orders"
                                  : "This will apply to this order only"}
                              </p>
                            </div>
                            <div className="bg-[#FDFBF7] border border-[#F0EBE0] rounded-xl p-3 space-y-2">
                              <p className="text-[11px] text-[#9E9E9E] leading-relaxed">
                                Are you sure you want to{" "}
                                <span className="font-semibold text-[#1A1A1A]">{actionText}</span>
                                {scopeSuffix}?
                              </p>
                              {/* Added pills */}
                              {added.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {added.map((tag) => {
                                    const opt = RESTRICTION_OPTIONS.find((o) => o.tag === tag);
                                    return opt ? (
                                      <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-[#EAF7D9] border border-[#7ED22A] rounded-full text-[11px] font-medium text-[#004945]">
                                        <DietaryIcon tag={opt.tag} size={12} /> {opt.label}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}
                              {/* Removed pills */}
                              {removed.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {removed.map((tag) => {
                                    const opt = RESTRICTION_OPTIONS.find((o) => o.tag === tag);
                                    return opt ? (
                                      <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 rounded-full text-[11px] font-medium text-red-500 line-through">
                                        <DietaryIcon tag={opt.tag} size={12} /> {opt.label}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <button
                                onClick={handleSaveRestrictions}
                                className="w-full py-2.5 bg-[#004945] text-white text-xs font-semibold rounded-xl hover:bg-[#003835] transition-colors"
                              >
                                Yes, confirm
                              </button>
                              <button
                                onClick={() => setShowRestrictionsPanel(false)}
                                className="w-full text-center text-xs text-[#9E9E9E] hover:text-[#6B6B6B] py-1 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <Button size="sm" onClick={() => { setSwappingItem(null); setShowAddPanel(true); }}>
                  <Plus className="w-3.5 h-3.5" /> Add Meal
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {draftItems.map((item) => (
              <Card
                key={item.id}
                className="flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedItemId(item.id)}
              >
                {/* Top: image + info — grows to fill available space */}
                <div className="flex gap-4 p-5 flex-1">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#F0EBE0] shrink-0">
                    <Image src={item.meal.imageUrl} alt={item.meal.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="font-semibold text-sm text-[#1A1A1A] leading-snug">{item.meal.name}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <PlanTypeTag planType={item.meal.planType} />
                      {item.orderType === 'one-time' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5F5F5] border border-[#E0E0E0] text-[#6B6B6B]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9E9E9E] shrink-0" />
                          One-time
                        </span>
                      )}
                    </div>
                    <DietaryPills tags={item.meal.dietaryTags} className="mt-2" onSeeAll={() => setSelectedItemId(item.id)} />
                    <div className="mt-3">
                      {item.quantity > 1 ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-base text-[#004945]">{formatCurrency(item.quantity * item.unitPrice)}</span>
                          <span className="text-xs text-[#9E9E9E]">{formatCurrency(item.unitPrice)} each</span>
                        </div>
                      ) : (
                        <span className="font-bold text-base text-[#004945]">{formatCurrency(item.unitPrice)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom: actions — always pinned to bottom */}
                {isEditable && (
                  <div
                    className="flex items-center justify-between px-5 py-4 border-t border-[#F0EBE0] bg-[#FDFBF7] rounded-b-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleQuantityChange(item.id, -1)} className="w-8 h-8 rounded-full border border-[#E8E4DC] flex items-center justify-center hover:bg-[#F0EBE0] transition-colors">
                        <Minus className="w-3.5 h-3.5 text-[#6B6B6B]" />
                      </button>
                      <span className="text-sm font-semibold w-4 text-center text-[#1A1A1A]">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.id, 1)} className="w-8 h-8 rounded-full border border-[#E8E4DC] flex items-center justify-center hover:bg-[#F0EBE0] transition-colors">
                        <Plus className="w-3.5 h-3.5 text-[#6B6B6B]" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setSwappingItem(item); setShowAddPanel(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B6B6B] hover:bg-[#EAF7D9] hover:text-[#004945] transition-colors border border-[#E8E4DC]">
                        <RefreshCw className="w-3 h-3" /> Swap
                      </button>
                      <button onClick={() => setRemoveTarget(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9E9E9E] hover:text-red-500 hover:bg-red-50 transition-colors border border-[#E8E4DC]">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {isEditable && (
            <button
              onClick={() => { setSwappingItem(null); setShowAddPanel(true); }}
              className="w-full border-2 border-dashed border-[#E8E4DC] rounded-xl py-6 text-sm text-[#9E9E9E] hover:border-[#7ED22A] hover:text-[#004945] hover:bg-[#EAF7D9]/40 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Meal to This Order
            </button>
          )}

          {/* ── Rate your meals CTA — for delivered orders that haven't been rated ── */}
          {order.status === "delivered" && !showFeedback && (
            <div className="mt-2 border border-[#E8E4DC] rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#EAF7D9] to-[#f4fcea] px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#004945] flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-[#7ED22A]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#004945]">How was this delivery?</p>
                    <p className="text-xs text-[#6B6B6B]">Rate your meals and earn <span className="font-semibold text-[#004945]">+10 points</span></p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFeedback(true)}
                  className="shrink-0 px-4 py-2 bg-[#004945] text-white text-xs font-semibold rounded-xl hover:bg-[#003835] transition-colors"
                >
                  Rate now
                </button>
              </div>
            </div>
          )}

          {/* ── Product suggestions — always visible to upsell ── */}
          {isEditable && (
            <div className="pt-8">
              <div className="border-t border-[#F0EBE0] mb-8" />
              <ProductSuggestions />
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div>
          <div className="sticky top-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#6B6B6B]" />
                  <h3 className="font-semibold text-[#004945]">Order Summary</h3>
                </div>
              </CardHeader>
              <CardBody className="pt-0 space-y-3">
                <div className="space-y-2">
                  {draftItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start gap-2">
                      <span className="text-sm text-[#6B6B6B] line-clamp-1 flex-1">
                        {item.quantity > 1 && <span className="font-medium">{item.quantity}× </span>}
                        {item.meal.name}
                      </span>
                      <span className="text-sm font-medium text-[#1A1A1A] shrink-0">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ── Savings & Credits — only on next customizable order ── */}
                {isEditable && <div className="border-t border-[#F0EBE0] pt-4 space-y-3">

                  {/* Applied promos */}
                  {appliedPromos.length > 0 && (
                    <div className="space-y-1.5">
                      {appliedPromos.map((p) => (
                        <div key={p.id} className="flex items-center justify-between bg-[#EAF7D9] rounded-lg px-3 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-[#004945]" />
                            <span className="text-xs font-medium text-[#004945]">{p.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#004945]">−{formatCurrency(p.amount)}</span>
                            <button onClick={() => removePromo(p.id)} className="text-[#9E9E9E] hover:text-red-400 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Section header */}
                  <div>
                    <p className="text-xs font-semibold text-[#1A1A1A]">Savings & Credits</p>
                    <p className="text-[11px] mt-0.5">
                      {hasAppliedPromo
                        ? <span className="text-amber-600 font-medium">Remove the applied discount to use a different option.</span>
                        : <span className="text-[#9E9E9E]">Apply a discount code, store credit, or gift card to this order</span>
                      }
                    </p>
                  </div>

                  {/* Option buttons — disabled while any promo is applied */}
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: "discount" as PromoTab, icon: <Tag className="w-3.5 h-3.5" />, label: "Discount" },
                      { id: "credit"   as PromoTab, icon: <Wallet className="w-3.5 h-3.5" />, label: "Credit" },
                      { id: "gift"     as PromoTab, icon: <Gift className="w-3.5 h-3.5" />, label: "Gift Card" },
                    ]).map(({ id, icon, label }) => {
                      const isActive   = activePromoTab === id;
                      const isDisabled = hasAppliedPromo;
                      return (
                        <button
                          key={id}
                          disabled={isDisabled}
                          onClick={() => !isDisabled && setActivePromoTab(isActive ? null : id)}
                          title={isDisabled ? "Remove the current discount first" : undefined}
                          className={cn(
                            "flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[11px] font-medium border-2 transition-all whitespace-nowrap",
                            isDisabled
                              ? "bg-[#F7F5F0] text-[#C4BFB5] border-[#EDE8DF] opacity-50 cursor-not-allowed"
                              : isActive
                              ? "bg-[#EAF7D9] text-[#004945] border-[#7ED22A]"
                              : "bg-white text-[#6B6B6B] border-[#E8E4DC] hover:border-[#B9EA91] hover:text-[#004945]"
                          )}
                        >
                          <span className={cn(
                            "transition-colors",
                            isDisabled ? "text-[#C4BFB5]" : isActive ? "text-[#004945]" : "text-[#9E9E9E]"
                          )}>{icon}</span>
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Discount code input */}
                  {activePromoTab === "discount" && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-[#9E9E9E]">Enter your promo or discount code below</p>
                      <div className="flex gap-2 min-w-0">
                        <input
                          type="text"
                          placeholder="e.g. POWER10"
                          value={discountInput}
                          onChange={(e) => setDiscountInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && applyDiscountCode()}
                          className="flex-1 min-w-0 text-sm px-3 py-2.5 border border-[#E8E4DC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7]"
                        />
                        <button
                          onClick={applyDiscountCode}
                          className="shrink-0 px-4 py-2.5 bg-[#004945] text-white text-xs font-semibold rounded-xl hover:bg-[#003835] transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Store credit */}
                  {activePromoTab === "credit" && (
                    <div className="bg-[#FDFBF7] border border-[#F0EBE0] rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-[#1A1A1A]">Your store credit</p>
                          <p className="text-[11px] text-[#9E9E9E] mt-0.5">Earned from referrals & returns</p>
                        </div>
                        <span className="text-lg font-bold text-[#004945]">{formatCurrency(MOCK_STORE_CREDIT)}</span>
                      </div>
                      <button
                        onClick={applyStoreCredit}
                        disabled={creditAlreadyApplied}
                        className={cn(
                          "w-full py-2 rounded-xl text-xs font-semibold transition-colors",
                          creditAlreadyApplied
                            ? "bg-[#F0EBE0] text-[#9E9E9E] cursor-not-allowed"
                            : "bg-[#004945] text-white hover:bg-[#003835]"
                        )}
                      >
                        {creditAlreadyApplied ? "Already applied" : `Apply ${formatCurrency(MOCK_STORE_CREDIT)}`}
                      </button>
                    </div>
                  )}

                  {/* Gift card input */}
                  {activePromoTab === "gift" && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-[#9E9E9E]">Enter the code printed on your gift card</p>
                      <div className="flex gap-2 min-w-0">
                        <input
                          type="text"
                          placeholder="e.g. GIFT25"
                          value={giftInput}
                          onChange={(e) => setGiftInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && applyGiftCard()}
                          className="flex-1 min-w-0 text-sm px-3 py-2.5 border border-[#E8E4DC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7]"
                        />
                        <button
                          onClick={applyGiftCard}
                          className="shrink-0 px-4 py-2.5 bg-[#004945] text-white text-xs font-semibold rounded-xl hover:bg-[#003835] transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>}

                <div className="border-t border-[#F0EBE0] pt-2 flex justify-between">
                  <span className="font-bold text-[#004945]">Total</span>
                  <span className="font-bold text-[#004945]">{formatCurrency(isEditable ? orderTotal : draftTotal)}</span>
                </div>

                {/* Unsaved changes notice */}
                {hasChanges && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-800">
                        {changes.length} unsaved change{changes.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <ul className="space-y-0.5">
                      {changes.slice(-4).map((c, i) => (
                        <li key={i} className="text-xs text-amber-700">· {c.description}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {isEditable && (
                  <div className="space-y-2 pt-1">
                    {saved ? (
                      <div className="flex items-center justify-center gap-2 py-2 text-[#004945]">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">All changes saved!</span>
                      </div>
                    ) : (
                      <Button className="w-full" onClick={handleSave} loading={saving} disabled={!hasChanges}>
                        {saving ? "Saving…" : "Save All Changes"}
                      </Button>
                    )}
                    {hasChanges && !saving && (
                      <button onClick={handleDiscard} className="w-full text-center text-xs text-[#9E9E9E] hover:text-[#6B6B6B] transition-colors py-1">
                        Discard Changes
                      </button>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile save bar */}
      {hasChanges && isEditable && (
        <div className="fixed bottom-20 lg:hidden left-4 right-4 bg-[#004945] text-white rounded-xl px-4 py-3 flex items-center justify-between shadow-xl z-20">
          <span className="text-sm">{changes.length} unsaved change{changes.length !== 1 ? "s" : ""}</span>
          <div className="flex gap-2">
            <button onClick={handleDiscard} className="text-sm text-white/60 px-2">Discard</button>
            <Button size="sm" onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      )}

      {/* ── Meal detail modal (global shared component) ── */}
      {selectedItem && (
        <MealDetailModal
          meal={selectedItem.meal}
          onClose={() => setSelectedItemId(null)}
        />
      )}

      {/* Add/Swap Panel */}
      {showAddPanel && (
        <AddSwapPanel
          mode={swappingItem ? "swap" : "add"}
          currentMeal={swappingItem?.meal}
          cartItems={draftItems}
          onAdd={handleAddMeals}
          onSwap={handleSwap}
          onEditInOrder={handleEditInOrder}
          onClose={() => { setShowAddPanel(false); setSwappingItem(null); }}
        />
      )}

      {/* ── Remove meal confirmation modal ── */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-[#E8E4DC] overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#004945]">Remove this meal?</h3>
                <p className="text-xs text-[#9E9E9E] mt-0.5 line-clamp-2">{removeTarget.meal.name}</p>
              </div>
              <button onClick={() => setRemoveTarget(null)} className="p-1 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0">
                <X className="w-4 h-4 text-[#9E9E9E]" />
              </button>
            </div>
            <div className="px-6 pb-2">
              <div className="flex items-center gap-3 bg-[#FDFBF7] border border-[#F0EBE0] rounded-xl p-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <Image src={removeTarget.meal.imageUrl} alt={removeTarget.meal.name} fill className="object-cover" sizes="48px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] truncate">{removeTarget.meal.name}</p>
                  <p className="text-xs text-[#9E9E9E]">{removeTarget.quantity > 1 ? `${removeTarget.quantity}× ` : ""}{formatCurrency(removeTarget.unitPrice * removeTarget.quantity)}</p>
                </div>
              </div>
              <p className="text-xs text-[#9E9E9E] mt-3 leading-relaxed">
                This meal will be removed from your order. You can add it back anytime before the cutoff date.
              </p>
            </div>
            <div className="px-6 pb-6 pt-4 flex flex-col gap-2">
              <Button variant="destructive" className="w-full" onClick={() => handleRemove(removeTarget)}>
                Yes, remove it
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setRemoveTarget(null)}>
                Keep in my order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback modal — triggered from delivered order Rate CTA */}
      {showFeedback && (
        <FeedbackModal
          order={order}
          onClose={() => setShowFeedback(false)}
        />
      )}

      {/* ── Leave without saving confirmation modal ── */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-[#E8E4DC] overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#004945]">You have unsaved changes</h3>
                <p className="text-xs text-[#9E9E9E] mt-0.5">
                  {changes.length} change{changes.length !== 1 ? "s" : ""} will be lost if you leave now.
                </p>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="p-1 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-[#9E9E9E]" />
              </button>
            </div>

            {/* Change list */}
            <div className="px-6 pb-2">
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 space-y-1">
                {changes.slice(-4).map((c, i) => (
                  <p key={i} className="text-xs text-amber-700">· {c.description}</p>
                ))}
                {changes.length > 4 && (
                  <p className="text-xs text-amber-500">+{changes.length - 4} more…</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 pt-4 flex flex-col gap-2">
              <Button className="w-full" onClick={handleSaveAndLeave} loading={saving}>
                Save changes & leave
              </Button>
              <Button variant="destructive" className="w-full" onClick={handleLeaveWithoutSaving}>
                Leave without saving
              </Button>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="w-full text-center text-xs text-[#9E9E9E] hover:text-[#6B6B6B] transition-colors py-1.5"
              >
                Stay on this page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip modal */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-[#E8E4DC] overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#004945]">Skip this delivery?</h3>
                <p className="text-xs text-[#9E9E9E] mt-0.5">
                  {formatDate(order.deliveryDate, { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
              <button onClick={() => setShowSkipModal(false)} className="p-1 rounded-lg hover:bg-[#F0EBE0] transition-colors">
                <X className="w-4 h-4 text-[#9E9E9E]" />
              </button>
            </div>
            <div className="px-6 pb-2 space-y-3">
              <div className="bg-[#FDFBF7] rounded-xl border border-[#F0EBE0] p-3.5 space-y-2">
                <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide">This order</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#1A1A1A]">{draftItems.reduce((s, i) => s + i.quantity, 0)} meals</span>
                  <span className="text-sm font-bold text-[#004945]">{formatCurrency(draftTotal)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#9E9E9E]">
                  <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                  You won't be charged for this delivery
                </div>
              </div>
              <p className="text-xs text-[#9E9E9E] leading-relaxed">
                Skipping is free and your subscription stays active. Resumes automatically next week.
              </p>
            </div>
            <div className="px-6 pb-6 pt-4 flex flex-col gap-2">
              <Button variant="destructive" className="w-full" onClick={handleConfirmSkip}>
                Yes, skip this delivery
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setShowSkipModal(false)}>
                Keep my order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
