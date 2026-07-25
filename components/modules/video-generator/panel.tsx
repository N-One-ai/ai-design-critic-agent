"use client";

import { Video, Sparkles } from "lucide-react";
import { PanelSection } from "@/components/ui/card";
import { GenerateButton } from "@/components/ui/generate-button";
import { StatusBadge } from "@/components/ui/status-indicator";
import { Badge } from "@/components/ui/badge";

const DURATIONS = ["15s", "30s", "60s", "120s"];
const RESOLUTIONS = ["720p", "1080p", "4K"];
const STYLES = ["Corporate", "Animated", "Cinematic", "Social Media", "Product Demo"];

export function VideoGeneratorPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border-default)]">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[rgba(139,92,246,0.15)] flex items-center justify-center">
          <Video size={15} strokeWidth={2} className="text-[#8b5cf6]" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[var(--fg-default)]">Video Generator</div>
          <div className="text-[11px] text-[var(--fg-subtle)]">Tạo video marketing tự động</div>
        </div>
        <Badge variant="default" size="sm" className="ml-auto">Soon</Badge>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <PanelSection title="Mô hình AI">
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-[var(--radius-md)]">
            <StatusBadge status="idle" label="Veo 2 (Google) — Sắp ra mắt" />
          </div>
        </PanelSection>

        <PanelSection title="Script / Mô tả">
          <textarea
            placeholder="Mô tả nội dung video... VD: Video giới thiệu tính năng mới của ZaloPay, phong cách trẻ trung, năng động, nhấn mạnh sự tiện lợi"
            rows={5}
            className="w-full px-3 py-2.5 text-[13px] bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-md)] outline-none resize-none text-[var(--fg-default)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--brand-default)] transition-colors"
          />
        </PanelSection>

        <PanelSection title="Thời lượng">
          <div className="grid grid-cols-4 gap-1.5">
            {DURATIONS.map((d, i) => (
              <label key={d} className="cursor-pointer">
                <input type="radio" name="duration" className="hidden peer" defaultChecked={i === 1} />
                <span className="flex items-center justify-center py-2 text-[13px] font-medium rounded-[var(--radius-md)] border border-[var(--border-default)] text-[var(--fg-muted)] peer-checked:border-[var(--brand-default)] peer-checked:text-[var(--brand-default)] peer-checked:bg-[var(--brand-subtle)] hover:border-[var(--fg-muted)] transition-colors cursor-pointer">
                  {d}
                </span>
              </label>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Độ phân giải">
          <div className="grid grid-cols-3 gap-1.5">
            {RESOLUTIONS.map((r, i) => (
              <label key={r} className="cursor-pointer">
                <input type="radio" name="res" className="hidden peer" defaultChecked={i === 1} />
                <span className="flex items-center justify-center py-2 text-[13px] font-medium rounded-[var(--radius-md)] border border-[var(--border-default)] text-[var(--fg-muted)] peer-checked:border-[var(--brand-default)] peer-checked:text-[var(--brand-default)] peer-checked:bg-[var(--brand-subtle)] hover:border-[var(--fg-muted)] transition-colors cursor-pointer">
                  {r}
                </span>
              </label>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Phong cách">
          <div className="flex flex-wrap gap-1.5">
            {STYLES.map((s, i) => (
              <label key={s} className="cursor-pointer">
                <input type="radio" name="vstyle" className="hidden peer" defaultChecked={i === 0} />
                <span className="inline-block px-2.5 py-1.5 text-[12px] rounded-full border border-[var(--border-default)] text-[var(--fg-muted)] peer-checked:border-[var(--brand-default)] peer-checked:text-[var(--brand-default)] peer-checked:bg-[var(--brand-subtle)] hover:border-[var(--fg-muted)] transition-colors cursor-pointer">
                  {s}
                </span>
              </label>
            ))}
          </div>
        </PanelSection>
      </div>

      <div className="px-5 py-4 border-t border-[var(--border-default)] shrink-0">
        <GenerateButton fullWidth icon={<Sparkles size={15} />} disabled variant="default">
          Sắp ra mắt
        </GenerateButton>
        <p className="text-[11px] text-[var(--fg-subtle)] text-center mt-2">
          Đăng ký nhận thông báo khi tính năng này sẵn sàng
        </p>
      </div>
    </div>
  );
}
