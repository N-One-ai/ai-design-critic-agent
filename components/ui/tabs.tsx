"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export type TabsVariant = "underline" | "pill" | "outline";

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (id: string) => void;
  variant?: TabsVariant;
  size?: "sm" | "md";
  className?: string;
  children?: (activeId: string) => ReactNode;
}

/* ─────────────────────────────────────────
   Tabs
───────────────────────────────────────── */
export function Tabs({
  items,
  defaultValue,
  value: controlledValue,
  onChange,
  variant = "underline",
  size = "md",
  className,
  children,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id ?? "");
  const active = controlledValue ?? internal;

  function select(id: string) {
    if (!controlledValue) setInternal(id);
    onChange?.(id);
  }

  const isUnderline = variant === "underline";
  const isPill      = variant === "pill";
  const isOutline   = variant === "outline";

  return (
    <div className={cn("w-full", className)}>
      {/* Tab list */}
      <div
        role="tablist"
        className={cn(
          "flex items-center",
          isUnderline && "border-b border-[var(--border-default)] gap-0",
          isPill      && "gap-1 p-1 rounded-[var(--radius-lg)] bg-[var(--bg-surface-2)] w-fit",
          isOutline   && "gap-1 border border-[var(--border-default)] rounded-[var(--radius-lg)] p-1 w-fit"
        )}
      >
        {items.map((item) => {
          const isActive = item.id === active;

          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              aria-disabled={item.disabled}
              disabled={item.disabled}
              onClick={() => !item.disabled && select(item.id)}
              className={cn(
                "inline-flex items-center gap-1.5 font-medium",
                "transition-all duration-fast ease-ease",
                "disabled:opacity-40 disabled:pointer-events-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-default)]",
                size === "sm" ? "text-[12.5px] px-2.5 py-1.5" : "text-[13.5px] px-3.5 py-2",

                /* underline variant */
                isUnderline && [
                  "relative rounded-none border-b-2 -mb-px",
                  isActive
                    ? "border-[var(--brand-default)] text-[var(--brand-default)]"
                    : "border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-default)] hover:border-[var(--border-strong)]",
                ],

                /* pill variant */
                isPill && [
                  "rounded-[var(--radius-md)]",
                  isActive
                    ? "bg-[var(--bg-surface-1)] text-[var(--fg-default)] shadow-1"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg-default)]",
                ],

                /* outline variant */
                isOutline && [
                  "rounded-[var(--radius-md)]",
                  isActive
                    ? "bg-[var(--brand-default)] text-white"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg-default)] hover:bg-[var(--bg-surface-3)]",
                ]
              )}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              {item.label}
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1",
                    "rounded-full text-[10px] font-bold",
                    isActive && isUnderline
                      ? "bg-[var(--brand-subtle)] text-[var(--brand-default)]"
                      : isActive && (isPill || isOutline)
                      ? "bg-white/20 text-inherit"
                      : "bg-[var(--bg-surface-3)] text-[var(--fg-muted)]"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {children && (
        <div role="tabpanel" className="mt-4">
          {children(active)}
        </div>
      )}
    </div>
  );
}
