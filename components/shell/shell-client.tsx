"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar }           from "./sidebar";
import { TopNav }            from "./top-nav";
import { RightPanel }        from "./right-panel";
import { RightPanelProvider } from "@/contexts/right-panel-context";
import { SearchProvider }    from "@/contexts/search-context";
import { SearchModal }       from "./search-modal";
import { useSearch }         from "@/contexts/search-context";

const COLLAPSED_KEY = "shell-sidebar-collapsed";

function ShellInner({ children }: { children: ReactNode }) {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const { isOpen } = useSearch();
  const pathname = usePathname();

  /* Close both drawers whenever the route changes */
  useEffect(() => {
    setMobileOpen(false);
    setPanelOpen(false);
  }, [pathname]);

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSED_KEY);
    if (stored === "true") setCollapsed(true);
    setMounted(true);
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  }, []);

  /* ⌘K / Ctrl+K global shortcut */
  const { open: openSearch } = useSearch();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openSearch();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  /* Lock body scroll when a mobile drawer is open */
  useEffect(() => {
    if (mobileOpen || panelOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, panelOpen]);

  if (!mounted) {
    return (
      <div className="shell-root">
        <div className="h-[var(--nav-h)] bg-[var(--bg-surface-1)] border-b border-[var(--border-default)]" />
        <div className="shell-body">
          <div className="app-sidebar" />
          <main className="app-workspace" />
          <aside className="app-panel" />
        </div>
      </div>
    );
  }

  return (
    <>
      {isOpen && <SearchModal />}

      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[var(--bg-overlay)] md:hidden"
          style={{ zIndex: 55 }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Tablet/mobile panel backdrop */}
      {panelOpen && (
        <div
          className="fixed inset-0 bg-[var(--bg-overlay)] lg:hidden"
          style={{ zIndex: 48 }}
          onClick={() => setPanelOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="shell-root">
        <TopNav
          onToggleMobileSidebar={() => setMobileOpen((o) => !o)}
          panelOpen={panelOpen}
          onTogglePanel={() => setPanelOpen((o) => !o)}
        />
        <div className="shell-body">
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
          />
          <main className="app-workspace">{children}</main>
          <RightPanel
            panelOpen={panelOpen}
            onClose={() => setPanelOpen(false)}
          />
        </div>
      </div>
    </>
  );
}

export function ShellClient({ children }: { children: ReactNode }) {
  return (
    <SearchProvider>
      <RightPanelProvider>
        <ShellInner>{children}</ShellInner>
      </RightPanelProvider>
    </SearchProvider>
  );
}
