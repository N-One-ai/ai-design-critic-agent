import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "success";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  children?: ReactNode;
}

/* ─────────────────────────────────────────
   Variant styles (using design tokens)
───────────────────────────────────────── */
const VARIANT: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--brand-default)] text-[var(--brand-fg)] hover:bg-[var(--brand-hover)] active:bg-[var(--brand-active)] shadow-1",
  secondary:
    "bg-[var(--bg-surface-2)] text-[var(--fg-default)] border border-[var(--border-default)] hover:bg-[var(--bg-surface-3)] hover:border-[var(--border-strong)]",
  ghost:
    "bg-transparent text-[var(--fg-muted)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--fg-default)]",
  outline:
    "bg-transparent text-[var(--brand-default)] border border-[var(--brand-default)] hover:bg-[var(--brand-subtle)]",
  danger:
    "bg-[var(--danger-default)] text-white hover:bg-[var(--danger-hover)] shadow-1",
  success:
    "bg-[var(--accent-default)] text-white hover:bg-[var(--accent-hover)] shadow-1",
};

const SIZE: Record<ButtonSize, string> = {
  xs: "h-6 px-2 gap-1 text-[11px] font-semibold rounded-[var(--radius-sm)]",
  sm: "h-8 px-3 gap-1.5 text-[12.5px] font-semibold rounded-[var(--radius-md)]",
  md: "h-9 px-4 gap-2 text-[13.5px] font-semibold rounded-[var(--radius-md)]",
  lg: "h-11 px-5 gap-2.5 text-[14.5px] font-semibold rounded-[var(--radius-lg)]",
};

const ICON_SIZE: Record<ButtonSize, number> = { xs: 12, sm: 13, md: 15, lg: 17 };

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    iconPosition = "left",
    fullWidth = false,
    disabled,
    className,
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  const iconSz = ICON_SIZE[size];

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center select-none",
        "transition-[background-color,color,border-color,box-shadow] duration-fast ease-ease",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-default)] focus-visible:ring-offset-1",
        "disabled:opacity-50 disabled:pointer-events-none",
        VARIANT[variant],
        SIZE[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 size={iconSz} className="animate-spin shrink-0" />
      ) : (
        icon && iconPosition === "left" && (
          <span className="shrink-0">{icon}</span>
        )
      )}
      {children && <span className="truncate">{children}</span>}
      {!loading && icon && iconPosition === "right" && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
});

/* ─────────────────────────────────────────
   Icon Button (square, icon-only)
───────────────────────────────────────── */
const ICON_BTN_SIZE: Record<ButtonSize, string> = {
  xs: "w-6 h-6 rounded-[var(--radius-sm)]",
  sm: "w-8 h-8 rounded-[var(--radius-md)]",
  md: "w-9 h-9 rounded-[var(--radius-md)]",
  lg: "w-11 h-11 rounded-[var(--radius-lg)]",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  label: string;
  children: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { variant = "ghost", size = "md", loading = false, label, disabled, className, children, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center justify-center shrink-0",
          "transition-[background-color,color,border-color] duration-fast ease-ease",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-default)] focus-visible:ring-offset-1",
          "disabled:opacity-50 disabled:pointer-events-none",
          VARIANT[variant],
          ICON_BTN_SIZE[size],
          className
        )}
        {...props}
      >
        {loading ? <Loader2 size={ICON_SIZE[size]} className="animate-spin" /> : children}
      </button>
    );
  }
);
