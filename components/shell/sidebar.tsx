"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { NAV_GROUPS, type NavItem, type NavBadge } from "@/lib/nav-config";

/* ─── Zalopay Trademark Z ─── */
function ZMark({ fill = "#0050e6" }: { fill?: string }) {
  return (
    <svg width="14" height="16" viewBox="0 0 310.91 358.18" fill="none" aria-hidden="true">
      <path
        d="M280.11,284.65c-57.41-19.59-110.44-22.91-154.53-19.29l154.53-171.91,30.03-33.4L280.11,0l-3.85,1.57c-4.1,1.68-8.3,3.29-12.5,4.79-34.66,12.48-71.1,18.82-108.31,18.82-41.81,0-82.46-7.94-120.81-23.61L30.79,0,0,61.59l4.4,1.86c8.7,3.68,17.5,7.02,26.39,10.03,40,13.56,81.81,20.43,124.66,20.43,9.95,0,19.97-.38,29.92-1.14L30.79,264.74.77,298.13l30.02,60.05h0s3.85-1.57,3.85-1.57c4.08-1.67,8.29-3.28,12.49-4.79,34.68-12.49,71.13-18.82,108.32-18.82,41.8,0,82.45,7.95,120.81,23.62l3.84,1.57h0s30.8-61.59,30.8-61.59c-10.39-4.53-20.66-8.48-30.8-11.94Z"
        fill={fill}
      />
    </svg>
  );
}

