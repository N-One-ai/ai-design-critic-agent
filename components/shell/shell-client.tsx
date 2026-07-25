"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { RightPanel } from "./right-panel";
import { RightPanelProvider } from "@/contexts/right-panel-context";

const COLLAPSED_KEY = "shell-sidebar-collapsed";

interface ShellClientProps {
  children: ReactNode;
}

export function ShellClient({ children }: ShellClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSED_KEY);
    if (stored === "true") setCollapsed(true);
    setMounted(true);
  }, []);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  }

  if (!mounted) {
    return (
      <div className="shell-root">
        <div className="h-[var(--nav-h)] bg-[var(--surface)] border-b border-[var(--border)]" />
        <div className="shell-body">
          <div className="app-sidebar" />
          <main className="app-workspace" />
          <aside className="app-panel" />
        </div>
      </div>
    );
  }

  return (
    <RightPanelProvider>
      <div className="shell-root">
        {/* Top nav spans full width */}
        <TopNav />

        <div className="shell-body">
          <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />

          <main className="app-workspace">
            {children}
          </main>

          <RightPanel />
        </div>
      </div>
    </RightPanelProvider>
  );
}
