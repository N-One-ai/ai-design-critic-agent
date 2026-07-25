"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search, Bell, Sun, Moon, Monitor, ChevronDown,
  HelpCircle, Zap, Check, LogOut, User, Settings,
  ChevronRight,
} from "lucide-react";
import { useSearch } from "@/contexts/search-context";
import { findNavItemByPath } from "@/lib/nav-config";

/* ─── Theme toggle ─── */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const THEMES = [
    { id: "light",  label: "Sáng",      Icon: Sun },
    { id: "dark",   label: "Tối",       Icon: Moon },
    { id: "system", label: "Hệ thống",  Icon: Monitor },
  ] as const;
  const active = THEMES.find((t) => t.id === theme) ?? THEMES[2];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--fg-muted)] hover:text-[var(--fg-default)] hover:bg-[var(--bg-surface-3)] transition-colors"
        aria-label="Chủ đề"
      >
        <active.Icon size={15} strokeWidth={1.8} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-dropdown)] py-1.5 min-w-[148px]">
          {THEMES.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setTheme(id); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] transition-colors hover:bg-[var(--bg-surface-2)]"
            >
              <Icon size={14} strokeWidth={1.8} className="text-[var(--fg-muted)]" />
              <span className={theme === id ? "text-[var(--brand-default)] font-semibold" : "text-[var(--fg-default)]"}>
                {label}
              </span>
              {theme === id && <Check size={12} className="ml-auto text-[var(--brand-default)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Notifications ─── */
const MOCK_NOTIFICATIONS = [
  { id: "1", title: "Brand analysis hoàn thành",  body: "Banner Tết 2025.jpg — Score 8.5/10",   time: "2 phút",  read: false, color: "var(--accent-default)" },
  { id: "2", title: "Cập nhật brand guideline",   body: "ZaloPay v2.4 đã có sẵn",              time: "1 giờ",   read: false, color: "var(--brand-default)" },
  { id: "3", title: "Thư viện template mới",      body: "42 template Tết vừa được thêm vào",   time: "3 giờ",   read: true,  color: "var(--warning-default)" },
  { id: "4", title: "Credits sắp hết",            body: "Còn 840 / 10,000 credits",             time: "1 ngày",  read: true,  color: "var(--danger-default)" },
];

function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--fg-muted)] hover:text-[var(--fg-default)] hover:bg-[var(--bg-surface-3)] transition-colors"
        aria-label="Thông báo"
      >
        <Bell size={15} strokeWidth={1.8} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--danger-default)] border-2 border-[var(--bg-surface-1)]" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-[340px] bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
            <h3 className="text-[14px] font-semibold text-[var(--fg-default)]">Thông báo</h3>
            {unread > 0 && (
              <span className="text-[12px] font-medium text-[var(--brand-default)]">{unread} mới</span>
            )}
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {MOCK_NOTIFICATIONS.map((n) => (
              <button
                key={n.id}
                className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-surface-2)] transition-colors ${!n.read ? "bg-[var(--bg-surface-2)]" : ""}`}
              >
                <div
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{ background: n.read ? "var(--border-default)" : n.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[var(--fg-default)] truncate">{n.title}</p>
                  <p className="text-[12px] text-[var(--fg-muted)] mt-0.5 truncate">{n.body}</p>
                </div>
                <span className="text-[11px] text-[var(--fg-subtle)] shrink-0 mt-0.5">{n.time}</span>
              </button>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-[var(--border-default)]">
            <button className="text-[12.5px] text-[var(--brand-default)] hover:underline">
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Credits pill ─── */
function CreditsIndicator() {
  const used = 840;
  const total = 10000;
  const pct = (used / total) * 100;
  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)] border border-[var(--border-default)] hover:border-[var(--brand-default)] transition-colors cursor-pointer group">
      <Zap size={13} strokeWidth={2} className="text-[var(--accent-default)] shrink-0" />
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-semibold text-[var(--fg-default)] tabular-nums">
            {used.toLocaleString()}
          </span>
          <span className="text-[11px] text-[var(--fg-subtle)]">/ {(total / 1000).toFixed(0)}k</span>
        </div>
        <div className="w-16 h-1 bg-[var(--bg-surface-3)] rounded-full overflow-hidden mt-0.5">
          <div
            className="h-full rounded-full bg-[var(--accent-default)] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── User menu ─── */
function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1 rounded-[var(--radius-md)] hover:bg-[var(--bg-surface-3)] transition-colors"
        aria-label="Tài khoản"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0033c9] to-[#00cf6a] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
          ZP
        </div>
        <div className="hidden sm:block text-left min-w-0">
          <p className="text-[12.5px] font-semibold text-[var(--fg-default)] leading-none truncate max-w-[80px]">Ngọc NA</p>
          <p className="text-[10.5px] text-[var(--fg-subtle)] leading-none mt-0.5">Admin</p>
        </div>
        <ChevronDown size={12} strokeWidth={2} className="text-[var(--fg-subtle)] hidden sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-[220px] bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] py-1.5 overflow-hidden">
          {/* Profile header */}
          <div className="px-4 py-3 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0033c9] to-[#00cf6a] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                ZP
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[var(--fg-default)] truncate">Ngọc NA</p>
                <p className="text-[11px] text-[var(--fg-subtle)] truncate">ngocna2@vng.com.vn</p>
              </div>
            </div>
          </div>
          {/* Menu items */}
          {[
            { icon: User,     label: "Hồ sơ cá nhân", href: "/settings" },
            { icon: Settings, label: "Cài đặt",         href: "/settings" },
          ].map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--fg-default)] hover:bg-[var(--bg-surface-2)] transition-colors"
            >
              <Icon size={14} strokeWidth={1.8} className="text-[var(--fg-muted)]" />
              {label}
            </Link>
          ))}
          <div className="mx-3 my-1 h-px bg-[var(--border-default)]" />
          <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[var(--danger-default)] hover:bg-[var(--danger-subtle)] transition-colors">
            <LogOut size={14} strokeWidth={1.8} />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Breadcrumb ─── */
function Breadcrumb() {
  const pathname = usePathname();
  const current = findNavItemByPath(pathname);
  const Icon = current?.Icon;
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Link href="/dashboard" className="text-[13px] text-[var(--fg-subtle)] hover:text-[var(--fg-muted)] transition-colors shrink-0">
        ZaloPay AI
      </Link>
      {current && (
        <>
          <ChevronRight size={13} strokeWidth={1.5} className="text-[var(--fg-subtle)] shrink-0" />
          {Icon && <Icon size={13} strokeWidth={1.8} className="text-[var(--fg-muted)] shrink-0" />}
          <span className="text-[13.5px] font-semibold text-[var(--fg-default)] truncate">
            {current.label}
          </span>
        </>
      )}
    </div>
  );
}

/* ─── TopNav ─── */
export function TopNav() {
  const { open } = useSearch();

  return (
    <header
      className="h-[var(--nav-h)] flex items-center px-4 gap-3 shrink-0 bg-[var(--bg-surface-1)] border-b border-[var(--border-default)]"
      style={{ zIndex: 40 }}
    >
      {/* Left: breadcrumb */}
      <div className="flex-1 min-w-0">
        <Breadcrumb />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button
          onClick={open}
          className="flex items-center gap-2 h-8 px-3 rounded-[var(--radius-md)] text-[var(--fg-muted)] bg-[var(--bg-surface-2)] border border-[var(--border-default)] hover:border-[var(--brand-default)] hover:text-[var(--fg-default)] transition-colors text-[12.5px]"
          aria-label="Tìm kiếm (⌘K)"
        >
          <Search size={13} strokeWidth={1.8} />
          <span className="hidden sm:block">Tìm kiếm</span>
          <kbd className="hidden sm:block text-[10px] bg-[var(--bg-surface-3)] border border-[var(--border-default)] rounded px-1 py-0.5 font-mono text-[var(--fg-subtle)]">
            ⌘K
          </kbd>
        </button>

        <div className="w-px h-5 bg-[var(--border-default)] mx-1" />

        <CreditsIndicator />
        <NotificationsDropdown />
        <ThemeToggle />

        {/* Help */}
        <button
          className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--fg-muted)] hover:text-[var(--fg-default)] hover:bg-[var(--bg-surface-3)] transition-colors"
          aria-label="Trợ giúp"
          title="Trợ giúp"
        >
          <HelpCircle size={15} strokeWidth={1.8} />
        </button>

        <div className="w-px h-5 bg-[var(--border-default)] mx-1" />

        <UserMenu />
      </div>
    </header>
  );
}
