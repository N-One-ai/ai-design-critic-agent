"use client";

import { useEffect } from "react";
import { Sparkles, Download, Grid, Plus, Heart } from "lucide-react";
import { useRightPanel } from "@/contexts/right-panel-context";
import { ImageGeneratorPanel } from "@/components/modules/image-generator/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { WorkspaceHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";

const GALLERY_ITEMS = [
  { id: "1", prompt: "ZaloPay fintech hero — blue gradient",  w: 2, h: 1, colors: ["#0033c9", "#3b5bdb"] },
  { id: "2", prompt: "Vietnamese mobile payment — lifestyle", w: 1, h: 1, colors: ["#00cf6a", "#00a354"] },
  { id: "3", prompt: "ZaloPay festival celebration",          w: 1, h: 2, colors: ["#e53e3e", "#c53030"] },
  { id: "4", prompt: "Abstract fintech background",           w: 1, h: 1, colors: ["#6366f1", "#4f46e5"] },
  { id: "5", prompt: "ZaloPay QR payment scene",              w: 1, h: 1, colors: ["#0033c9", "#00cf6a"] },
  { id: "6", prompt: "Young professional using ZaloPay",      w: 2, h: 1, colors: ["#f59e0b", "#d97706"] },
  { id: "7", prompt: "Digital wallet concept art",             w: 1, h: 1, colors: ["#06b6d4", "#0891b2"] },
];

function ImagePlaceholder({ item }: { item: typeof GALLERY_ITEMS[0] }) {
  const [c1, c2] = item.colors;
  return (
    <div
      className="relative rounded-[var(--radius-lg)] overflow-hidden group cursor-pointer"
      style={{
        aspectRatio: item.w > item.h ? "16/9" : item.h > item.w ? "9/16" : "1/1",
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles size={24} strokeWidth={1} className="text-white/30" />
      </div>
      <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-end p-3">
        <div className="w-full">
          <p className="text-[11px] text-white/80 leading-snug line-clamp-2">{item.prompt}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Button size="xs" variant="primary" icon={<Download size={10} />}>Save</Button>
            <button className="w-6 h-6 rounded flex items-center justify-center bg-white/20 text-white">
              <Heart size={11} />
            </button>
          </div>
        </div>
      </div>
      <div className="absolute top-2 left-2">
        <span className="text-[9px] font-bold text-white/80 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded">AI</span>
      </div>
    </div>
  );
}

export default function ImageGeneratorPage() {
  const { setContent } = useRightPanel();

  useEffect(() => {
    setContent(<ImageGeneratorPanel />);
    return () => setContent(null);
  }, [setContent]);

  return (
    <div>
      <WorkspaceHeader
        title="Image Generator"
        description="Sinh ảnh sáng tạo chất lượng cao từ mô tả văn bản"
        icon={<Sparkles size={18} className="text-[var(--accent-default)]" />}
        badge={<Badge variant="accent" size="sm">Beta</Badge>}
        actions={<Button variant="secondary" size="sm" icon={<Grid size={14} />}>Gallery</Button>}
      />

      <div className="p-4 sm:p-6">
        <Tabs
          variant="underline"
          defaultValue="generate"
          items={[
            { id: "generate",  label: "Tạo ảnh mới" },
            { id: "gallery",   label: "Gallery mẫu", badge: GALLERY_ITEMS.length },
            { id: "my-images", label: "Ảnh của tôi", badge: 0 },
          ]}
        >
          {(id) => {
            if (id === "generate") return (
              <div className="mt-5 max-w-2xl">
                <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5 mb-6">
                  <p className="text-[13px] font-semibold text-[var(--fg-default)] mb-3">Mô tả hình ảnh</p>
                  <textarea
                    rows={4}
                    placeholder="A vibrant ZaloPay branded hero image, featuring a smiling Vietnamese person using a mobile phone with ZaloPay app, surrounded by colorful payment icons, modern fintech aesthetic, blue and green color palette..."
                    className="w-full px-4 py-3 text-[14px] bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-[var(--radius-lg)] outline-none resize-none text-[var(--fg-default)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--brand-default)] transition-colors"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" size="sm">Realistic</Badge>
                      <Badge variant="default" size="sm">1:1</Badge>
                      <Badge variant="default" size="sm">Standard</Badge>
                    </div>
                    <Button variant="primary" icon={<Sparkles size={14} />}>Tạo ảnh</Button>
                  </div>
                </div>
                <div>
                  <p className="type-label text-[var(--fg-subtle)] mb-3">Prompt gợi ý</p>
                  <div className="flex flex-wrap gap-2">
                    {["ZaloPay hero banner", "Vietnamese lifestyle", "Abstract gradient", "Mobile UI mockup"].map((p) => (
                      <button key={p} className="px-3 py-1.5 text-[12.5px] rounded-full border border-[var(--border-default)] text-[var(--fg-muted)] hover:border-[var(--brand-default)] hover:text-[var(--brand-default)] transition-colors">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
            if (id === "gallery") return (
              <div className="mt-5 columns-2 lg:columns-3 gap-4 space-y-4">
                {GALLERY_ITEMS.map((item) => (
                  <div key={item.id} className="break-inside-avoid">
                    <ImagePlaceholder item={item} />
                  </div>
                ))}
              </div>
            );
            return (
              <EmptyState
                icon={Sparkles}
                title="Chưa có ảnh nào"
                description="Nhập prompt và nhấn Tạo ảnh để sinh ra những hình ảnh độc đáo."
                action={<Button size="sm" icon={<Plus size={14} />}>Tạo ảnh đầu tiên</Button>}
              />
            );
          }}
        </Tabs>
      </div>
    </div>
  );
}