/* ─── Badge ─── */
function NavBadgeChip({ type }: { type: NavBadge }) {
  const styles: Record<NavBadge, string> = {
    soon: "bg-[var(--sb-badge-soon-bg)] text-[var(--sb-badge-soon-fg)]",
    beta: "bg-[var(--sb-badge-beta-bg)] text-[var(--sb-badge-beta-fg)]",
    new:  "bg-[var(--sb-badge-new-bg)]  text-[var(--sb-badge-new-fg)]",
  };
  const labels: Record<NavBadge, string> = { soon: "Soon", beta: "Beta", new: "New" };
  return (
    <span className={`shrink-0 text-[10px] font-semibold leading-none px-1.5 py-0.5 rounded-full tracking-wide ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

/* ─── Nav item row ─── */
function NavItemRow({
  item,
  isActive,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.Icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={`
        group relative flex items-center gap-3 px-3 rounded-[var(--radius-md)] mx-2 my-0.5
        transition-all duration-150 outline-none
        ${collapsed ? "py-2.5 justify-center" : "py-2"}
        ${isActive
          ? "bg-[var(--sb-item-active-bg)] text-[var(--sb-fg-active)]"
          : "text-[var(--sb-fg)] hover:bg-[var(--sb-item-hover)] hover:text-[var(--sb-fg-active)]"
        }
      `}
    >
      {/* Active indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--sb-item-active-indicator)] rounded-r-full" />
      )}

      {/* Icon */}
      <Icon
        size={16}
        strokeWidth={isActive ? 2.2 : 1.8}
        className="shrink-0 transition-none"
      />

      {/* Label + description — hidden when collapsed */}
      {!collapsed && (
        <>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium leading-none truncate">{item.label}</div>
            {item.description && (
              <div className="text-[11px] leading-none mt-1 truncate opacity-60 group-hover:opacity-80 transition-opacity">
                {item.description}
              </div>
            )}
          </div>
          {item.badge && <NavBadgeChip type={item.badge} />}
        </>
      )}

      {/* Collapsed: dot indicator for new/beta items */}
      {collapsed && item.badge && item.badge !== "soon" && (
        <span className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-[var(--sb-item-active-indicator)]" />
      )}
    </Link>
  );
}

/* ─── Sidebar ─── */
export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen = false,
  onClose,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const filteredGroups = search.trim()
    ? NAV_GROUPS.map((g) => ({
        ...g,
        items: g.items.filter(
          (i) =>
            i.label.toLowerCase().includes(search.toLowerCase()) ||
            (i.description?.toLowerCase() ?? "").includes(search.toLowerCase())
        ),
      })).filter((g) => g.items.length > 0)
    : NAV_GROUPS;

  return (
    <aside className={`app-sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>

      {/* ── Logo / Header ── */}
      <div
        className="flex items-center h-[var(--nav-h)] px-3 shrink-0"
        style={{ borderBottom: "1px solid var(--sb-header-border)" }}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {/* ZP square badge */}
            <div className="w-8 h-8 rounded-[var(--radius-lg)] bg-[rgba(61,114,255,0.15)] border border-[rgba(61,114,255,0.2)] flex items-center justify-center shrink-0">
              <ZMark />
            </div>
            {/* Title + subtitle */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 leading-none">
                <img
                  src="/zalopay-logo-white.png"
                  alt="Zalopay"
                  className="h-[14px] w-auto max-w-[68px] object-contain object-left shrink-0"
                />
                <span
                  className="shrink-0 text-[9px] font-bold tracking-wider px-1.5 py-[2px] rounded-[var(--radius-xs)]"
                  style={{ background: "linear-gradient(135deg, #0033c9 0%, #00cf6a 100%)", color: "#ffffff" }}
                >
                  AI
                </span>
              </div>
              <div className="text-[10px] leading-none mt-0.5 truncate" style={{ color: "var(--sb-fg)" }}>Creative Platform</div>
            </div>
            {/* Close button — mobile overlay only */}
            <button
              onClick={onClose}
              className="md:hidden ml-auto shrink-0 flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] text-[var(--sb-fg)] hover:bg-[var(--sb-item-hover)] hover:text-[var(--sb-fg-active)] transition-colors"
              aria-label="Đóng menu"
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
        ) : (
          /* Collapsed: gradient icon */
          <div
            className="mx-auto w-8 h-8 rounded-[var(--radius-lg)] flex items-center justify-center shadow-sm shrink-0 cursor-pointer"
            onClick={onToggleCollapse}
            title="Mở rộng"
            style={{ background: "linear-gradient(135deg, #0033c9 0%, #00cf6a 100%)" }}
          >
            <ZMark fill="#0050e6" />
          </div>
        )}
      </div>

      {/* ── Search (expanded only) ── */}
      {!collapsed && (
        <div className="px-3 py-2.5" style={{ borderBottom: "1px solid var(--sb-header-border)" }}>
          <div className="flex items-center gap-2 h-8 px-2.5 rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.07)] focus-within:border-[rgba(61,114,255,0.5)]">
            <Search size={12} strokeWidth={2} className="text-[var(--sb-fg)] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm module..."
              className="flex-1 bg-transparent text-[12.5px] text-[var(--sb-fg-active)] placeholder:text-[var(--sb-fg)] outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-[var(--sb-fg)] hover:text-[var(--sb-fg-active)]">
                <X size={11} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Nav groups ── */}
      <nav className="sidebar-nav flex-1 overflow-y-auto overflow-x-hidden py-2">
        {filteredGroups.map((group, gi) => (
          <div key={gi}>
            {/* Group heading — expanded only */}
            {group.label && !collapsed && (
              <div
                className="px-5 mb-1 mt-4 first:mt-1 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--sb-group-label)" }}
              >
                {group.label}
              </div>
            )}
            {/* Divider between groups in collapsed mode */}
            {collapsed && gi > 0 && (
              <div className="mx-4 my-2 h-px" style={{ background: "var(--sb-divider)" }} />
            )}
            {group.items.map((item) => (
              <NavItemRow
                key={item.id}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                collapsed={collapsed}
                onNavigate={mobileOpen ? onClose : undefined}
              />
            ))}
          </div>
        ))}

        {filteredGroups.length === 0 && search && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
            <Search size={18} strokeWidth={1.5} style={{ color: "var(--sb-fg)" }} />
            <p className="text-[12px]" style={{ color: "var(--sb-fg)" }}>
              Không tìm thấy &ldquo;{search}&rdquo;
            </p>
          </div>
        )}
      </nav>

      {/* ── Collapse toggle — always visible on desktop, hidden inside mobile overlay ── */}
      {!mobileOpen && (
        <div className="shrink-0 px-3 py-3" style={{ borderTop: "1px solid var(--sb-header-border)" }}>
          <button
            onClick={onToggleCollapse}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)]
              text-[var(--sb-fg)] hover:bg-[var(--sb-item-hover)] hover:text-[var(--sb-fg-active)]
              transition-colors duration-150
              ${collapsed ? "justify-center" : ""}
            `}
          >
            {collapsed
              ? <ChevronRight size={15} strokeWidth={2} />
              : (
                <>
                  <ChevronLeft size={15} strokeWidth={2} />
                  <span className="text-[12.5px]">Thu gọn</span>
                </>
              )
            }
          </button>
        </div>
      )}
    </aside>
  );
}
