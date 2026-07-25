import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────
   StatusDot — small colored indicator dot
───────────────────────────────────────── */
export type StatusType =
  | "online"
  | "offline"
  | "loading"
  | "idle"
  | "success"
  | "warning"
  | "danger"
  | "info";

export type StatusSize = "xs" | "sm" | "md";

const STATUS_COLOR: Record<StatusType, string> = {
  online:  "bg-[var(--accent-default)]",
  offline: "bg-[var(--fg-disabled)]",
  loading: "bg-[var(--brand-default)] animate-pulse",
  idle:    "bg-[var(--fg-subtle)]",
  success: "bg-[var(--success-default)]",
  warning: "bg-[var(--warning-default)]",
  danger:  "bg-[var(--danger-default)]",
  info:    "bg-[var(--info-default)]",
};

const STATUS_SIZE: Record<StatusSize, string> = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
};

export interface StatusDotProps {
  status?: StatusType;
  size?: StatusSize;
  className?: string;
}

export function StatusDot({ status = "idle", size = "sm", className }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full shrink-0",
        STATUS_COLOR[status],
        STATUS_SIZE[size],
        className
      )}
    />
  );
}

/* ─────────────────────────────────────────
   StatusBadge — dot + label
───────────────────────────────────────── */
const STATUS_LABEL_STYLES: Record<StatusType, { bg: string; text: string }> = {
  online:  { bg: "bg-[var(--accent-subtle)]",  text: "text-[var(--accent-default)]" },
  offline: { bg: "bg-[var(--bg-surface-3)]",   text: "text-[var(--fg-subtle)]" },
  loading: { bg: "bg-[var(--brand-subtle)]",   text: "text-[var(--brand-default)]" },
  idle:    { bg: "bg-[var(--bg-surface-3)]",   text: "text-[var(--fg-muted)]" },
  success: { bg: "bg-[var(--success-subtle)]", text: "text-[var(--success-default)]" },
  warning: { bg: "bg-[var(--warning-subtle)]", text: "text-[var(--warning-default)]" },
  danger:  { bg: "bg-[var(--danger-subtle)]",  text: "text-[var(--danger-default)]" },
  info:    { bg: "bg-[var(--info-subtle)]",    text: "text-[var(--info-default)]" },
};

export interface StatusBadgeProps extends StatusDotProps {
  label: string;
}

export function StatusBadge({ status = "idle", label, size = "sm", className }: StatusBadgeProps) {
  const styles = STATUS_LABEL_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1",
        "rounded-[var(--radius-full)] text-[12px] font-semibold",
        styles.bg,
        styles.text,
        className
      )}
    >
      <StatusDot status={status} size={size} />
      {label}
    </span>
  );
}
