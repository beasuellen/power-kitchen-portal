import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "gray" | "blue" | "red" | "yellow" | "purple" | "orange";
  size?: "sm" | "md";
  className?: string;
}

const variantClasses = {
  green:  "bg-[#EAF7D9] text-[#004945] border border-[#B9EA91]",
  gray:   "bg-[#F0EBE0] text-[#6B6B6B] border border-[#E0D9CE]",
  blue:   "bg-blue-50 text-blue-700 border border-blue-200",
  red:    "bg-red-50 text-red-700 border border-red-200",
  yellow: "bg-yellow-50 text-yellow-800 border border-yellow-200",
  purple: "bg-purple-50 text-purple-800 border border-purple-200",
  orange: "bg-orange-50 text-orange-800 border border-orange-200",
};

export function Badge({ children, variant = "gray", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
