import React, { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  icon?: LucideIcon;
  illustration?: ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: { wrap: "py-10",  icon: "w-10 h-10", iconSize: 18, title: "text-[14px]", desc: "text-[13px]" },
  md: { wrap: "py-16",  icon: "w-14 h-14", iconSize: 24, title: "text-[16px]", desc: "text-[14px]" },
  lg: { wrap: "py-24",  icon: "w-16 h-16", iconSize: 28, title: "text-[18px]", desc: "text-[15px]" },
};

export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  action,
  size = "md",
  className,
}: EmptyStateProps) {
  const s = SIZE_CLASSES[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 gap-3",
        s.wrap,
        className
      )}
    >
      {illustration ? (
        <div className="mb-1">{illustration}</div>
      ) : Icon ? (
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl bg-[var(--bg-surface-2)] mb-1",
            s.icon
          )}
        >
          <Icon
            size={s.iconSize}
            strokeWidth={1.4}
            className="text-[var(--fg-subtle)]"
          />
        </div>
      ) : null}

      <h3 className={cn("font-semibold text-[var(--fg-default)]", s.title)}>
        {title}
      </h3>

      {description && (
        <p className={cn("text-[var(--fg-muted)] max-w-sm leading-relaxed", s.desc)}>
          {description}
        </p>
      )}

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
