// v2
"use client";

import { useState, useEffect, useRef } from "react";
import { mealCatalog, mockMealPlanTypes, type Meal, type MealCategory, type DietaryTag, type OrderItem } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DietaryPills } from "@/components/ui/DietaryPills";
import Image from "next/image";
import { X, Check, ChevronRight, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrderStore, type AddMealEntry } from "@/lib/useOrderStore";
import { MealDetailModal } from "@/components/meals/MealDetailModal";
import { InOrderBadge } from "@/components/ui/InOrderBadge";
import { ConfirmAddItemsModal } from "@/components/meals/ConfirmAddItemsModal";

interface AddSwapPanelProps {
  mode: "add" | "swap";
  currentMeal?: Meal;
  defaultCategory?: MealCategory | "all";
  defaultCategories?: MealCategory[];
  hideMealsTab?: boolean;
  cartItems?: OrderItem[];
  initialSelectedMeal?: Meal;
  onAdd: (entries: AddMealEntry[]) => void;
  onSwap: (meal: Meal) => void;
  /** Called when the user adjusts the quantity of an existing cart item */
  onEditInOrder?: (edits: { mealId: string; newQty: number }[]) => void;
  onClose: () => void;
}

interface SelectedEntry {
  meal: Meal;
  qty: number;
}

const categories: { id: MealCategory | "all"; label: string }[] = [
  { id: "all",       label: "All Meals" },
  { id: "meals",     label: "Meals" },
  { id: "breakfast", label: "Breakfast" },
  { id: "shakes",    label: "Shakes" },
  { id: "desserts",  label: "Desserts" },
  { id: "snacks",    label: "Snacks" },
];

const dietaryFilters: { id: DietaryTag; label: string }[] = [
  { id: "GF", label: "Gluten Free" },
  { id: "DF", label: "Dairy Free" },
  { id: "H",  label: "Halal" },
  { id: "NF", label: "Nut Free" },
  { id: "SF", label: "Soy Free" },
  { id: "V",  label: "Vegan" },
];

