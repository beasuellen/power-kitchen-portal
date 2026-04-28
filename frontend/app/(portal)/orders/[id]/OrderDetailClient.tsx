"use client";

import { useState, useCallback } from "react";
import type { Order, OrderItem, Meal } from "@/lib/mock-data";
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
  Tag, Wallet, Gift,
} from "lucide-react";
import { AddSwapPanel } from "@/components/meals/AddSwapPanel";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/lib/useOrderStore";

interface DraftChange { type: "add" | "remove" | "quantity" | "swap"; description: string; }
interface DraftItem extends OrderItem { }
type PromoTab = "discount" | "credit" | "gift";

export function OrderDetailClient({ order }: { order: Order }) {
  const isEditable = order.status === "customizable";

  // Global store — only written on explicit Save
  const { syncItems, skipOrder, unskipOrder, orderSkipped } = useOrderStore();

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

  const hasChanges = changes.length > 0;
  const draftTotal = draftItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  // ── Promo / credits ──────────────────────────────────────────────
  const [activePromoTab, setActivePromoTab] = useState<PromoTab | null>(null);
  const [discountInput, setDiscountInput] = useState("");
  const [giftInput, setGiftInput] = useState("");
  const [appliedPromos, setAppliedPromos] = useState<{ id: string; label: string; amount: number }[]>([]);
  const MOCK_STORE_CREDIT = 12.50;
  const creditAlreadyApplied = appliedPromos.some((p) => p.id === "credit");

  const promoDiscount = appliedPromos.reduce((s, p) => s + p.amount, 0);
  const orderTotal = Math.max(0, draftTotal - promoDiscount);

  const applyDiscountCode = () => {
    const code = discountInput.trim().toUpperCase();
    if (!code) return;
    if (appliedPromos.some((p) => p.id === `code_${code}`)) return;
    const discount = code === "POWER10" ? draftTotal * 0.1
      : code === "WELCOME5" ? 5
      : null;
    if (discount === null) { alert("Invalid code. Try POWER10 or WELCOME5."); return; }
    setAppliedPromos((prev) => [...prev, { id: `code_${code}`, label: `Code "${code}"`, amount: discount }]);
    setDiscountInput("");
    setActivePromoTab(null);
  };

  const applyStoreCredit = () => {
    if (creditAlreadyApplied) return;
    setAppliedPromos((prev) => [...prev, { id: "credit", label: "Store Credit", amount: Math.min(MOCK_STORE_CREDIT, draftTotal) }]);
    setActivePromoTab(null);
  };

  const applyGiftCard = () => {
    const code = giftInput.trim().toUpperCase();
    if (!code) return;
    if (appliedPromos.some((p) => p.id === `gift_${code}`)) return;
    const amount = code === "GIFT25" ? 25 : code === "GIFT50" ? 50 : null;
    if (amount === null) { alert("Invalid gift card. Try GIFT25 or GIFT50."); return; }
    setAppliedPromos((prev) => [...prev, { id: `gift_${code}`, label: `Gift Card (${code})`, amount }]);
    setGiftInput("");
    setActivePromoTab(null);
  };

  const removePromo = (id: string) => setAppliedPromos((prev) => prev.filter((p) => p.id !== id));

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

  const handleAddMeals = (meals: Meal[]) => {
    const newItems: DraftItem[] = meals.map((meal) => ({
      id: `draft_${Math.random().toString(36).slice(2)}`,
      meal, quantity: 1, unitPrice: meal.price,
    }));
    setDraftItems((prev) => [...prev, ...newItems]);
    meals.forEach((m) => addChange({ type: "add", description: `Added ${m.name}` }));
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

  // ── Save → write to global store → dashboard + orders list update ──
  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setSaved(true);
    setChanges([]);
    if (isEditable) syncItems(draftItems); // 🔄 push to global store
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

  // ── Skipped view ──
  if (isEditable && orderSkipped) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3">
          <Link href="/orders" className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors mt-0.5">
            <ArrowLeft className="w-5 h-5 text-[#6B6B6B]" />
          </Link>
          <h1 className="text-xl font-bold text-[#004945]">
            {formatDate(order.deliveryDate, { weekday: "long", month: "long", day: "numeric" })}
          </h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-[#F0EBE0] flex items-center justify-center">
            <SkipForward className="w-6 h-6 text-[#9E9E9E]" />
          </div>
          <div>
            <p className="font-bold text-[#004945] text-lg">Order skipped</p>
            <p className="text-sm text-[#9E9E9E] mt-1">
              You won't receive a delivery on {formatDate(order.deliveryDate, { month: "long", day: "numeric" })}.
            </p>
            <p className="text-xs text-[#9E9E9E] mt-0.5">Your subscription resumes automatically next week.</p>
          </div>
          <button onClick={unskipOrder} className="text-sm font-medium text-[#004945] hover:underline">
            Undo skip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/orders" className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors mt-0.5">
          <ArrowLeft className="w-5 h-5 text-[#6B6B6B]" />
        </Link>
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
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#004945]">
              Your Meals
              <span className="ml-2 text-sm font-normal text-[#9E9E9E]">
                ({draftItems.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
            </h2>
            {isEditable && (
              <Button size="sm" onClick={() => { setSwappingItem(null); setShowAddPanel(true); }}>
                <Plus className="w-3.5 h-3.5" /> Add Meal
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {draftItems.map((item) => (
              <Card key={item.id} className="flex flex-col">
                {/* Top: image + info — grows to fill available space */}
                <div className="flex gap-4 p-5 flex-1">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#F0EBE0] shrink-0">
                    <Image src={item.meal.imageUrl} alt={item.meal.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="font-semibold text-sm text-[#1A1A1A] leading-snug">{item.meal.name}</p>
                    <DietaryPills tags={item.meal.dietaryTags} className="mt-2 flex-1" />
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
                  <div className="flex items-center justify-between px-5 py-4 border-t border-[#F0EBE0] bg-[#FDFBF7] rounded-b-xl">
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
        </div>

        {/* Order summary sidebar */}
        <div>
          <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
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

                {/* ── Savings & Credits section ── */}
                <div className="border-t border-[#F0EBE0] pt-4 space-y-3">

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
                    <p className="text-[10px] text-[#9E9E9E] mt-0.5">Apply a discount code, store credit, or gift card to this order</p>
                  </div>

                  {/* Option buttons */}
                  <div className="flex gap-2">
                    {([
                      { id: "discount" as PromoTab, icon: <Tag className="w-3.5 h-3.5" />, label: "Discount Code" },
                      { id: "credit"   as PromoTab, icon: <Wallet className="w-3.5 h-3.5" />, label: "Store Credit" },
                      { id: "gift"     as PromoTab, icon: <Gift className="w-3.5 h-3.5" />, label: "Gift Card" },
                    ]).map(({ id, icon, label }) => (
                      <button
                        key={id}
                        onClick={() => setActivePromoTab(activePromoTab === id ? null : id)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[10px] font-medium border-2 transition-all",
                          activePromoTab === id
                            ? "bg-[#EAF7D9] text-[#004945] border-[#7ED22A]"
                            : "bg-white text-[#6B6B6B] border-[#E8E4DC] hover:border-[#B9EA91] hover:text-[#004945]"
                        )}
                      >
                        <span className={cn("transition-colors", activePromoTab === id ? "text-[#004945]" : "text-[#9E9E9E]")}>{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Discount code input */}
                  {activePromoTab === "discount" && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-[#9E9E9E]">Enter your promo or discount code below</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. POWER10"
                          value={discountInput}
                          onChange={(e) => setDiscountInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && applyDiscountCode()}
                          className="flex-1 text-sm px-3 py-2.5 border border-[#E8E4DC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7]"
                        />
                        <button
                          onClick={applyDiscountCode}
                          className="px-4 py-2.5 bg-[#004945] text-white text-xs font-semibold rounded-xl hover:bg-[#003835] transition-colors"
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
                          <p className="text-[10px] text-[#9E9E9E] mt-0.5">Earned from referrals & returns</p>
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
                      <p className="text-[10px] text-[#9E9E9E]">Enter the code printed on your gift card</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. GIFT25"
                          value={giftInput}
                          onChange={(e) => setGiftInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && applyGiftCard()}
                          className="flex-1 text-sm px-3 py-2.5 border border-[#E8E4DC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7ED22A] bg-[#FDFBF7]"
                        />
                        <button
                          onClick={applyGiftCard}
                          className="px-4 py-2.5 bg-[#004945] text-white text-xs font-semibold rounded-xl hover:bg-[#003835] transition-colors"
                        >
                          Apply
                        </button>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#F0EBE0] pt-2 flex justify-between">
                  <span className="font-bold text-[#004945]">Total</span>
                  <span className="font-bold text-[#004945]">{formatCurrency(orderTotal)}</span>
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

      {/* Add/Swap Panel */}
      {showAddPanel && (
        <AddSwapPanel
          mode={swappingItem ? "swap" : "add"}
          currentMeal={swappingItem?.meal}
          onAdd={handleAddMeals}
          onSwap={handleSwap}
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
