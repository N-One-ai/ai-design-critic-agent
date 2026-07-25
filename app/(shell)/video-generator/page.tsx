"use client";

import { useEffect } from "react";
import { Video, Play, Clock, Plus } from "lucide-react";
import { useRightPanel } from "@/contexts/right-panel-context";
import { VideoGeneratorPanel } from "@/components/modules/video-generator/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { WorkspaceHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";

const SAMPLE_VIDEOS = [
  { id: "1", title: "ZaloPay Tết 2025 — 30s",  dur: "30s", status: "done",   color: "#e53e3e" },
  { id: "2", title: "Cashback Feature Launch",   dur: "15s", status: "done",   color: "#0033c9" },
  { id: "3", title: "App Download Campaign",     dur: "60s", status: "render", color: "#00cf6a" },
];

function VideoThumbnail({ color, title, dur, status }: { color: string; title: string; dur: string; status: string }) {
  return (
    <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden group cursor-pointer hover:border-[var(--brand-default)] transition-all">
      <div
        className="relative w-full aspect-video flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}
      >
        <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play size={20} className="text-white ml-0.5" />
        </div>
        <div
          className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold text-white"
          style={{ background: color }}
        >
          {dur}
        </div>
        {status === "render" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-1.5" />
              <p className="text-[11px] text-white/80">Đang render…</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[13px] font-medium text-[var(--fg-default)] truncate">{title}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {status === "done"
            ? <Badge variant="success" size="sm">Hoàn thành</Badge>
            : <Badge variant="warning" size="sm">Rendering</Badge>
          }
        </div>
      </div>
    </div>
  );
}

export default function VideoGeneratorPage() {
  const { setContent } = useRightPanel();

  useEffect(() => {
    setContent(<VideoGeneratorPanel />);
    return () => setContent(null);
  }, [setContent]);

  return (
    <div>
      <WorkspaceHeader
        title="Video Generator"
        description="Tạo video marketing ngắn tự động từ script và ảnh"
        icon={<Video size={18} className="text-[#8b5cf6]" />}
        badge={<Badge variant="default" size="sm">Soon</Badge>}
        actions={<Button variant="secondary" size="sm" icon={<Plus size={14} />}>Video mới</Button>}
      />

      <div className="p-6">
        <Tabs
          variant="underline"
          defaultValue="library"
          items={[
            { id: "library",  label: "Thư viện video", badge: SAMPLE_VIDEOS.length },
            { id: "generate", label: "Tạo mới" },
            { id: "recent",   label: "Gần đây" },
          ]}
        >
          {(id) => {
            if (id === "library") return (
              <div className="mt-5">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-[var(--radius-xl)] p-4 mb-6 flex items-start gap-3">
                  <Clock size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--fg-default)]">Tính năng sắp ra mắt</p>
                    <p className="text-[12.5px] text-[var(--fg-muted)] mt-0.5">Video Generator đang được phát triển với Veo 2. Các video dưới đây là mẫu demo.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SAMPLE_VIDEOS.map((v) => (
                    <VideoThumbnail key={v.id} {...v} />
                  ))}
                </div>
              </div>
            );
            if (id === "generate") return (
              <div className="mt-5 max-w-2xl">
                <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5">
                  <p className="text-[13px] font-semibold text-[var(--fg-default)] mb-3">Mô tả video</p>
                  <textarea
                    rows={4}
                    placeholder="Nhập script hoặc mô tả nội dung video..."
                    className="w-full px-4 py-3 text-[14px] bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-[var(--radius-lg)] outline-none resize-none text-[var(--fg-default)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--brand-default)] transition-colors"
                  />
                  <div className="mt-3">
                    <Button variant="primary" disabled icon={<Video size={14} />}>Tạo video (Soon)</Button>
                  </div>
                </div>
              </div>
            );
            return (
              <EmptyState
                icon={Clock}
                title="Chưa có video gần đây"
                description="Video bạn tạo gần đây sẽ xuất hiện ở đây."
                size="sm"
              />
            );
          }}
        </Tabs>
      </div>
    </div>
  );
}