export function AddSwapPanel({
  mode,
  currentMeal,
  defaultCategory,
  defaultCategories,
  hideMealsTab,
  cartItems: cartItemsProp,
  initialSelectedMeal,
  onAdd,
  onSwap,
  onEditInOrder,
  onClose,
}: AddSwapPanelProps) {
  const [activeCategories, setActiveCategories] = useState<Set<MealCategory>>(() => {
    if (defaultCategories && defaultCategories.length > 0) return new Set(defaultCategories);
    if (!defaultCategory || defaultCategory === "all") return new Set();
    return new Set([defaultCategory as MealCategory]);
  });
  const [selectedFilters, setSelectedFilters] = useState<DietaryTag[]>([]);
  const [activePlanTypes, setActivePlanTypes] = useState<Set<string>>(new Set());

  // New meals to add (not yet in cart)
  const [selected, setSelected] = useState<SelectedEntry[]>(() =>
    initialSelectedMeal ? [{ meal: initialSelectedMeal, qty: 1 }] : []
  );
  // In-order edits: mealId → new desired quantity
  const [inOrderEdits, setInOrderEdits] = useState<Map<string, number>>(new Map());

  const scrollGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialSelectedMeal) return;
    const timer = setTimeout(() => {
      const el = scrollGridRef.current?.querySelector<HTMLElement>(`[data-meal-id="${initialSelectedMeal.id}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    return () => clearTimeout(timer);
  }, [initialSelectedMeal]);

  const [detailMeal, setDetailMeal] = useState<Meal | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { draftItems: storeDraftItems } = useOrderStore();
  const cartItems = cartItemsProp ?? storeDraftItems;

  // ── Filters ──────────────────────────────────────────────────────────
  const toggleFilter = (tag: DietaryTag) => {
    setSelectedFilters((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const isAllMeals = activeCategories.size === 0;

  const toggleCategory = (id: MealCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const togglePlanType = (id: string) => {
    setActivePlanTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const availablePlanTypes = Array.from(new Set(mealCatalog.map((m) => m.planType)));

  const filtered = mealCatalog.filter((meal) => {
    if (meal.id === currentMeal?.id) return false;
    if (!isAllMeals && !activeCategories.has(meal.category)) return false;
    if (selectedFilters.length > 0 && !selectedFilters.every((f) => meal.dietaryTags.includes(f))) return false;
    if (activePlanTypes.size > 0 && !activePlanTypes.has(meal.planType)) return false;
    return true;
  });

  // ── Cart helpers ──────────────────────────────────────────────────────
  const inCartQty = (mealId: string) =>
    cartItems.filter((i) => i.meal.id === mealId).reduce((s, i) => s + i.quantity, 0);

  // ── New-meal selection helpers ────────────────────────────────────────
  const selectedEntry = (mealId: string) => selected.find((e) => e.meal.id === mealId);
  const selectedQty = (mealId: string) => selectedEntry(mealId)?.qty ?? 0;
  const isSelected = (mealId: string) => selectedQty(mealId) > 0;

  const handleToggle = (meal: Meal) => {
    if (mode === "swap") { onSwap(meal); return; }
    const cartQty = inCartQty(meal.id);

    if (cartQty > 0) {
      // Toggle in-order edit mode
      setInOrderEdits((prev) => {
        const next = new Map(prev);
        if (next.has(meal.id)) next.delete(meal.id);
        else next.set(meal.id, cartQty);
        return next;
      });
      return;
    }

    // New meal: select / deselect
    setSelected((prev) => {
      const exists = prev.find((e) => e.meal.id === meal.id);
      if (exists) return prev.filter((e) => e.meal.id !== meal.id);
      return [...prev, { meal, qty: 1 }];
    });
  };

  const changeNewQty = (mealId: string, delta: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelected((prev) =>
      prev
        .map((entry) => entry.meal.id === mealId ? { ...entry, qty: Math.max(0, entry.qty + delta) } : entry)
        .filter((entry) => entry.qty > 0)
    );
  };

  const changeInOrderQty = (mealId: string, delta: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setInOrderEdits((prev) => {
      const next = new Map(prev);
      const current = next.get(mealId) ?? 0;
      const newQty = Math.max(0, current + delta);
      next.set(mealId, newQty);
      return next;
    });
  };

  const totalNewSelected = selected.reduce((s, e) => s + e.qty, 0);
  const hasAnyPendingChange = inOrderEdits.size > 0 || selected.length > 0;
  const hasActiveFilters = selectedFilters.length > 0 || activePlanTypes.size > 0 || !isAllMeals;

  // ── Done / Add ────────────────────────────────────────────────────────
  const handleDone = () => {
    // Apply in-order qty edits immediately (no modal needed — just quantity changes)
    if (inOrderEdits.size > 0 && onEditInOrder) {
      const edits = Array.from(inOrderEdits.entries()).map(([mealId, newQty]) => ({ mealId, newQty }));
      onEditInOrder(edits);
      setInOrderEdits(new Map());
    }
    // New meals: open confirmation modal to choose one-time vs recurring per item
    if (selected.length > 0) {
      setShowConfirmModal(true);
    } else {
      onClose();
    }
  };

  const handleConfirmAdd = (entries: AddMealEntry[]) => {
    onAdd(entries);
    setShowConfirmModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-xl bg-white flex flex-col h-full shadow-2xl">

        {/* Header */}
        <div className="px-5 py-4 border-b border-[#F0EBE0] flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-bold text-[#004945]">
              {mode === "swap" ? `Swap ${currentMeal?.name ?? "Meal"}` : "Add Meals to Your Order"}
            </h2>
            {mode === "swap" && currentMeal && (
              <p className="text-xs text-[#9E9E9E] mt-0.5 flex items-center gap-1">
                Replacing: <span className="font-medium text-[#6B6B6B]">{currentMeal.name}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#004945]">Choose replacement</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#F0EBE0] transition-colors">
            <X className="w-5 h-5 text-[#6B6B6B]" />
          </button>
        </div>

        {/* Plan type filter — primary filter, highlighted at top */}
        <div className="px-5 py-3 border-b border-[#F0EBE0] bg-[#F7F3EC]/60 shrink-0">
          <p className="text-[11px] font-bold text-[#004945] uppercase tracking-wider mb-2">Meal Plan</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {availablePlanTypes.map((pt) => {
              const isActive = activePlanTypes.has(pt);
              return (
                <button
                  key={pt}
                  onClick={() => togglePlanType(pt)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors",
                    isActive
                      ? "bg-[#004945] text-white border-[#004945] shadow-sm"
                      : "border-[#D4C9B8] text-[#4A4A4A] bg-white hover:border-[#004945] hover:text-[#004945]"
                  )}
                >
                  {pt}
                  {isActive && <X className="inline w-3 h-3 ml-1.5" />}
                </button>
              );
            })}
            {activePlanTypes.size > 0 && (
              <button onClick={() => setActivePlanTypes(new Set())} className="shrink-0 text-xs text-red-500 hover:underline self-center">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-5 py-2 border-b border-[#F0EBE0] flex gap-1 overflow-x-auto scrollbar-hide shrink-0">
          <button
            onClick={() => setActiveCategories(new Set())}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              isAllMeals ? "bg-[#004945] text-white" : "bg-[#F0EBE0] text-[#6B6B6B] hover:bg-[#E8E4DC]"
            )}
          >
            See All <span className="ml-1 text-[11px] opacity-70">({mealCatalog.length})</span>
          </button>
          {categories
            .filter(({ id }) => id !== "all")
            .map(({ id, label }) => {
              const count = mealCatalog.filter((m) => m.category === id).length;
              const isActive = activeCategories.has(id as MealCategory);
              return (
                <button
                  key={id}
                  onClick={() => toggleCategory(id as MealCategory)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                    isActive ? "bg-[#004945] text-white" : "bg-[#F0EBE0] text-[#6B6B6B] hover:bg-[#E8E4DC]"
                  )}
                >
                  {label} <span className="ml-1 text-[11px] opacity-70">({count})</span>
                </button>
              );
            })}
        </div>

        {/* Dietary filters */}
        <div className="px-5 py-2 border-b border-[#F0EBE0] flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0">
          <span className="text-xs font-medium text-[#9E9E9E] shrink-0">Filter</span>
          {dietaryFilters.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => toggleFilter(id)}
              className={cn(
                "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                selectedFilters.includes(id)
                  ? "bg-[#004945] text-white border-[#004945]"
                  : "border-[#E8E4DC] text-[#6B6B6B] hover:border-[#B9EA91] hover:text-[#004945]"
              )}
            >
              {label}
              {selectedFilters.includes(id) && <X className="inline w-2.5 h-2.5 ml-1" />}
            </button>
          ))}
          {selectedFilters.length > 0 && (
            <button onClick={() => setSelectedFilters([])} className="shrink-0 text-xs text-red-500 hover:underline">
              Clear all
            </button>
          )}
        </div>

        {/* Meal grid */}
        <div ref={scrollGridRef} className="flex-1 overflow-y-auto px-5 py-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#9E9E9E]">
              <p className="text-sm">No meals match your filters.</p>
              {hasActiveFilters && (
                <button
                  onClick={() => { setActiveCategories(new Set()); setSelectedFilters([]); setActivePlanTypes(new Set()); }}
                  className="mt-2 text-xs text-[#004945] hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 items-start">
              {filtered.map((meal) => {
                const cartQty = inCartQty(meal.id);
                const isEditing = inOrderEdits.has(meal.id);
                const editQty = inOrderEdits.get(meal.id) ?? cartQty;
                const issel = isSelected(meal.id);
                const selQty = selectedQty(meal.id);

                return (
                  <div
                    key={meal.id}
                    data-meal-id={meal.id}
                    className={cn(
                      "rounded-xl overflow-hidden border-2 transition-all",
                      isEditing
                        ? "border-[#004945] ring-2 ring-[#004945]/10"
                        : issel
                        ? "border-[#7ED22A] ring-2 ring-[#7ED22A]/20"
                        : cartQty > 0
                        ? "border-[#004945]/30 hover:border-[#004945]/60"
                        : "border-[#E8E4DC] hover:border-[#B9EA91]"
                    )}
                  >
                    {/* Clickable: image + info */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => handleToggle(meal)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleToggle(meal)}
                      className="w-full text-left flex flex-col cursor-pointer"
                    >
                      {/* Image */}
                      <div className="relative h-28 bg-[#F0EBE0]">
                        <Image
                          src={meal.imageUrl}
                          alt={meal.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        {/* In-order badge (overlay) — shown when NOT editing */}
                        {cartQty > 0 && !isEditing && (
                          <InOrderBadge qty={cartQty} variant="overlay" className="absolute top-1.5 right-1.5" />
                        )}
                        {/* Editing active indicator */}
                        {isEditing && (
                          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-[#004945] text-white rounded-full px-1.5 py-0.5 text-[11px] font-bold shadow">
                            <Check className="w-2.5 h-2.5 shrink-0" />
                            <span>Editing</span>
                          </div>
                        )}
                        {/* Select checkbox for new meals */}
                        {cartQty === 0 && (
                          <div className="absolute top-2 left-2">
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-sm transition-all",
                              issel ? "bg-[#7ED22A] border-[#7ED22A]" : "bg-white/80 border-white/60"
                            )}>
                              {issel && <Check className="w-3 h-3 text-[#004945]" />}
                            </div>
                          </div>
                        )}
                        {/* Plan type badge */}
                        <div className="absolute bottom-1.5 left-1.5">
                          <span className="bg-black/50 text-white text-[11px] font-medium px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                            {meal.planType}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-2.5 flex flex-col">
                        <p className="text-xs font-semibold text-[#1A1A1A] line-clamp-2 leading-tight">
                          {meal.name}
                        </p>
                        <DietaryPills tags={meal.dietaryTags} className="mt-1" onSeeAll={() => setDetailMeal(meal)} />
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs font-bold text-[#004945]">{formatCurrency(meal.price)}</span>
                          <span className="text-[11px] text-[#9E9E9E]">{meal.calories} cal</span>
                        </div>
                      </div>
                    </div>

                    {/* ── IN-ORDER EDIT SECTION ── active when editing an existing item */}
                    {isEditing && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="border-t border-[#004945]/20 bg-[#EAF7D9]/40 px-2.5 py-2"
                      >
                        {/* Top row: label + price */}
                        <div className="flex items-center gap-1 mb-1.5">
                          <Check className="w-2.5 h-2.5 text-[#004945] shrink-0" />
                          <span className="text-[11px] font-semibold text-[#004945] shrink-0">
                            {editQty}× in your order
                          </span>
                          <span className="text-[11px] text-[#9E9E9E] truncate">
                            · {formatCurrency(editQty * meal.price)}
                          </span>
                        </div>
                        {/* Bottom row: stepper full-width */}
                        <div className="flex items-center justify-between bg-white rounded-lg border border-[#004945]/20 px-2 py-1">
                          <button
                            onClick={(e) => changeInOrderQty(meal.id, -1, e)}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#004945]/10 transition-colors"
                          >
                            <Minus className="w-3 h-3 text-[#004945]" />
                          </button>
                          <span className="text-sm font-bold text-[#004945]">{editQty}</span>
                          <button
                            onClick={(e) => changeInOrderQty(meal.id, 1, e)}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#004945]/10 transition-colors"
                          >
                            <Plus className="w-3 h-3 text-[#004945]" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── IN-ORDER PASSIVE STRIP ── shown when in cart but not editing */}
                    {cartQty > 0 && !isEditing && (
                      <InOrderBadge qty={cartQty} variant="strip" />
                    )}

                    {/* ── NEW MEAL QTY STEPPER ── only for new selections */}
                    {issel && mode === "add" && cartQty === 0 && (
                      <div className="flex items-center justify-between px-2.5 py-2 border-t border-[#E8E4DC] bg-white">
                        <span className="text-[11px] text-[#9E9E9E]">Qty</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => changeNewQty(meal.id, -1, e)}
                            className="w-5 h-5 rounded-full border border-[#E8E4DC] flex items-center justify-center hover:bg-[#F0EBE0] transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5 text-[#6B6B6B]" />
                          </button>
                          <span className="text-xs font-semibold text-[#004945] w-4 text-center">{selQty}</span>
                          <button
                            onClick={(e) => changeNewQty(meal.id, 1, e)}
                            className="w-5 h-5 rounded-full border border-[#E8E4DC] flex items-center justify-center hover:bg-[#F0EBE0] transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5 text-[#6B6B6B]" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Detail section — expanded info for newly selected meals */}
                    {issel && cartQty === 0 && (
                      <div className="bg-[#F7F3EC] border-t border-[#E8E4DC] px-3 py-2.5 space-y-2">
                        {meal.description && (
                          <p className="text-[11px] text-[#6B6B6B] leading-relaxed">{meal.description}</p>
                        )}
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { label: "Protein", value: `${meal.protein}g` },
                            { label: "Carbs",   value: `${meal.carbs}g` },
                            { label: "Fat",     value: `${meal.fat}g` },
                          ].map(({ label, value }) => (
                            <div key={label} className="text-center">
                              <p className="font-bold text-sm text-[#004945]">{value}</p>
                              <p className="text-[11px] text-[#9E9E9E]">{label}</p>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setDetailMeal(meal)}
                          className="w-full text-center text-[11px] font-semibold text-[#004945] hover:text-[#7ED22A] transition-colors py-0.5"
                        >
                          View all details →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Bottom action bar ── */}
        {mode === "add" && (
          <div className="px-5 py-4 border-t border-[#F0EBE0] bg-white shrink-0">
            {hasAnyPendingChange && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#6B6B6B]">
                  {inOrderEdits.size > 0 && selected.length === 0 && `${inOrderEdits.size} item${inOrderEdits.size !== 1 ? "s" : ""} updated`}
                  {inOrderEdits.size === 0 && selected.length > 0 && `${totalNewSelected} meal${totalNewSelected !== 1 ? "s" : ""} to add`}
                  {inOrderEdits.size > 0 && selected.length > 0 && `${inOrderEdits.size} updated · ${totalNewSelected} new`}
                </span>
                <button
                  onClick={() => { setSelected([]); setInOrderEdits(new Map()); }}
                  className="text-xs text-[#9E9E9E] hover:text-[#6B6B6B]"
                >
                  Clear
                </button>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => hasAnyPendingChange ? handleDone() : onClose()}
              >
                Back to my order
              </Button>
              <Button
                className="flex-1"
                disabled={!hasAnyPendingChange}
                onClick={handleDone}
              >
                Add meals
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Confirm add items modal (one-time vs recurring per item) ── */}
      {showConfirmModal && (
        <ConfirmAddItemsModal
          items={selected}
          onConfirm={handleConfirmAdd}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      {/* ── Meal Detail Modal ── */}
      {detailMeal && (
        <MealDetailModal
          meal={detailMeal}
          onClose={() => setDetailMeal(null)}
        />
      )}
    </div>
  );
}
