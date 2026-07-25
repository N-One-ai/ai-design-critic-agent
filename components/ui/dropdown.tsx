"use client";

import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  destructive?: boolean;
  checked?: boolean;
  children?: DropdownItem[];
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  onSelect?: (id: string) => void;
  align?: "left" | "right";
  className?: string;
}

/* ─────────────────────────────────────────
   DropdownItem row
───────────────────────────────────────── */
function ItemRow({
  item,
  onSelect,
  depth = 0,
}: {
  item: DropdownItem;
  onSelect?: (id: string) => void;
  depth?: number;
}) {
  return (
    <button
      disabled={item.disabled}
      onClick={() => !item.disabled && onSelect?.(item.id)}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)]",
        "text-[13px] text-left transition-colors duration-fast",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--brand-default)]",
        item.destructive
          ? "text-[var(--danger-default)] hover:bg-[var(--danger-subtle)]"
          : "text-[var(--fg-default)] hover:bg-[var(--bg-surface-3)]",
        item.disabled && "opacity-40 pointer-events-none"
      )}
    >
      {item.checked !== undefined && (
        <span className="w-4 h-4 flex items-center justify-center shrink-0">
          {item.checked && <Check size={13} strokeWidth={2.5} />}
        </span>
      )}
      {item.icon && (
        <span className={cn("shrink-0 text-[var(--fg-muted)]", item.destructive && "text-[var(--danger-default)]")}>
          {item.icon}
        </span>
      )}
      <span className="flex-1 truncate">{item.label}</span>
      {item.shortcut && (
        <kbd className="text-[11px] text-[var(--fg-subtle)] font-mono">{item.shortcut}</kbd>
      )}
      {item.children && (
        <ChevronRight size={13} className="text-[var(--fg-subtle)] shrink-0" />
      )}
    </button>
  );
}

/* ─────────────────────────────────────────
   Dropdown
───────────────────────────────────────── */
export function Dropdown({
  trigger,
  items,
  onSelect,
  align = "right",
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e instanceof MouseEvent && ref.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  function handleSelect(id: string) {
    onSelect?.(id);
    setOpen(false);
  }

  return (
    <div ref={ref} className={cn("relative inline-flex", className)}>
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={cn(
            "absolute top-full z-50 mt-1.5 min-w-[180px] max-w-[260px]",
            "bg-[var(--bg-surface-1)] border border-[var(--border-default)]",
            "rounded-[var(--radius-lg)] shadow-modal py-1.5",
            "animate-in",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item, idx) => (
            item.id === "---" ? (
              <hr key={idx} className="my-1.5 border-t border-[var(--border-subtle)]" />
            ) : (
              <div key={item.id} className="px-1.5">
                <ItemRow item={item} onSelect={handleSelect} />
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   ContextMenu trigger helper
───────────────────────────────────────── */
export interface DropdownSeparator extends DropdownItem {
  id: "---";
}
