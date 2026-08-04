"use client";

import { useEffect } from "react";
import { FolderOpen, Plus, Users, Clock, Star, MoreHorizontal } from "lucide-react";
import { useRightPanel } from "@/contexts/right-panel-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { WorkspaceHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";

const PROJECTS = [
  {
    id: "1",
    name: "Tết Nguyên Đán 2025",
    desc: "Campaign tết với đầy đủ banner, social post và video",
    status: "active",
    assets: 24,
    members: 4,
    updated: "2 giờ trước",
    color: "#e53e3e",
  },
  {
    id: "2",
    name: "Zalopay x VinFast",
    desc: "Partnership campaign — banner, landing page assets",
    status: "active",
    assets: 12,
    members: 3,
    updated: "1 ngày trước",
    color: "#0033c9",
  },
  {
    id: "3",
    name: "Summer Cashback 2025",
    desc: "Chiến dịch cashback mùa hè với nhiều định dạng",
    status: "review",
    assets: 18,
    members: 5,
    updated: "3 ngày trước",
    color: "#f59e0b",
  },
  {
    id: "4",
    name: "App Rebranding v3",
    desc: "Cập nhật bộ nhận diện thương hiệu mới theo DS v3",
    status: "done",
    assets: 56,
    members: 6,
    updated: "1 tuần trước",
    color: "#6366f1",
  },
  {
    id: "5",
    name: "ZLP Loyalty Program",
    desc: "Thiết kế toàn bộ assets cho chương trình tích điểm",
    status: "done",
    assets: 32,
    members: 3,
    updated: "2 tuần trước",
    color: "#00cf6a",
  },
];

const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "default" }> = {
  active: { label: "Đang làm",  variant: "success" },
  review: { label: "Đang duyệt", variant: "warning" },
  done:   { label: "Hoàn thành", variant: "default" },
};

const AVATAR_COLORS = ["#0033c9", "#00cf6a", "#e53e3e", "#f59e0b", "#8b5cf6", "#ec4899"];

function AvatarGroup({ count }: { count: number }) {
  return (
    <div className="flex items-center">
      {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
        <div
          key={i}
          className="-ml-1.5 first:ml-0 w-5 h-5 rounded-full border-2 border-[var(--bg-surface-1)] flex items-center justify-center text-[8px] font-bold text-white"
          style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
        >
          {String.fromCharCode(65 + i)}
        </div>
      ))}
      {count > 4 && (
        <div className="-ml-1.5 w-5 h-5 rounded-full border-2 border-[var(--bg-surface-1)] bg-[var(--bg-surface-2)] flex items-center justify-center text-[8px] text-[var(--fg-muted)]">
          +{count - 4}
        </div>
      )}
    </div>
  );
}

function ProjectRow({ name, desc, status, assets, members, updated, color }: typeof PROJECTS[0]) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] group hover:border-[var(--brand-default)] cursor-pointer transition-all">
      <div
        className="w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0"
        style={{ background: `${color}22` }}
      >
        <FolderOpen size={16} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-[var(--fg-default)] truncate">{name}</p>
        <p className="text-[12px] text-[var(--fg-muted)] truncate mt-0.5">{desc}</p>
      </div>
      <div className="hidden md:flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1 text-[12px] text-[var(--fg-subtle)]">
          <FolderOpen size={11} />
          {assets}
        </div>
        <AvatarGroup count={members} />
        <div className="flex items-center gap-1 text-[12px] text-[var(--fg-subtle)]">
          <Clock size={11} />
          {updated}
        </div>
        <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
      </div>
      <button className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-md)] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-[var(--bg-surface-2)] text-[var(--fg-muted)] transition-all">
        <MoreHorizontal size={14} />
      </button>
    </div>
  );
}

export default function ProjectsPage() {
  const { setContent } = useRightPanel();

  useEffect(() => {
    setContent(null);
    return () => setContent(null);
  }, [setContent]);

  return (
    <div>
      <WorkspaceHeader
        title="Projects"
        description="Quản lý tất cả dự án thiết kế của bạn"
        icon={<FolderOpen size={18} className="text-[var(--brand-default)]" />}
        actions={
          <Button variant="primary" size="sm" icon={<Plus size={14} />}>
            Dự án mới
          </Button>
        }
      />

      <div className="p-4 sm:p-6">
        <Tabs
          variant="underline"
          defaultValue="all"
          items={[
            { id: "all",     label: "Tất cả",      badge: PROJECTS.length },
            { id: "active",  label: "Đang làm",    badge: PROJECTS.filter((p) => p.status === "active").length },
            { id: "review",  label: "Đang duyệt",  badge: PROJECTS.filter((p) => p.status === "review").length },
            { id: "done",    label: "Hoàn thành",  badge: PROJECTS.filter((p) => p.status === "done").length },
          ]}
        >
          {(id) => {
            const filtered = id === "all" ? PROJECTS : PROJECTS.filter((p) => p.status === id);
            if (!filtered.length) return (
              <EmptyState
                icon={FolderOpen}
                title="Không có dự án"
                description="Tạo dự án mới để bắt đầu."
                action={<Button size="sm" icon={<Plus size={14} />}>Tạo dự án</Button>}
              />
            );
            return (
              <div className="mt-5 space-y-2">
                {filtered.map((p) => <ProjectRow key={p.id} {...p} />)}
                <div className="flex items-center gap-3 px-4 py-3.5 border-2 border-dashed border-[var(--border-default)] rounded-[var(--radius-xl)] cursor-pointer hover:border-[var(--brand-default)] transition-colors group">
                  <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-[var(--bg-surface-2)] group-hover:bg-[var(--brand-subtle)] flex items-center justify-center">
                    <Plus size={16} className="text-[var(--fg-subtle)] group-hover:text-[var(--brand-default)]" />
                  </div>
                  <p className="text-[13px] text-[var(--fg-muted)]">Tạo dự án mới</p>
                </div>
              </div>
            );
          }}
        </Tabs>
      </div>
    </div>
  );
}
