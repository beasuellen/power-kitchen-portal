import { type DietaryTag } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface DietaryPillsProps {
  tags: DietaryTag[];
  className?: string;
  /** compact: icon-only circles (no label) — for tight spaces like meal cards */
  compact?: boolean;
}

const dietaryConfig: Record<DietaryTag, {
  emoji: string;
  label: string;
  spicy?: boolean;        // red treatment, no circle border
}> = {
  DF:  { emoji: "🥛",  label: "Dairy free" },
  GF:  { emoji: "🌾",  label: "Gluten free" },
  NF:  { emoji: "🥜",  label: "Nut free" },
  SF:  { emoji: "🫘",  label: "Soy free" },
  H:   { emoji: "☪️",  label: "Halal" },
  V:   { emoji: "🌱",  label: "Vegan" },
  SpF: { emoji: "🌶️", label: "Spicy Meal", spicy: true },
};

export function DietaryPills({ tags, className, compact = false }: DietaryPillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-x-3 gap-y-1.5", className)}>
      {tags.map((tag) => {
        const cfg = dietaryConfig[tag];
        if (!cfg) return null;

        return (
          <div key={tag} className="flex items-center gap-1.5">
            {/* Icon circle */}
            <div
              className={cn(
                "flex items-center justify-center rounded-full shrink-0 select-none",
                compact ? "w-5 h-5 text-[10px]" : "w-7 h-7 text-sm",
                cfg.spicy
                  ? "bg-red-50 border border-red-200"
                  : "bg-white border-2 border-[#7ED22A]"
              )}
            >
              {cfg.emoji}
            </div>

            {/* Label — hidden in compact mode */}
            {!compact && (
              <span
                className={cn(
                  "text-xs font-medium leading-none",
                  cfg.spicy ? "text-red-500" : "text-[#3d3d3d]"
                )}
              >
                {cfg.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
