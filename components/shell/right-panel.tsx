"use client";

import { useRightPanel } from "@/contexts/right-panel-context";
import { Settings2, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

function DefaultPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[var(--border-default)]">
        <p className="text-[13px] font-semibold text-[var(--fg-default)]">Cài đặt</p>
        <p className="text-[11.5px] text-[var(--fg-subtle)] mt-0.5">Chọn một module để xem cài đặt</p>
      </div>

      <EmptyState
        icon={Settings2}
        title="Chưa có module nào"
        description="Chọn một module từ sidebar để xem cài đặt và tùy chọn tại đây."
        size="sm"
        action={
          <Link
            href="/brand-checker"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--brand-default)] hover:underline"
          >
            Thử Brand Checker
            <ArrowRight size={13} />
          </Link>
        }
      />

      {/* Pinned quick links */}
      <div className="mt-auto px-4 py-4 border-t border-[var(--border-default)] space-y-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-widest text-[var(--fg-subtle)] mb-2">
          Quick access
        </p>
        {[
          { label: "Brand Checker",  href: "/brand-checker" },
          { label: "History",        href: "/history" },
          { label: "Settings",       href: "/settings" },
        ].map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] text-[13px] text-[var(--fg-muted)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--fg-default)] transition-colors group"
          >
            {label}
            <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--brand-default)]" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function RightPanel({
  panelOpen = false,
  onClose,
}: {
  panelOpen?: boolean;
  onClose?: () => void;
}) {
  const { content } = useRightPanel();

  return (
    <aside className={`app-panel ${panelOpen ? "panel-open" : ""}`}>
      {/*
       * Mobile/tablet header: drag handle (mobile) + title + close button.
       * Hidden on desktop (lg+) where the panel is always visible inline.
       */}
      <div className="lg:hidden sticky top-0 z-10 bg-[var(--bg-surface-1)] border-b border-[var(--border-default)]">
        {/* Drag handle — visible only on mobile */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-8 h-1 bg-[var(--border-strong)] rounded-full" />
        </div>
        <div className="flex items-center justify-between px-4 py-2.5">
          <p className="text-[13px] font-semibold text-[var(--fg-default)]">Cài đặt module</p>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] text-[var(--fg-muted)] hover:bg-[var(--bg-surface-2)] hover:text-[var(--fg-default)] transition-colors"
            aria-label="Đóng"
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>
      </div>

      {content ?? <DefaultPanel />}
    </aside>
  );
}
