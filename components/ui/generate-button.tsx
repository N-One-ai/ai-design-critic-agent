import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type GenerateButtonVariant = "default" | "gradient" | "accent";

export interface GenerateButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: GenerateButtonVariant;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children?: ReactNode;
}

const VARIANT_CLASSES: Record<GenerateButtonVariant, string> = {
  default:
    "bg-[var(--brand-default)] text-white hover:bg-[var(--brand-hover)] active:bg-[var(--brand-active)]",
  gradient:
    "text-white",
  accent:
    "bg-[var(--accent-default)] text-white hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)]",
};

const SIZE_CLASSES: Record<"sm" | "md" | "lg", { btn: string; iconSz: number }> = {
  sm: { btn: "h-9 px-4 gap-2 text-[13px] rounded-[var(--radius-md)]",   iconSz: 14 },
  md: { btn: "h-11 px-5 gap-2.5 text-[14px] rounded-[var(--radius-lg)]", iconSz: 16 },
  lg: { btn: "h-13 px-6 gap-3 text-[15px] rounded-[var(--radius-xl)]",  iconSz: 18 },
};

export const GenerateButton = forwardRef<HTMLButtonElement, GenerateButtonProps>(
  function GenerateButton(
    {
      loading = false,
      variant = "default",
      icon,
      size = "md",
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) {
    const { btn, iconSz } = SIZE_CLASSES[size];
    const isGradient = variant === "gradient";

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center font-semibold",
          "transition-all duration-fast ease-ease",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-default)] focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          "overflow-hidden shadow-2",
          VARIANT_CLASSES[variant],
          btn,
          fullWidth && "w-full",
          className
        )}
        style={
          isGradient
            ? {
                background:
                  "linear-gradient(135deg, var(--brand-default) 0%, #3b5bdb 50%, var(--accent-default) 100%)",
              }
            : undefined
        }
        {...props}
      >
        {/* shimmer on hover */}
        {!loading && (
          <span
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-normal pointer-events-none"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
              backgroundSize: "200% 100%",
            }}
          />
        )}

        {loading ? (
          <Loader2 size={iconSz} className="animate-spin shrink-0" />
        ) : (
          <span className="shrink-0">
            {icon ?? <Sparkles size={iconSz} strokeWidth={2} />}
          </span>
        )}

        <span className="truncate">
          {loading ? "Đang xử lý..." : (children ?? "Tạo ngay")}
        </span>
      </button>
    );
  }
);
