import { type DietaryTag } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface DietaryPillsProps {
  tags: DietaryTag[];
  className?: string;
  /** compact: emoji only, no label — for tight spaces like meal cards */
  compact?: boolean;
}

const dietaryConfig: Record<DietaryTag, {
  emoji: string;
  label: string;
  spicy?: boolean;
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
    <div className={cn("flex flex-wrap gap-x-2.5 gap-y-1", className)}>
      {tags.map((tag) => {
        const cfg = dietaryConfig[tag];
        if (!cfg) return null;

        return (
          <div key={tag} className="flex items-center gap-1">
            {/* Emoji icon — no circle border */}
            <span className={cn("select-none leading-none", compact ? "text-[10px]" : "text-xs")}>
              {cfg.emoji}
            </span>

            {/* Label — hidden in compact mode */}
            {!compact && (
              <span className={cn(
                "text-[10px] leading-none",
                cfg.spicy ? "text-red-400" : "text-[#9E9E9E]"
              )}>
                {cfg.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
