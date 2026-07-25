import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────
   Progress Bar
───────────────────────────────────────── */
export type ProgressVariant = "brand" | "success" | "warning" | "danger";

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: "xs" | "sm" | "md";
  label?: string;
  showValue?: boolean;
  className?: string;
}

const BAR_COLOR: Record<ProgressVariant, string> = {
  brand:   "bg-[var(--brand-default)]",
  success: "bg-[var(--accent-default)]",
  warning: "bg-[var(--warning-default)]",
  danger:  "bg-[var(--danger-default)]",
};

const BAR_HEIGHT: Record<"xs" | "sm" | "md", string> = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2",
};

export function ProgressBar({
  value,
  max = 100,
  variant = "brand",
  size = "sm",
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-[12px] text-[var(--fg-muted)]">{label}</span>}
          {showValue && (
            <span className="text-[12px] font-semibold text-[var(--fg-default)] tabular-nums">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-[var(--bg-surface-3)] rounded-[var(--radius-full)] overflow-hidden",
          BAR_HEIGHT[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        aria-valuemin={0}
        aria-label={label}
      >
        <div
          className={cn(
            "h-full rounded-[var(--radius-full)] transition-[width] duration-slow ease-ease",
            BAR_COLOR[variant]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Score Bar (number-labeled progress)
   Used for AI analysis scores 0–10
───────────────────────────────────────── */
export function ScoreBar({
  score,
  max = 10,
  className,
}: {
  score: number;
  max?: number;
  className?: string;
}) {
  const pct = (score / max) * 100;
  const variant: ProgressVariant =
    pct >= 70 ? "success" : pct >= 50 ? "warning" : "danger";

  const colorMap: Record<ProgressVariant, string> = {
    success: "text-[var(--accent-default)]",
    warning: "text-[var(--warning-default)]",
    danger:  "text-[var(--danger-default)]",
    brand:   "text-[var(--brand-default)]",
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1 h-2 bg-[var(--bg-surface-3)] rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-slow ease-ease",
            BAR_COLOR[variant]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          "text-[12.5px] font-bold tabular-nums shrink-0",
          colorMap[variant]
        )}
      >
        {score}/{max}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Progress Circle
───────────────────────────────────────── */
export interface ProgressCircleProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  label?: string;
  showValue?: boolean;
  className?: string;
}

const CIRCLE_COLOR: Record<ProgressVariant, string> = {
  brand:   "stroke-[var(--brand-default)]",
  success: "stroke-[var(--accent-default)]",
  warning: "stroke-[var(--warning-default)]",
  danger:  "stroke-[var(--danger-default)]",
};

export function ProgressCircle({
  value,
  max = 100,
  size = 64,
  strokeWidth = 5,
  variant = "brand",
  label,
  showValue = true,
  className,
}: ProgressCircleProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;

  return (
    <div
      className={cn("inline-flex flex-col items-center gap-1", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
      aria-label={label}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-[var(--bg-surface-3)]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - dash}
          className={cn("transition-[stroke-dashoffset] duration-slow", CIRCLE_COLOR[variant])}
        />
      </svg>
      {showValue && (
        <span className="text-[11px] font-bold text-[var(--fg-muted)] tabular-nums">
          {Math.round(pct)}%
        </span>
      )}
      {label && (
        <span className="text-[11px] text-[var(--fg-subtle)]">{label}</span>
      )}
    </div>
  );
}
