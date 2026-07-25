"use client";

import { useRightPanel } from "@/contexts/right-panel-context";
import { Settings2 } from "lucide-react";

function DefaultPanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8 py-12">
      <div className="w-10 h-10 rounded-xl bg-[var(--surface-secondary)] flex items-center justify-center">
        <Settings2 size={20} strokeWidth={1.5} className="text-[var(--foreground-3)]" />
      </div>
      <p className="text-[13px] text-[var(--foreground-3)] leading-relaxed">
        Chọn một module để hiện cài đặt tương ứng tại đây.
      </p>
    </div>
  );
}

export function RightPanel() {
  const { content } = useRightPanel();

  return (
    <aside className="app-panel">
      {content ?? <DefaultPanel />}
    </aside>
  );
}
