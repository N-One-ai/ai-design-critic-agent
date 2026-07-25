"use client";

import { useEffect } from "react";
import { Palette, Layers, Move, Plus, ZoomIn } from "lucide-react";
import { useRightPanel } from "@/contexts/right-panel-context";
import { CreativeStudioPanel } from "@/components/modules/creative-studio/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { WorkspaceHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";

const RECENT_PROJECTS = [
  { id: "1", name: "Tết Campaign 2025",     size: "A4",   layers: 8,  color: "#e53e3e" },
  { id: "2", name: "ZLP Summer Promotion",  size: "Social", layers: 5, color: "#0033c9" },
  { id: "3", name: "App Launch Banner Set", size: "Banner", layers: 12, color: "#00cf6a" },
  { id: "4", name: "ZaloPay Rewards",       size: "Social", layers: 6,  color: "#6366f1" },
];

function ProjectCard({ name, size, layers, color }: { name: string; size: string; layers: number; color: string }) {
  return (
    <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden group cursor-pointer hover:border-[var(--brand-default)] transition-all">
      <div
        className="relative w-full aspect-[4/3] flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${color}18, ${color}30)` }}
      >
        <div className="grid grid-cols-3 gap-1.5 p-4 opacity-60 group-hover:opacity-100 transition-opacity">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                height: i % 3 === 0 ? "20px" : i % 3 === 1 ? "14px" : "10px",
                background: color,
                opacity: 0.3 + (i * 0.1),
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="xs" variant="primary" icon={<Move size={10} />}>Mở</Button>
          <Button size="xs" variant="secondary" icon={<ZoomIn size={10} />}>Xem</Button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[13px] font-medium text-[var(--fg-default)] truncate">{name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="default" size="sm">{size}</Badge>
          <span className="text-[11px] text-[var(--fg-subtle)]"><Layers size={9} className="inline mr-0.5" />{layers} layers</span>
        </div>
      </div>
    </div>
  );
}

export default function CreativeStudioPage() {
  const { setContent } = useRightPanel();

  useEffect(() => {
    setContent(<CreativeStudioPanel />);
    return () => setContent(null);
  }, [setContent]);

  return (
    <div>
      <WorkspaceHeader
        title="Creative Studio"
        description="Canvas thiết kế tích hợp AI với brand guideline thông minh"
        icon={<Palette size={18} className="text-[#ec4899]" />}
        badge={<Badge variant="primary" size="sm">Beta</Badge>}
        actions={
          <Button variant="primary" size="sm" icon={<Plus size={14} />}>
            Dự án mới
          </Button>
        }
      />

      <div className="p-6">
        <Tabs
          variant="underline"
          defaultValue="projects"
          items={[
            { id: "projects", label: "Dự án của tôi", badge: RECENT_PROJECTS.length },
            { id: "templates", label: "Templates" },
            { id: "canvas", label: "Canvas mới" },
          ]}
        >
          {(id) => {
            if (id === "projects") return (
              <div className="mt-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {RECENT_PROJECTS.map((p) => (
                    <ProjectCard key={p.id} {...p} />
                  ))}
                  <div className="border-2 border-dashed border-[var(--border-default)] rounded-[var(--radius-xl)] aspect-[4/3] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--brand-default)] transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-2)] group-hover:bg-[var(--brand-subtle)] flex items-center justify-center transition-colors">
                      <Plus size={16} className="text-[var(--fg-subtle)] group-hover:text-[var(--brand-default)]" />
                    </div>
                    <p className="text-[12.5px] text-[var(--fg-muted)]">Tạo mới</p>
                  </div>
                </div>
              </div>
            );
            if (id === "templates") return (
              <EmptyState
                icon={Palette}
                title="Templates đang cập nhật"
                description="Bộ sưu tập template ZaloPay sẽ có mặt sớm."
                size="sm"
              />
            );
            return (
              <div className="mt-5">
                <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5 text-center max-w-md mx-auto">
                  <Palette size={32} strokeWidth={1} className="text-[var(--fg-subtle)] mx-auto mb-3" />
                  <p className="text-[14px] font-semibold text-[var(--fg-default)] mb-1.5">Mở Canvas</p>
                  <p className="text-[12.5px] text-[var(--fg-muted)] mb-4">Chọn kích thước canvas để bắt đầu thiết kế với AI</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {["A4 Print", "Social 1:1", "Web Banner", "Custom"].map((s) => (
                      <button key={s} className="px-3 py-2 rounded-[var(--radius-md)] text-[13px] border border-[var(--border-default)] text-[var(--fg-muted)] hover:border-[var(--brand-default)] hover:text-[var(--brand-default)] transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                  <Button variant="primary" icon={<Plus size={14} />}>Tạo canvas</Button>
                </div>
              </div>
            );
          }}
        </Tabs>
      </div>
    </div>
  );
}
