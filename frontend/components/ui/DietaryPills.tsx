import { dietaryTagColors, type DietaryTag } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface DietaryPillsProps {
  tags: DietaryTag[];
  className?: string;
}

const fullLabels: Record<DietaryTag, string> = {
  GF: "Gluten Free",
  DF: "Dairy Free",
  NF: "Nut Free",
  SF: "Soy Free",
  H: "Halal",
  SpF: "Spice Free",
  V: "Vegan",
};

export function DietaryPills({ tags, className }: DietaryPillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {tags.map((tag) => {
        const style = dietaryTagColors[tag];
        return (
          <span
            key={tag}
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold",
              style.bg,
              style.text
            )}
            title={fullLabels[tag]}
          >
            {style.label}
          </span>
        );
      })}
    </div>
  );
}
