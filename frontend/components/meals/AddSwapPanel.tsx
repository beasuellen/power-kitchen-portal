"use client";

import { useState } from "react";
import { mockMeals, type Meal, type MealCategory, type DietaryTag } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DietaryPills } from "@/components/ui/DietaryPills";
import Image from "next/image";
import { X, Check, Search, ChevronRight, Minus, Plus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrderStore } from "@/lib/useOrderStore";

interface AddSwapPanelProps {
  mode: "add" | "swap";
  currentMeal?: Meal;
  defaultCategory?: MealCategory | "all";
  defaultCategories?: MealCategory[];
  hideMealsTab?: boolean;
  onAdd: (meals: Meal[]) => void;
  onSwap: (meal: Meal) => void;
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

export function AddSwapPanel({ mode, currentMeal, defaultCategory, defaultCategories, hideMealsTab, onAdd, onSwap, onClose }: AddSwapPanelProps) {
  const [activeCategories, setActiveCategories] = useState<Set<MealCategory>>(() => {
    if (defaultCategories && defaultCategories.length > 0) return new Set(defaultCategories);
    if (!defaultCategory || defaultCategory === "all") return new Set();
    return new Set([defaultCategory as MealCategory]);
  });
  const [selectedFilters, setSelectedFilters] = useState<DietaryTag[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<SelectedEntry[]>([]);
  const [detailMeal, setDetailMeal] = useState<Meal | null>(null);

  const { draftItems } = useOrderStore();

  const toggleFilter = (tag: DietaryTag) => {
    setSelectedFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const isAllMeals = activeCategories.size === 0;

  const toggleCategory = (id: MealCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const filtered = mockMeals.filter((meal) => {
    if (meal.id === currentMeal?.id) return false;
    if (!isAllMeals && !activeCategories.has(meal.category)) return false;
    if (selectedFilters.length > 0 && !selectedFilters.every((f) => meal.dietaryTags.includes(f))) return false;
    if (search && !meal.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const inCartQty = (mealId: string) =>
    draftItems.filter((i) => i.meal.id === mealId).reduce((s, i) => s + i.quantity, 0);

  const selectedEntry = (mealId: string) => selected.find((e) => e.meal.id === mealId);
  const selectedQty = (mealId: string) => selectedEntry(mealId)?.qty ?? 0;
  const isSelected = (mealId: string) => selectedQty(mealId) > 0;

  const handleToggle = (meal: Meal) => {
    if (mode === "swap") { onSwap(meal); return; }
    setSelected((prev) => {
      const exists = prev.find((e) => e.meal.id === meal.id);
      if (exists) return prev.filter((e) => e.meal.id !== meal.id);
      return [...prev, { meal, qty: 1 }];
    });
  };

  const changeQty = (mealId: string, delta: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelected((prev) =>
      prev
        .map((entry) =>
          entry.meal.id === mealId ? { ...entry, qty: Math.max(0, entry.qty + delta) } : entry
        )
        .filter((entry) => entry.qty > 0)
    );
  };

  const totalSelected = selected.reduce((s, e) => s + e.qty, 0);

  const handleAdd = () => {
    const meals: Meal[] = selected.flatMap((e) => Array(e.qty).fill(e.meal));
    onAdd(meals);
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

        {/* Search */}
        <div className="px-5 py-3 border-b border-[#F0EBE0] shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9E9E9E]" />
            <input
              type="text"
              placeholder="Search meals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E8E4DC] text-sm focus:outline-none focus:ring-2 focus:ring-[#7ED22A] focus:border-transparent bg-[#FDFBF7]"
            />
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
            See All <span className="ml-1 text-[10px] opacity-70">({mockMeals.length})</span>
          </button>
          {categories
            .filter(({ id }) => id !== "all")
            .map(({ id, label }) => {
              const count = mockMeals.filter((m) => m.category === id).length;
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
                  {label} <span className="ml-1 text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
        </div>

        {/* Dietary filters */}
        <div className="px-5 py-2 border-b border-[#F0EBE0] flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0">
          <span className="text-xs font-medium text-[#9E9E9E] shrink-0">Filtro</span>
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
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-[#9E9E9E]">
              <p className="text-sm">No meals match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 items-start">
              {filtered.map((meal) => {
                const cartQty = inCartQty(meal.id);
                const selQty = selectedQty(meal.id);
                const issel = isSelected(meal.id);

                return (
                  <div
                    key={meal.id}
                    className={cn(
                      "rounded-xl overflow-hidden border-2 transition-all",
                      issel
                        ? "border-[#7ED22A] ring-2 ring-[#7ED22A]/20"
                        : "border-[#E8E4DC] hover:border-[#B9EA91]"
                    )}
                  >
                    {/* Clickable: image + info */}
                    <button
                      onClick={() => handleToggle(meal)}
                      className="w-full text-left flex flex-col"
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
                        {cartQty > 0 && (
                          <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-[#004945] text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold shadow">
                            <span>✓</span>
                            <span>{cartQty} in order</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-sm transition-all",
                            issel ? "bg-[#7ED22A] border-[#7ED22A]" : "bg-white/80 border-white/60"
                          )}>
                            {issel && <Check className="w-3 h-3 text-[#004945]" />}
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-2.5 flex flex-col">
                        <p className="text-xs font-semibold text-[#1A1A1A] line-clamp-2 leading-tight">
                          {meal.name}
                        </p>
                        <DietaryPills tags={meal.dietaryTags} className="mt-1" />
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs font-bold text-[#004945]">{formatCurrency(meal.price)}</span>
                          <span className="text-[10px] text-[#9E9E9E]">{meal.calories} cal</span>
                        </div>
                      </div>
                    </button>

                    {/* Qty stepper — inside card, below info, only when selected */}
                    {issel && mode === "add" && (
                      <div className="flex items-center justify-between px-2.5 py-2 border-t border-[#E8E4DC] bg-white">
                        <span className="text-[10px] text-[#9E9E9E]">Qty</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => changeQty(meal.id, -1, e)}
                            className="w-5 h-5 rounded-full border border-[#E8E4DC] flex items-center justify-center hover:bg-[#F0EBE0] transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5 text-[#6B6B6B]" />
                          </button>
                          <span className="text-xs font-semibold text-[#004945] w-4 text-center">{selQty}</span>
                          <button
                            onClick={(e) => changeQty(meal.id, 1, e)}
                            className="w-5 h-5 rounded-full border border-[#E8E4DC] flex items-center justify-center hover:bg-[#F0EBE0] transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5 text-[#6B6B6B]" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Detail section — beige, seamless continuation when selected */}
                    {issel && (
                      <div className="bg-[#F7F3EC] border-t border-[#E8E4DC] px-3 py-2.5 space-y-2">
                        {meal.description && (
                          <p className="text-[10px] text-[#6B6B6B] leading-relaxed">{meal.description}</p>
                        )}
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { label: "Protein", value: `${meal.protein}g` },
                            { label: "Carbs",   value: `${meal.carbs}g` },
                            { label: "Fat",     value: `${meal.fat}g` },
                          ].map(({ label, value }) => (
                            <div key={label} className="text-center">
                              <p className="font-bold text-sm text-[#004945]">{value}</p>
                              <p className="text-[10px] text-[#9E9E9E]">{label}</p>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setDetailMeal(meal)}
                          className="w-full text-center text-[10px] font-semibold text-[#004945] hover:text-[#7ED22A] transition-colors py-0.5"
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

        {/* Bottom action bar */}
        {mode === "add" && (
          <div className="px-5 py-4 border-t border-[#F0EBE0] bg-white shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#6B6B6B]">
                {totalSelected > 0
                  ? `${totalSelected} meal${totalSelected !== 1 ? "s" : ""} to add`
                  : "Select meals to add"}
              </span>
              {selected.length > 0 && (
                <button onClick={() => setSelected([])} className="text-xs text-[#9E9E9E] hover:text-[#6B6B6B]">
                  Clear
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={onClose}>
                Back to Order
              </Button>
              <Button className="flex-1" disabled={totalSelected === 0} onClick={handleAdd}>
                Add {totalSelected > 0 ? `${totalSelected} ` : ""}Meal{totalSelected !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Meal Detail Modal ── */}
      {detailMeal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div
            className="bg-white rounded-2xl w-full shadow-2xl overflow-hidden flex"
            style={{ maxWidth: 960, height: "88vh" }}
          >
            {/* Left: image — 50% */}
            <div className="relative w-1/2 shrink-0 bg-[#1A1A1A]">
              <Image
                src={detailMeal.imageUrl}
                alt={detailMeal.name}
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>

            {/* Right: scrollable content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="px-5 py-4 border-b border-[#F0EBE0] flex items-start justify-between gap-3 shrink-0">
                <div>
                  <h3 className="font-bold text-[#004945] text-base leading-snug">{detailMeal.name}</h3>
                  {detailMeal.description && (
                    <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{detailMeal.description}</p>
                  )}
                  {detailMeal.spiceLevel && detailMeal.spiceLevel.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {detailMeal.spiceLevel.map((s) => (
                        <span key={s} className="text-[10px] font-semibold bg-red-50 border border-red-200 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          🌶 {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setDetailMeal(null)}
                  className="p-1.5 rounded-lg hover:bg-[#F0EBE0] transition-colors shrink-0"
                >
                  <X className="w-4 h-4 text-[#6B6B6B]" />
                </button>
              </div>

              {/* Scrollable info */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

                {/* Dietary tags */}
                <DietaryPills tags={detailMeal.dietaryTags} />

                {/* Ingredients */}
                {detailMeal.ingredients && detailMeal.ingredients.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-[#004945] mb-1.5">Ingredients</p>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">
                      {detailMeal.ingredients.join(", ")}.
                    </p>
                  </div>
                )}

                {/* Allergens */}
                {detailMeal.allergens && detailMeal.allergens.length > 0 && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    <Info className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <p className="text-xs text-red-600">
                      <strong>Allergies:</strong> {detailMeal.allergens.join(", ")}.
                    </p>
                  </div>
                )}

                {/* Macros table */}
                <div className="rounded-xl overflow-hidden border border-[#E8E4DC]">
                  <div className="bg-[#7ED22A] px-4 py-2.5 text-center">
                    <p className="text-sm font-bold text-[#004945]">Macros Information</p>
                  </div>
                  <div className="divide-y divide-[#F0EBE0]">
                    {[
                      { label: "Calories (kcal)",          value: detailMeal.calories },
                      { label: "Protein (g)",               value: detailMeal.protein },
                      { label: "Carbohydrates (g)",         value: detailMeal.carbs },
                      { label: "Total Fats (g)",            value: detailMeal.fat },
                      { label: "Saturated Fats (g)",        value: detailMeal.saturatedFat },
                      { label: "Polyunsaturated fats (g)",  value: detailMeal.polyUnsaturatedFat },
                      { label: "Fibre (g)",                 value: detailMeal.fiber },
                      { label: "Sugar (g)",                 value: detailMeal.sugar },
                      { label: "Cholesterol (mg)",          value: detailMeal.cholesterol },
                      { label: "Sodium (mg)",               value: detailMeal.sodium },
                      { label: "Net Carbs",                 value: detailMeal.netCarbs },
                    ]
                      .filter(({ value }) => value !== undefined)
                      .map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center px-4 py-2.5">
                          <span className="text-xs text-[#6B6B6B]">{label}</span>
                          <span className="text-xs font-semibold text-[#1A1A1A]">{value}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Prep methods */}
                {detailMeal.prepMethods && detailMeal.prepMethods.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-[#004945] mb-3">How to prepare</p>
                    <div className="grid grid-cols-3 gap-3">
                      {detailMeal.prepMethods.map(({ method, instructions }) => (
                        <div key={method}>
                          <p className="text-xs font-bold text-[#7ED22A]">{method}</p>
                          <p className="text-[10px] text-[#6B6B6B] mt-0.5 leading-snug">{instructions}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom: buy + qty — integrated with panel selection state */}
              {mode === "add" && (() => {
                const selQty = selectedQty(detailMeal.id);
                const issel = isSelected(detailMeal.id);
                return (
                  <div className="border-t border-[#F0EBE0] px-5 py-4 flex items-center gap-3 shrink-0 bg-white">
                    {issel ? (
                      <>
                        <button
                          onClick={() => handleToggle(detailMeal)}
                          className="flex-1 bg-[#004945] text-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold"
                        >
                          <Check className="w-4 h-4" />
                          {selQty} Added · {formatCurrency(detailMeal.price * selQty)}
                        </button>
                        <div className="flex items-center gap-2 border border-[#E8E4DC] rounded-xl px-3 py-2 shrink-0">
                          <button onClick={() => changeQty(detailMeal.id, -1)}>
                            <Minus className="w-4 h-4 text-[#6B6B6B]" />
                          </button>
                          <span className="text-sm font-bold text-[#004945] w-4 text-center">{selQty}</span>
                          <button onClick={() => changeQty(detailMeal.id, 1)}>
                            <Plus className="w-4 h-4 text-[#6B6B6B]" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => handleToggle(detailMeal)}
                        className="flex-1 bg-[#004945] text-white rounded-xl py-3 text-sm font-semibold"
                      >
                        Add to Order · {formatCurrency(detailMeal.price)}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
