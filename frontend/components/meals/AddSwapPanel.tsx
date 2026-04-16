"use client";

import { useState } from "react";
import { mockMeals, type Meal, type MealCategory, type DietaryTag } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DietaryPills } from "@/components/ui/DietaryPills";
import Image from "next/image";
import { X, Check, Search, SlidersHorizontal, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddSwapPanelProps {
  mode: "add" | "swap";
  currentMeal?: Meal;
  onAdd: (meals: Meal[]) => void;
  onSwap: (meal: Meal) => void;
  onClose: () => void;
}

const categories: { id: MealCategory | "all"; label: string }[] = [
  { id: "all", label: "All Meals" },
  { id: "meals", label: "Meals" },
  { id: "breakfast", label: "Breakfast" },
  { id: "shakes", label: "Shakes" },
  { id: "snacks", label: "Snacks" },
];

const dietaryFilters: { id: DietaryTag; label: string }[] = [
  { id: "GF", label: "Gluten Free" },
  { id: "DF", label: "Dairy Free" },
  { id: "H", label: "Halal" },
  { id: "NF", label: "Nut Free" },
  { id: "SF", label: "Soy Free" },
  { id: "V", label: "Vegan" },
];

export function AddSwapPanel({ mode, currentMeal, onAdd, onSwap, onClose }: AddSwapPanelProps) {
  const [category, setCategory] = useState<MealCategory | "all">("all");
  const [selectedFilters, setSelectedFilters] = useState<DietaryTag[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMeals, setSelectedMeals] = useState<Meal[]>([]);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const toggleFilter = (tag: DietaryTag) => {
    setSelectedFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filtered = mockMeals.filter((meal) => {
    if (meal.id === currentMeal?.id) return false;
    if (category !== "all" && meal.category !== category) return false;
    if (selectedFilters.length > 0 && !selectedFilters.every((f) => meal.dietaryTags.includes(f))) return false;
    if (search && !meal.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (meal: Meal) => {
    if (mode === "swap") {
      onSwap(meal);
      return;
    }
    setSelectedMeals((prev) =>
      prev.find((m) => m.id === meal.id)
        ? prev.filter((m) => m.id !== meal.id)
        : [...prev, meal]
    );
  };

  const isSelected = (meal: Meal) => selectedMeals.some((m) => m.id === meal.id);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-xl bg-white flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">
              {mode === "swap" ? `Swap ${currentMeal?.name ?? "Meal"}` : "Add Meals to Your Order"}
            </h2>
            {mode === "swap" && currentMeal && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                Replacing: <span className="font-medium text-gray-700">{currentMeal.name}</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#2D6A4F]">Choose replacement</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search meals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-5 py-2 border-b border-gray-100 flex gap-1 overflow-x-auto scrollbar-hide">
          {categories.map(({ id, label }) => {
            const count = id === "all" ? mockMeals.length : mockMeals.filter((m) => m.category === id).length;
            return (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  category === id
                    ? "bg-[#2D6A4F] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {label}
                <span className="ml-1 text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Dietary filters */}
        <div className="px-5 py-2 border-b border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          {dietaryFilters.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => toggleFilter(id)}
              className={cn(
                "shrink-0 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                selectedFilters.includes(id)
                  ? "bg-[#2D6A4F] text-white border-[#2D6A4F]"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {label}
              {selectedFilters.includes(id) && <X className="inline w-2.5 h-2.5 ml-1" />}
            </button>
          ))}
          {selectedFilters.length > 0 && (
            <button
              onClick={() => setSelectedFilters([])}
              className="shrink-0 text-xs text-red-500 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Meal grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No meals match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((meal) => {
                const selected = isSelected(meal);
                return (
                  <div key={meal.id} className="flex flex-col">
                    <button
                      onClick={() => toggleSelect(meal)}
                      className={cn(
                        "relative rounded-xl overflow-hidden border-2 transition-all text-left",
                        selected
                          ? "border-[#2D6A4F] ring-2 ring-[#2D6A4F]/20"
                          : "border-gray-100 hover:border-gray-300"
                      )}
                    >
                      {/* Image */}
                      <div className="relative h-28 bg-gray-100">
                        <Image
                          src={meal.imageUrl}
                          alt={meal.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                        {meal.isNew && (
                          <div className="absolute top-1.5 left-1.5">
                            <Badge variant="green" size="sm">New</Badge>
                          </div>
                        )}
                        {selected && (
                          <div className="absolute inset-0 bg-[#2D6A4F]/20 flex items-center justify-center">
                            <div className="w-8 h-8 bg-[#2D6A4F] rounded-full flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight">
                          {meal.name}
                        </p>
                        <Badge variant="gray" size="sm" className="mt-1 text-[10px]">
                          {meal.planType}
                        </Badge>
                        <DietaryPills tags={meal.dietaryTags} className="mt-1" />
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs font-bold text-gray-900">{formatCurrency(meal.price)}</span>
                          <span className="text-[10px] text-gray-400">{meal.calories} cal</span>
                        </div>
                      </div>
                    </button>

                    {/* Expand for nutrition */}
                    <button
                      onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
                      className="text-[10px] text-gray-400 hover:text-[#2D6A4F] transition-colors mt-0.5 text-center"
                    >
                      {expandedMeal === meal.id ? "Hide details ▲" : "View details ▼"}
                    </button>
                    {expandedMeal === meal.id && (
                      <div className="bg-gray-50 rounded-lg p-2.5 mt-1 text-xs text-gray-600 space-y-1">
                        <p className="text-gray-700">{meal.description}</p>
                        <div className="grid grid-cols-3 gap-1 pt-1">
                          {[
                            { label: "Protein", value: `${meal.protein}g` },
                            { label: "Carbs", value: `${meal.carbs}g` },
                            { label: "Fat", value: `${meal.fat}g` },
                          ].map(({ label, value }) => (
                            <div key={label} className="text-center">
                              <p className="font-semibold text-gray-900">{value}</p>
                              <p className="text-[10px] text-gray-400">{label}</p>
                            </div>
                          ))}
                        </div>
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
          <div className="px-5 py-4 border-t border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">
                {selectedMeals.length > 0
                  ? `${selectedMeals.length} item${selectedMeals.length !== 1 ? "s" : ""} selected`
                  : "Select meals to add"}
              </span>
              {selectedMeals.length > 0 && (
                <button
                  onClick={() => setSelectedMeals([])}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={onClose}>
                Back to Order
              </Button>
              <Button
                className="flex-1"
                disabled={selectedMeals.length === 0}
                onClick={() => onAdd(selectedMeals)}
              >
                Add {selectedMeals.length > 0 ? `${selectedMeals.length} ` : ""}Meal{selectedMeals.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
