import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantClasses = {
  primary:     "bg-[#004945] text-white hover:bg-[#003835] active:bg-[#002e2b]",
  secondary:   "bg-[#F0EBE0] text-[#004945] hover:bg-[#E8E0D0] active:bg-[#DDD5C5]",
  ghost:       "text-[#004945] hover:bg-[#EAF7D9] active:bg-[#D5F0B8]",
  destructive: "border border-red-200 text-red-600 hover:bg-red-50 active:bg-red-100",
  outline:     "border border-[#004945] text-[#004945] hover:bg-[#EAF7D9] active:bg-[#D5F0B8]",
};

const sizeClasses = {
  sm:  "px-3 py-1.5 text-sm rounded-xl",
  md:  "px-4 py-2 text-sm rounded-xl",
  lg:  "px-6 py-3 text-base rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ED22A] focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";
