import { cn } from "@/lib/cn";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

const SIZES: Record<SpinnerSize, string> = {
  xs: "w-3 h-3 border-[1.5px]",
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-8 h-8 border-[2.5px]",
  xl: "w-11 h-11 border-[3px]",
};

export function Spinner({ size = "md", className, label }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label ?? "Đang tải..."}
      className={cn(
        "inline-block rounded-full",
        "border-[var(--border-strong)] border-t-[var(--brand-default)]",
        "animate-spin",
        SIZES[size],
        className
      )}
    />
  );
}

/* ─── Centered loading overlay ─── */
export function LoadingOverlay({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Spinner size="lg" />
      {label && (
        <p className="text-[13px] text-[var(--fg-muted)] animate-pulse">{label}</p>
      )}
    </div>
  );
}
