"use client";

import { useEffect } from "react";
import { Clock, Search, Image as ImageIcon, Video, FileText, Sparkles, Download, Star } from "lucide-react";
import { useRightPanel } from "@/contexts/right-panel-context";
import { Badge } from "@/components/ui/badge";
import { WorkspaceHeader } from "@/components/ui/section";
import { Tabs } from "@/components/ui/tabs";

const HISTORY_ITEMS = [
  {
    id: "1",
    type: "banner",   icon: ImageIcon,  color: "#0033c9",
    title: "Banner Tết 2025 — Flash Sale",
    module: "Banner Generator",
    time: "10 phút trước",
    status: "done",
  },
  {
    id: "2",
    type: "image",    icon: Sparkles,   color: "#6366f1",
    title: "Zalopay hero image — blue gradient",
    module: "Image Generator",
    time: "45 phút trước",
    status: "done",
  },
  {
    id: "3",
    type: "prompt",   icon: FileText,   color: "#06b6d4",
    title: "Flash Sale Copy — tối ưu hóa",
    module: "Prompt Studio",
    time: "2 giờ trước",
    status: "done",
  },
  {
    id: "4",
    type: "video",    icon: Video,      color: "#8b5cf6",
    title: "Zalopay x VinFast — 30s video",
    module: "Video Generator",
    time: "Hôm qua, 15:30",
    status: "done",
  },
  {
    id: "5",
    type: "banner",   icon: ImageIcon,  color: "#e53e3e",
    title: "Cashback Campaign — 4 variants",
    module: "Banner Generator",
    time: "Hôm qua, 09:15",
    status: "done",
  },
  {
    id: "6",
    type: "image",    icon: Sparkles,   color: "#00cf6a",
    title: "App lifestyle photos — 7 images",
    module: "Image Generator",
    time: "2 ngày trước",
    status: "done",
  },
  {
    id: "7",
    type: "prompt",   icon: FileText,   color: "#06b6d4",
    title: "Feature announcement — 3 variants",
    module: "Prompt Studio",
    time: "3 ngày trước",
    status: "done",
  },
];

const MODULE_ICON_MAP: Record<string, string> = {
  banner: "#0033c9",
  image:  "#6366f1",
  prompt: "#06b6d4",
  video:  "#8b5cf6",
};

function HistoryRow({ title, module, time, color, icon: Icon, type }: typeof HISTORY_ITEMS[0]) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3 bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] group hover:border-[var(--brand-default)] cursor-pointer transition-all">
      <div
        className="w-8 h-8 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0"
        style={{ background: `${color}1a` }}
      >
        <Icon size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-medium text-[var(--fg-default)] truncate">{title}</p>
        <p className="text-[12px] text-[var(--fg-muted)] mt-0.5">{module}</p>
      </div>
      <div className="hidden md:flex items-center gap-3 shrink-0">
        <span className="text-[12px] text-[var(--fg-subtle)]">{time}</span>
        <Badge variant="success" size="sm">Hoàn thành</Badge>
      </div>
      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--bg-surface-2)] text-[var(--fg-muted)]">
          <Star size={13} />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--bg-surface-2)] text-[var(--fg-muted)]">
          <Download size={13} />
        </button>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { setContent } = useRightPanel();

  useEffect(() => {
    setContent(null);
    return () => setContent(null);
  }, [setContent]);

  return (
    <div>
      <WorkspaceHeader
        title="Lịch sử"
        description="Toàn bộ tác phẩm đã tạo trên Zalopay AI Platform"
        icon={<Clock size={18} className="text-[var(--brand-default)]" />}
      />

      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)]">
            <Search size={14} className="text-[var(--fg-subtle)] shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm lịch sử..."
              className="flex-1 text-[13.5px] bg-transparent outline-none text-[var(--fg-default)] placeholder:text-[var(--fg-subtle)]"
            />
          </div>
        </div>

        <Tabs
          variant="underline"
          defaultValue="all"
          items={[
            { id: "all",    label: "Tất cả",         badge: HISTORY_ITEMS.length },
            { id: "banner", label: "Banner" },
            { id: "image",  label: "Ảnh" },
            { id: "video",  label: "Video" },
            { id: "prompt", label: "Prompt" },
          ]}
        >
          {(id) => {
            const items = id === "all" ? HISTORY_ITEMS : HISTORY_ITEMS.filter((i) => i.type === id);
            return (
              <div className="mt-5 space-y-2">
                {items.map((item) => <HistoryRow key={item.id} {...item} />)}
              </div>
            );
          }}
        </Tabs>
      </div>
    </div>
  );
}
