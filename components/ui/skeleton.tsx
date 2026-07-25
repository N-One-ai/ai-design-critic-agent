import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────
   Base skeleton shimmer
───────────────────────────────────────── */
function SkeletonBase({ className, style }: { className?: string; style?: HTMLAttributes<HTMLDivElement>["style"] }) {
  return (
    <div
      style={style}
      className={cn(
        "bg-[var(--bg-surface-3)] rounded-[var(--radius-sm)] animate-pulse-skeleton",
        className
      )}
      aria-hidden="true"
    />
  );
}

/* ─────────────────────────────────────────
   Skeleton variants
───────────────────────────────────────── */
export function Skeleton({ className }: { className?: string }) {
  return <SkeletonBase className={cn("h-4 w-full", className)} />;
}

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-[var(--bg-surface-3)] animate-pulse-skeleton shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

export function SkeletonButton({ width = 96 }: { width?: number }) {
  return (
    <SkeletonBase
      className="h-9 rounded-[var(--radius-md)]"
      style={{ width }}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 space-y-3",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <SkeletonAvatar size={36} />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-3.5 w-3/4" />
          <SkeletonBase className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-2 pt-1">
        <SkeletonButton width={72} />
        <SkeletonButton width={88} />
      </div>
    </div>
  );
}

export function SkeletonImage({ aspectRatio = "16/9", className }: { aspectRatio?: string; className?: string }) {
  return (
    <SkeletonBase
      className={cn("w-full rounded-[var(--radius-lg)]", className)}
      style={{ aspectRatio }}
    />
  );
}
