"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { NAV_GROUPS, type NavItem, type NavBadge } from "@/lib/nav-config";

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

      {/* Label + description */}
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

      {/* Collapsed: new/beta dot indicator */}
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

  /*
   * On mobile the overlay always shows the full sidebar regardless of the
   * desktop `collapsed` state, so we compute an effective expansion flag.
   */
  const showExpanded = !collapsed || mobileOpen;

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
        {showExpanded ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-[var(--radius-lg)] bg-[#0033c9] flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-white font-bold text-[12px] tracking-tight">ZP</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-bold text-[var(--sb-logo-text)] leading-none">ZaloPay AI</div>
              <div className="text-[10.5px] text-[var(--sb-fg)] mt-0.5 leading-none">Creative Platform</div>
            </div>
            {/* Close button — mobile only */}
            <button
              onClick={onClose}
              className="md:hidden ml-auto shrink-0 flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] text-[var(--sb-fg)] hover:bg-[var(--sb-item-hover)] hover:text-[var(--sb-fg-active)] transition-colors"
              aria-label="Đóng menu"
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-[var(--radius-lg)] bg-[#0033c9] flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-[12px] tracking-tight">ZP</span>
          </div>
        )}
      </div>

      {/* ── Search ── */}
      {showExpanded && (
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
            {group.label && showExpanded && (
              <div
                className="px-5 mb-1 mt-4 first:mt-1 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--sb-group-label)" }}
              >
                {group.label}
              </div>
            )}
            {!showExpanded && gi > 0 && (
              <div className="mx-4 my-2 h-px" style={{ background: "var(--sb-divider)" }} />
            )}
            {group.items.map((item) => (
              <NavItemRow
                key={item.id}
                item={item}
                isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                collapsed={!showExpanded}
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

      {/* ── Collapse toggle (desktop only) ── */}
      <div className="hidden md:block shrink-0 px-3 py-3" style={{ borderTop: "1px solid var(--sb-header-border)" }}>
        <button
          onClick={onToggleCollapse}
          className={`
            w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)]
            text-[var(--sb-fg)] hover:bg-[var(--sb-item-hover)] hover:text-[var(--sb-fg-active)]
            transition-colors duration-150
            ${!showExpanded ? "justify-center" : ""}
          `}
        >
          {!showExpanded
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
    </aside>
  );
}
