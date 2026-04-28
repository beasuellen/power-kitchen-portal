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
  ArrowLeft,
  Lock,
  SkipForward,
  Plus,
  Trash2,
  RefreshCw,
  Minus,
  AlertCircle,
  Check,
  Info,
  ShoppingCart,
} from "lucide-react";
import { AddSwapPanel } from "@/components/meals/AddSwapPanel";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/lib/useOrderStore";

interface DraftChange {
  type: "add" | "remove" | "quantity" | "swap";
  description: string;
}

interface DraftItem extends OrderItem {
  swappingWith?: string;
}

export function OrderDetailClient({ order }: { order: Order }) {
  const isEditable = order.status === "customizable";
  const { syncItems } = useOrderStore();

  const [draftItems, setDraftItems] = useState<DraftItem[]>(order.items.map((i) => ({ ...i })));
  const [changes, setChanges] = useState<DraftChange[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [swappingItem, setSwappingItem] = useState<DraftItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);
  const [skipConfirm, setSkipConfirm] = useState(false);

  const hasChanges = changes.length > 0;
  const draftTotal = draftItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const addChange = useCallback((change: DraftChange) => {
    setChanges((prev) => [...prev, change]);
    setSaved(false);
  }, []);

  const handleQuantityChange = (itemId: string, delta: number) => {
    setDraftItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== itemId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null as unknown as DraftItem;
          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as DraftItem[]
    );
    addChange({
      type: "quantity",
      description: delta > 0 ? "Increased quantity" : "Decreased quantity",
    });
  };

  const handleRemove = (item: DraftItem) => {
    if (removeConfirm === item.id) {
      setDraftItems((prev) => prev.filter((i) => i.id !== item.id));
      setRemoveConfirm(null);
      addChange({ type: "remove", description: `Removed ${item.meal.name}` });
    } else {
      setRemoveConfirm(item.id);
    }
  };

  const handleAddMeals = (meals: Meal[]) => {
    const newItems: DraftItem[] = meals.map((meal) => ({
      id: `draft_${Math.random().toString(36).slice(2)}`,
      meal,
      quantity: 1,
      unitPrice: meal.price,
    }));
    setDraftItems((prev) => [...prev, ...newItems]);
    meals.forEach((m) => addChange({ type: "add", description: `Added ${m.name}` }));
    setShowAddPanel(false);
  };

  const handleSwap = (targetMeal: Meal) => {
    if (!swappingItem) return;
    setDraftItems((prev) =>
      prev.map((item) =>
        item.id === swappingItem.id
          ? { ...item, meal: targetMeal, unitPrice: targetMeal.price }
          : item
      )
    );
    addChange({ type: "swap", description: `Swapped ${swappingItem.meal.name} → ${targetMeal.name}` });
    setSwappingItem(null);
    setShowAddPanel(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSaving(false);
    setSaved(true);
    setChanges([]);
    // Sync to global store so dashboard reflects the saved state
    if (isEditable) syncItems(draftItems);
  };

  const handleDiscard = () => {
    setDraftItems(order.items.map((i) => ({ ...i })));
    setChanges([]);
    setSaved(false);
  };

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
            {order.status === "customizable" ? (
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
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setSkipConfirm(true)}
            className="shrink-0"
          >
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
            You can view the planned meals below.
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {draftItems.map((item) => (
              <Card key={item.id} className={cn("relative", removeConfirm === item.id && "ring-2 ring-red-300")}>
                <div className="flex gap-3 p-4">
                  {/* Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#F0EBE0] shrink-0">
                    <Image
                      src={item.meal.imageUrl}
                      alt={item.meal.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#1A1A1A] line-clamp-2">{item.meal.name}</p>
                    <Badge variant="gray" size="sm" className="mt-0.5">{item.meal.planType}</Badge>
                    <DietaryPills tags={item.meal.dietaryTags} className="mt-1.5" />

                    {/* Price */}
                    <div className="mt-2">
                      {item.quantity > 1 ? (
                        <>
                          <span className="font-bold text-[#1A1A1A]">{formatCurrency(item.quantity * item.unitPrice)}</span>
                          <span className="text-xs text-[#9E9E9E] ml-1">{formatCurrency(item.unitPrice)}/each</span>
                        </>
                      ) : (
                        <span className="font-semibold text-[#1A1A1A]">{formatCurrency(item.unitPrice)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isEditable && (
                  <div className="flex items-center justify-between px-4 pb-3 pt-0 border-t border-[#F0EBE0]">
                    {/* Quantity */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="w-7 h-7 rounded-full border border-[#E8E4DC] flex items-center justify-center hover:bg-[#F0EBE0] transition-colors"
                      >
                        <Minus className="w-3 h-3 text-[#6B6B6B]" />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center text-[#1A1A1A]">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="w-7 h-7 rounded-full border border-[#E8E4DC] flex items-center justify-center hover:bg-[#F0EBE0] transition-colors"
                      >
                        <Plus className="w-3 h-3 text-[#6B6B6B]" />
                      </button>
                    </div>
                    {/* Swap & Remove */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setSwappingItem(item); setShowAddPanel(true); }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[#6B6B6B] hover:bg-[#EAF7D9] hover:text-[#004945] transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Swap
                      </button>

                      {removeConfirm === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setRemoveConfirm(null)}
                            className="px-2 py-1 rounded-lg text-xs text-[#6B6B6B] hover:bg-[#F0EBE0]"
                          >
                            Keep
                          </button>
                          <button
                            onClick={() => handleRemove(item)}
                            className="px-2 py-1 rounded-lg text-xs text-red-600 hover:bg-red-50 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRemove(item)}
                          className="p-1.5 rounded-lg text-[#9E9E9E] hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Add meal button (large) */}
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
                {/* Line items */}
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

                {/* Store credit */}
                <div className="border-t border-[#F0EBE0] pt-2">
                  <div className="flex justify-between text-sm text-[#6B6B6B]">
                    <span>Store Credit</span>
                    <span className="text-[#004945] font-medium">−$12.50</span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-[#F0EBE0] pt-2 flex justify-between">
                  <span className="font-bold text-[#004945]">Total</span>
                  <span className="font-bold text-[#004945]">{formatCurrency(Math.max(0, draftTotal - 12.5))}</span>
                </div>

                {/* Changes summary */}
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

                {/* Save actions */}
                {isEditable && (
                  <div className="space-y-2 pt-1">
                    {saved ? (
                      <div className="flex items-center justify-center gap-2 py-2 text-[#004945]">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">All changes saved!</span>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={handleSave}
                        loading={saving}
                        disabled={!hasChanges}
                      >
                        {saving ? "Saving changes..." : "Save All Changes"}
                      </Button>
                    )}
                    {hasChanges && !saving && (
                      <button
                        onClick={handleDiscard}
                        className="w-full text-center text-xs text-[#9E9E9E] hover:text-[#6B6B6B] transition-colors py-1"
                      >
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

      {/* Floating draft save bar (mobile) */}
      {hasChanges && isEditable && (
        <div className="fixed bottom-20 lg:hidden left-4 right-4 bg-[#004945] text-white rounded-xl px-4 py-3 flex items-center justify-between shadow-xl z-20">
          <span className="text-sm">{changes.length} unsaved change{changes.length !== 1 ? "s" : ""}</span>
          <div className="flex gap-2">
            <button onClick={handleDiscard} className="text-sm text-white/60 px-2">
              Discard
            </button>
            <Button size="sm" onClick={handleSave} loading={saving}>
              Save
            </Button>
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

      {/* Skip confirmation modal */}
      {skipConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-lg text-[#004945] mb-2">Skip this order?</h3>
            <p className="text-sm text-[#6B6B6B] mb-4">
              You'll miss your curated meal lineup for{" "}
              <strong>{formatDate(order.deliveryDate, { month: "long", day: "numeric" })}</strong>.
              Your meals are prepared just for you!
            </p>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => setSkipConfirm(false)}>
                Keep My Order
              </Button>
              <Button variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50">
                Yes, Skip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
