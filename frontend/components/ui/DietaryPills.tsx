import { dietaryTagColors, type DietaryTag } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface DietaryPillsProps {
  tags: DietaryTag[];
  className?: string;
}

const fullLabels: Record<DietaryTag, string> = {
  GF: "Gluten Free", DF: "Dairy Free", NF: "Nut Free",
  SF: "Soy Free", H: "Halal", SpF: "Spice Free", V: "Vegan",
};

export function DietaryPills({ tags, className }: DietaryPillsProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {tags.map((tag) => {
        const style = dietaryTagColors[tag];
        return (
          <span
            key={tag}
            title={fullLabels[tag]}
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold",
              style.bg, style.text
            )}
          >
            {style.label}
          </span>
        );
      })}
    </div>
  );
}
