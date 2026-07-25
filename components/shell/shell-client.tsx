"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Sidebar }           from "./sidebar";
import { TopNav }            from "./top-nav";
import { RightPanel }        from "./right-panel";
import { RightPanelProvider } from "@/contexts/right-panel-context";
import { SearchProvider }    from "@/contexts/search-context";
import { SearchModal }       from "./search-modal";
import { useSearch }         from "@/contexts/search-context";

const COLLAPSED_KEY = "shell-sidebar-collapsed";

function ShellInner({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const { isOpen } = useSearch();

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
      <div className="shell-root">
        <TopNav />
        <div className="shell-body">
          <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
          <main className="app-workspace">{children}</main>
          <RightPanel />
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
