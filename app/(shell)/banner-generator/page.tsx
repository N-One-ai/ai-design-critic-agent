"use client";

import { useEffect } from "react";
import { Image as ImageIcon, Download, Filter, Grid, List, Plus, Star, Clock } from "lucide-react";
import { useRightPanel } from "@/contexts/right-panel-context";
import { BannerGeneratorPanel } from "@/components/modules/banner-generator/panel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { WorkspaceHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";

const TEMPLATES = [
  { id: "1",  name: "Tết Nguyên Đán",         cat: "Seasonal",  ratio: "16:9",  color: "#e53e3e" },
  { id: "2",  name: "Flash Sale 50%",           cat: "Promo",     ratio: "1:1",   color: "#0033c9" },
  { id: "3",  name: "ZaloPay Cashback",         cat: "Feature",   ratio: "16:9",  color: "#00cf6a" },
  { id: "4",  name: "App Download CTA",         cat: "CTA",       ratio: "16:9",  color: "#6366f1" },
  { id: "5",  name: "Momo vs ZaloPay",          cat: "Compare",   ratio: "1:1",   color: "#f59e0b" },
  { id: "6",  name: "ZLP Rewards Program",      cat: "Loyalty",   ratio: "16:9",  color: "#0033c9" },
  { id: "7",  name: "QR Code Story",            cat: "Social",    ratio: "9:16",  color: "#00cf6a" },
  { id: "8",  name: "Holiday Partnership",      cat: "Brand",     ratio: "16:9",  color: "#9333ea" },
];

function TemplateThumbnail({ color }: { color: string }) {
  return (
    <div
      className="w-full aspect-video rounded-[var(--radius-md)] relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)` }}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-white/20 flex items-center justify-center">
            <span className="text-[7px] font-bold text-white">ZP</span>
          </div>
          <div className="h-1.5 w-12 rounded-full" style={{ background: `${color}66` }} />
        </div>
        <div className="space-y-1">
          <div className="h-2 w-20 rounded-full" style={{ background: `${color}88` }} />
          <div className="h-1.5 w-14 rounded-full" style={{ background: `${color}55` }} />
          <div
            className="mt-2 px-3 py-1 rounded text-[7px] font-bold text-white inline-block"
            style={{ background: color }}
          >
            TÌM HIỂU NGAY
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BannerGeneratorPage() {
  const { setContent } = useRightPanel();

  useEffect(() => {
    setContent(<BannerGeneratorPanel />);
    return () => setContent(null);
  }, [setContent]);

  return (
    <div>
      <WorkspaceHeader
        title="Banner Generator"
        description="Tạo banner quảng cáo đúng chuẩn ZaloPay chỉ trong vài giây"
        icon={<ImageIcon size={18} className="text-[var(--brand-default)]" />}
        badge={<Badge variant="primary" size="sm">Beta</Badge>}
        actions={
          <Button variant="secondary" size="sm" icon={<Download size={14} />}>
            Xuất tất cả
          </Button>
        }
      />

      <div className="p-6">
        <Tabs
          variant="underline"
          defaultValue="templates"
          items={[
            { id: "templates", label: "Templates",    badge: TEMPLATES.length },
            { id: "my-banners",label: "Banner của tôi", badge: 0 },
            { id: "recent",    label: "Gần đây" },
          ]}
        >
          {(id) => {
            if (id === "templates") return (
              <div className="mt-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Tất cả</Badge>
                    <Badge variant="default">Seasonal</Badge>
                    <Badge variant="default">Promo</Badge>
                    <Badge variant="default">Social</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] bg-[var(--brand-subtle)] text-[var(--brand-default)]">
                      <Grid size={14} />
                    </button>
                    <button className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] hover:bg-[var(--bg-surface-2)] text-[var(--fg-muted)]">
                      <List size={14} />
                    </button>
                    <Button variant="ghost" size="sm" icon={<Filter size={13} />}>Lọc</Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {TEMPLATES.map((t) => (
                    <Card key={t.id} variant="default" padding="sm" interactive className="group cursor-pointer">
                      <div className="relative">
                        <TemplateThumbnail color={t.color} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-[var(--radius-md)] flex items-center justify-center">
                          <Button size="xs" variant="primary">Dùng template này</Button>
                        </div>
                        <button className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Star size={11} className="text-white" />
                        </button>
                      </div>
                      <div className="mt-2.5">
                        <p className="text-[13px] font-semibold text-[var(--fg-default)] truncate">{t.name}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="default" size="sm">{t.cat}</Badge>
                          <span className="text-[11px] text-[var(--fg-subtle)]">{t.ratio}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Card variant="flat" padding="sm" interactive className="flex flex-col items-center justify-center gap-2 min-h-[140px] cursor-pointer border-2 border-dashed">
                    <Plus size={20} className="text-[var(--fg-subtle)]" />
                    <p className="text-[12.5px] text-[var(--fg-muted)]">Tạo template mới</p>
                  </Card>
                </div>
              </div>
            );
            if (id === "my-banners") return (
              <EmptyState
                icon={ImageIcon}
                title="Chưa có banner nào"
                description="Chọn một template ở tab Templates và nhấn Tạo banner ngay để bắt đầu."
                action={<Button size="sm" icon={<Plus size={14} />}>Tạo banner đầu tiên</Button>}
              />
            );
            return (
              <EmptyState
                icon={Clock}
                title="Chưa có lịch sử"
                description="Các banner bạn tạo gần đây sẽ xuất hiện ở đây."
                size="sm"
              />
            );
          }}
        </Tabs>
      </div>
    </div>
  );
}
