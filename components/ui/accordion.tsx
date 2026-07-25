"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface AccordionItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string[];
  multiple?: boolean;
  variant?: "default" | "separated";
  className?: string;
}

export function Accordion({
  items,
  defaultOpen = [],
  multiple = false,
  variant = "default",
  className,
}: AccordionProps) {
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpen));

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div
      className={cn(
        variant === "default"
          ? "border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden divide-y divide-[var(--border-default)]"
          : "space-y-2",
        className
      )}
    >
      {items.map((item) => {
        const isOpen = open.has(item.id);
        return (
          <div
            key={item.id}
            className={cn(
              variant === "separated" &&
                "border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-hidden"
            )}
          >
            <button
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className={cn(
                "w-full flex items-center gap-3 px-5 py-3.5",
                "text-left transition-colors duration-fast",
                "hover:bg-[var(--bg-surface-2)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand-default)]",
                isOpen && "bg-[var(--bg-surface-2)]"
              )}
            >
              {item.icon && (
                <span className="shrink-0 text-[var(--fg-muted)]">{item.icon}</span>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-[var(--fg-default)]">
                  {item.title}
                </div>
                {item.subtitle && (
                  <div className="text-[12px] text-[var(--fg-muted)] mt-0.5">
                    {item.subtitle}
                  </div>
                )}
              </div>
              <ChevronDown
                size={16}
                strokeWidth={2}
                className={cn(
                  "shrink-0 text-[var(--fg-subtle)] transition-transform duration-normal",
                  isOpen && "rotate-180"
                )}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-4 pt-1 text-[13.5px] text-[var(--fg-muted)] leading-relaxed bg-[var(--bg-surface-1)] slide-down">
                {item.children}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
