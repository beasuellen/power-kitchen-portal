"use client";

import { type DietaryTag } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { DietaryIcon } from "@/components/ui/DietaryIcon";

interface DietaryPillsProps {
  tags: DietaryTag[];
  className?: string;
  /**
   * "row"  (default) — single unwrapped row: first `maxVisible` pills + "See all" label.
   *                     Use this on all meal cards everywhere.
   * "full"            — all pills, flex-wrap. Use only inside MealDetailModal.
   */
  variant?: "full" | "row";
  /** Only applies to "row" variant. How many pills to show before "See all". Default: 2 */
  maxVisible?: number;
  /** Called when user clicks "See all". Stops propagation automatically. */
  onSeeAll?: () => void;
}

const dietaryConfig: Record<DietaryTag, { label: string }> = {
  DF:  { label: "Dairy free"  },
  GF:  { label: "Gluten free" },
  NF:  { label: "Nut free"   },
  SF:  { label: "Soy free"   },
  H:   { label: "Halal"      },
  V:   { label: "Vegan"      },
  SpF: { label: "Spice free" },
};

function Pill({ tag }: { tag: DietaryTag }) {
  const cfg = dietaryConfig[tag];
  if (!cfg) return null;
  return (
    <div className="inline-flex items-center gap-1 bg-white border border-[#E8E4DC] rounded-full px-2 py-0.5 shrink-0">
      <DietaryIcon tag={tag} size={12} />
      <span className="text-[11px] font-medium text-[#6B6B6B] leading-none whitespace-nowrap">
        {cfg.label}
      </span>
    </div>
  );
}

export function DietaryPills({
  tags,
  className,
  variant = "row",
  maxVisible = 2,
  onSeeAll,
}: DietaryPillsProps) {
  if (!tags?.length) return null;

  if (variant === "full") {
    return (
      <div className={cn("flex flex-wrap gap-x-2 gap-y-1.5", className)}>
        {tags.map((tag) => {
          const cfg = dietaryConfig[tag];
          if (!cfg) return null;
          return (
            <div
              key={tag}
              className="inline-flex items-center gap-1.5 bg-white border border-[#E8E4DC] rounded-full px-2.5 py-1"
            >
              <DietaryIcon tag={tag} size={14} />
              <span className="text-[11px] font-medium text-[#6B6B6B] leading-none">
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  const visible = tags.slice(0, maxVisible);
  const hiddenCount = tags.length - visible.length;

  return (
    <div className={cn("flex items-center gap-1.5 flex-nowrap overflow-hidden", className)}>
      {visible.map((tag) => (
        <Pill key={tag} tag={tag} />
      ))}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSeeAll?.(); }}
          className="text-[11px] text-[#9E9E9E] font-medium whitespace-nowrap shrink-0 hover:text-[#004945] transition-colors"
        >
          See all
        </button>
      )}
    </div>
  );
}
