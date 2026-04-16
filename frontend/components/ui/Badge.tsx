import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "gray" | "blue" | "red" | "yellow" | "purple" | "orange";
  size?: "sm" | "md";
  className?: string;
}

const variantClasses = {
  green: "bg-green-100 text-green-800",
  gray: "bg-gray-100 text-gray-600",
  blue: "bg-blue-100 text-blue-800",
  red: "bg-red-100 text-red-700",
  yellow: "bg-yellow-100 text-yellow-800",
  purple: "bg-purple-100 text-purple-800",
  orange: "bg-orange-100 text-orange-800",
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
