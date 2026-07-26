"use client";

import { useEffect } from "react";
import { Star, Image as ImageIcon, FileText, Video, Sparkles, Download, Trash2 } from "lucide-react";
import { useRightPanel } from "@/contexts/right-panel-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkspaceHeader } from "@/components/ui/section";
import { Tabs } from "@/components/ui/tabs";
import Link from "next/link";

const FAVORITES = [
  {
    id: "1",
    type: "banner", icon: ImageIcon, color: "#e53e3e",
    title: "Banner Tết 2025 — Premium",
    module: "Banner Generator", time: "2 ngày trước",
  },
  {
    id: "2",
    type: "image",  icon: Sparkles,  color: "#6366f1",
    title: "ZaloPay Hero — Blue Sky",
    module: "Image Generator",  time: "3 ngày trước",
  },
  {
    id: "3",
    type: "prompt", icon: FileText,  color: "#06b6d4",
    title: "Flash Sale Vietnamese Copy",
    module: "Prompt Studio",    time: "5 ngày trước",
  },
  {
    id: "4",
    type: "banner", icon: ImageIcon, color: "#0033c9",
    title: "App Download Campaign",
    module: "Banner Generator", time: "1 tuần trước",
  },
];

function FavoriteCard({ title, module, time, color, icon: Icon }: typeof FAVORITES[0]) {
  return (
    <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden group cursor-pointer hover:border-[var(--brand-default)] transition-all">
      <div
        className="w-full aspect-video flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${color}18, ${color}35)` }}
      >
        <Icon size={28} strokeWidth={1} style={{ color }} className="opacity-30 group-hover:opacity-60 transition-opacity" />
        <div className="absolute top-2 right-2 flex gap-1.5">
          <Star size={13} className="text-amber-400 fill-amber-400" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/50 to-transparent">
          <Button size="xs" variant="primary" icon={<Download size={10} />}>Tải về</Button>
          <button className="w-6 h-6 rounded flex items-center justify-center bg-white/20 text-white hover:bg-red-500/40 transition-colors">
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[13px] font-semibold text-[var(--fg-default)] truncate">{title}</p>
        <div className="flex items-center justify-between mt-1">
          <Badge variant="default" size="sm">{module}</Badge>
          <span className="text-[11px] text-[var(--fg-subtle)]">{time}</span>
        </div>
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const { setContent } = useRightPanel();

  useEffect(() => {
    setContent(null);
    return () => setContent(null);
  }, [setContent]);

  return (
    <div>
      <WorkspaceHeader
        title="Yêu thích"
        description="Nội dung đã đánh dấu để truy cập nhanh"
        icon={<Star size={18} className="text-amber-400" />}
      />

      <div className="p-4 sm:p-6">
        <Tabs
          variant="underline"
          defaultValue="all"
          items={[
            { id: "all",    label: "Tất cả",  badge: FAVORITES.length },
            { id: "banner", label: "Banner" },
            { id: "image",  label: "Ảnh" },
            { id: "prompt", label: "Prompt" },
          ]}
        >
          {(id) => {
            const items = id === "all" ? FAVORITES : FAVORITES.filter((f) => f.type === id);
            if (!items.length) return (
              <div className="mt-10 text-center">
                <Star size={32} strokeWidth={1} className="text-[var(--fg-subtle)] mx-auto mb-3" />
                <p className="text-[14px] font-semibold text-[var(--fg-default)] mb-1">Chưa có mục yêu thích</p>
                <p className="text-[13px] text-[var(--fg-muted)] mb-5">
                  Nhấn ⭐ trên bất kỳ nội dung nào để lưu vào đây.
                </p>
                <Link href="/banner-generator" className="text-[13px] font-medium text-[var(--brand-default)] hover:underline">
                  Thử Banner Generator →
                </Link>
              </div>
            );
            return (
              <div className="mt-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((f) => <FavoriteCard key={f.id} {...f} />)}
              </div>
            );
          }}
        </Tabs>
      </div>
    </div>
  );
}
