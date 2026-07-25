"use client";

import { Bell, Search, CreditCard, Moon, Sun, Monitor, ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ALL_NAV_ITEMS } from "@/lib/nav-config";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const icons = { light: Sun, dark: Moon, system: Monitor };
  const ActiveIcon = icons[(theme as keyof typeof icons) ?? "system"] ?? Monitor;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--foreground-2)] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
        title="Chủ đề"
      >
        <ActiveIcon size={16} strokeWidth={1.8} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg py-1.5 min-w-[140px]">
          {(["light", "dark", "system"] as const).map((t) => {
            const Icon = icons[t];
            const labels = { light: "Sáng", dark: "Tối", system: "Hệ thống" };
            return (
              <button
                key={t}
                onClick={() => { setTheme(t); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors
                  ${theme === t
                    ? "text-[var(--primary)] font-semibold"
                    : "text-[var(--foreground-2)] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)]"
                  }`}
              >
                <Icon size={14} strokeWidth={2} />
                {labels[t]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BreadcrumbTitle() {
  const pathname = usePathname();
  const current = ALL_NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
  return (
    <span className="text-[14px] font-semibold text-[var(--foreground)] truncate">
      {current?.label ?? "ZaloPay AI Creative Platform"}
    </span>
  );
}

export function TopNav() {
  return (
    <header
      className="h-[var(--nav-h)] flex items-center px-4 gap-3 shrink-0"
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        zIndex: 40,
      }}
    >
      {/* Title / breadcrumb */}
      <div className="flex-1 min-w-0">
        <BreadcrumbTitle />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[var(--foreground-3)] hover:text-[var(--foreground-2)] hover:bg-[var(--surface-secondary)] transition-colors text-[13px]"
          title="Tìm kiếm (⌘K)"
        >
          <Search size={15} strokeWidth={1.8} />
          <span className="hidden sm:block text-[12px]">Tìm kiếm</span>
          <kbd className="hidden sm:block text-[10px] bg-[var(--surface-secondary)] border border-[var(--border)] rounded px-1 py-0.5 font-mono">
            ⌘K
          </kbd>
        </button>

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        {/* Credits indicator */}
        <button className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[var(--foreground-2)] hover:bg-[var(--surface-secondary)] transition-colors">
          <CreditCard size={15} strokeWidth={1.8} />
          <span className="text-[12.5px] font-medium">Credits: ∞</span>
        </button>

        {/* Notifications */}
        <button
          className="relative flex items-center justify-center w-8 h-8 rounded-lg text-[var(--foreground-2)] hover:text-[var(--foreground)] hover:bg-[var(--surface-secondary)] transition-colors"
          title="Thông báo"
        >
          <Bell size={16} strokeWidth={1.8} />
        </button>

        <ThemeToggle />

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        {/* User avatar */}
        <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[var(--surface-secondary)] transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0033c9] to-[#00cf6a] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            ZP
          </div>
          <ChevronDown size={13} strokeWidth={2} className="text-[var(--foreground-3)] hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
