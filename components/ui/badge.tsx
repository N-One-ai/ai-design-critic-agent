import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────
   Badge
───────────────────────────────────────── */
export type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const BADGE_VARIANT: Record<BadgeVariant, string> = {
  default: "bg-[var(--bg-surface-2)] text-[var(--fg-muted)] border border-[var(--border-default)]",
  primary: "bg-[var(--brand-subtle)] text-[var(--brand-default)] border border-[var(--brand-subtle)]",
  success: "bg-[var(--success-subtle)] text-[var(--success-default)] border border-[var(--success-subtle)]",
  warning: "bg-[var(--warning-subtle)] text-[var(--warning-default)] border border-[var(--warning-subtle)]",
  danger:  "bg-[var(--danger-subtle)] text-[var(--danger-default)] border border-[var(--danger-subtle)]",
  info:    "bg-[var(--info-subtle)] text-[var(--info-default)] border border-[var(--info-subtle)]",
  accent:  "bg-[var(--accent-subtle)] text-[var(--accent-default)] border border-[var(--accent-subtle)]",
};

const BADGE_SIZE: Record<BadgeSize, string> = {
  sm: "text-[10px] px-1.5 py-px gap-1",
  md: "text-[11.5px] px-2 py-0.5 gap-1.5",
};

const DOT_VARIANT: Record<BadgeVariant, string> = {
  default: "bg-[var(--fg-muted)]",
  primary: "bg-[var(--brand-default)]",
  success: "bg-[var(--success-default)]",
  warning: "bg-[var(--warning-default)]",
  danger:  "bg-[var(--danger-default)]",
  info:    "bg-[var(--info-default)]",
  accent:  "bg-[var(--accent-default)]",
};

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-full)] font-semibold leading-none",
        "whitespace-nowrap shrink-0",
        BADGE_VARIANT[variant],
        BADGE_SIZE[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "inline-block rounded-full shrink-0",
            size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5",
            DOT_VARIANT[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────
   Tag (removable label)
───────────────────────────────────────── */
import { X } from "lucide-react";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  onRemove?: () => void;
  children: React.ReactNode;
}

export function Tag({ variant = "default", onRemove, className, children, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1.5 rounded-[var(--radius-full)]",
        "text-[12px] font-medium",
        BADGE_VARIANT[variant],
        className
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          type="button"
          className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black/10 transition-colors"
        >
          <X size={10} strokeWidth={2.5} />
        </button>
      )}
    </span>
  );
}
