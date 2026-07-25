"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { NAV_GROUPS, type NavItem, type NavBadge } from "@/lib/nav-config";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function Badge({ type }: { type: NavBadge }) {
  const styles: Record<NavBadge, string> = {
    soon: "bg-[var(--sb-badge-soon-bg)] text-[var(--sb-badge-soon-fg)]",
    beta: "bg-[var(--sb-badge-beta-bg)] text-[var(--sb-badge-beta-fg)]",
    new: "bg-[var(--sb-badge-new-bg)] text-[var(--sb-badge-new-fg)]",
  };
  const labels: Record<NavBadge, string> = { soon: "Soon", beta: "Beta", new: "New" };
  return (
    <span
      className={`shrink-0 text-[10px] font-semibold leading-none px-1.5 py-0.5 rounded-full tracking-wide ${styles[type]}`}
    >
      {labels[type]}
    </span>
  );
}

function NavItemRow({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.Icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`
        group relative flex items-center gap-3 px-3 py-2 rounded-lg mx-2 my-0.5
        transition-all duration-150 outline-none
        ${
          isActive
            ? "bg-[var(--sb-item-active-bg)] text-[var(--sb-fg-active)]"
            : "text-[var(--sb-fg)] hover:bg-[var(--sb-item-hover)] hover:text-[var(--sb-fg-active)]"
        }
      `}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--sb-item-active-indicator)] rounded-r-full" />
      )}
      <Icon
        size={17}
        strokeWidth={isActive ? 2.2 : 1.8}
        className="shrink-0 transition-none"
      />
      {!collapsed && (
        <>
          <span className="flex-1 text-[13.5px] font-medium leading-none truncate">
            {item.label}
          </span>
          {item.badge && <Badge type={item.badge} />}
        </>
      )}
      {collapsed && item.badge && item.badge !== "soon" && (
        <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-[var(--sb-item-active-indicator)]" />
      )}
    </Link>
  );
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`app-sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* Logo / Header */}
      <div
        className="flex items-center h-[var(--nav-h)] px-4 shrink-0"
        style={{ borderBottom: "1px solid var(--sb-header-border)" }}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#0033c9] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-[11px] tracking-tight">ZP</span>
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-[var(--sb-logo-text)] leading-none truncate">
                ZaloPay AI
              </div>
              <div className="text-[10.5px] text-[var(--sb-group-label)] mt-0.5 leading-none">
                Creative Platform
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-7 h-7 rounded-lg bg-[#0033c9] flex items-center justify-center">
            <span className="text-white font-bold text-[11px] tracking-tight">ZP</span>
          </div>
        )}
      </div>

      {/* Nav groups */}
      <nav className="sidebar-nav flex-1 overflow-y-auto overflow-x-hidden py-3">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.label && !collapsed && (
              <div
                className="px-5 mb-1 mt-4 first:mt-0 text-[10.5px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--sb-group-label)" }}
              >
                {group.label}
              </div>
            )}
            {collapsed && gi > 0 && (
              <div
                className="mx-4 my-3 h-px"
                style={{ background: "var(--sb-divider)" }}
              />
            )}
            {group.items.map((item) => (
              <NavItemRow
                key={item.id}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                collapsed={collapsed}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div
        className="shrink-0 px-3 py-3"
        style={{ borderTop: "1px solid var(--sb-header-border)" }}
      >
        <button
          onClick={onToggleCollapse}
          className={`
            w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
            text-[var(--sb-fg)] hover:bg-[var(--sb-item-hover)] hover:text-[var(--sb-fg-active)]
            transition-colors duration-150
            ${collapsed ? "justify-center" : ""}
          `}
        >
          {collapsed ? (
            <ChevronRight size={16} strokeWidth={2} />
          ) : (
            <>
              <ChevronLeft size={16} strokeWidth={2} />
              <span className="text-[12.5px]">Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
