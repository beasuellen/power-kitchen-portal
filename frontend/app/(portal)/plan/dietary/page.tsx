"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const restrictions = [
  { id: "dairy_free", label: "Dairy Free", description: "Excludes all dairy-containing meals from your selections" },
  { id: "gluten_free", label: "Gluten Free", description: "Excludes meals containing wheat, barley, rye, and related grains" },
  { id: "halal", label: "Halal", description: "Only meals prepared according to Islamic dietary laws" },
  { id: "nut_free", label: "Nut Free", description: "Excludes meals containing tree nuts and peanuts" },
  { id: "soy_free", label: "Soy Free", description: "Excludes meals containing soy or soy-derived ingredients" },
  { id: "spice_free", label: "Spice Free", description: "Mild preparations only — no hot peppers or spicy seasonings" },
];

export default function DietaryPage() {
  const [active, setActive] = useState<string[]>(["dairy_free", "gluten_free"]);
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const toggle = (id: string) => {
    setActive((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/plan" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dietary Restrictions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Active restrictions automatically filter your meal recommendations
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Active Restrictions</h2>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          {restrictions.map((r) => {
            const isActive = active.includes(r.id);
            return (
              <div
                key={r.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  isActive ? "border-[#2D6A4F] bg-[#D8F3DC]/40" : "border-gray-100 bg-gray-50"
                )}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className={cn("font-medium text-sm", isActive ? "text-[#2D6A4F]" : "text-gray-700")}>
                    {r.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                </div>
                <button
                  onClick={() => toggle(r.id)}
                  role="switch"
                  aria-checked={isActive}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                    isActive ? "bg-[#2D6A4F]" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
                      isActive ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            );
          })}
        </CardBody>
      </Card>

      {active.length > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Your active restrictions apply to meal recommendations. Meals already in your orders are not affected.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex-1"
        >
          {saved ? "Saved!" : "Save Preferences"}
        </Button>
        <Link href="/plan">
          <Button variant="secondary">Cancel</Button>
        </Link>
      </div>
    </div>
  );
}
