"use client";

import { Sparkles } from "lucide-react";
import { PanelSection } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-indicator";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import type { ImageStyle, ImageQuality, AspectRatio } from "@/lib/ai/types/image";

// ── Option definitions ────────────────────────────────────────────────────────

const STYLE_OPTIONS: { id: ImageStyle; label: string }[] = [
  { id: "realistic",    label: "Thực tế" },
  { id: "illustration", label: "Minh họa" },
  { id: "flat-design",  label: "Thiết kế phẳng" },
  { id: "3d-render",    label: "3D Render" },
  { id: "watercolor",   label: "Màu nước" },
  { id: "pixel-art",    label: "Pixel Art" },
  { id: "cinematic",    label: "Điện ảnh" },
  { id: "editorial",    label: "Biên tập" },
];

const RATIO_OPTIONS: { id: AspectRatio; label: string; sub: string }[] = [
  { id: "1:1",  label: "1:1",  sub: "Vuông" },
  { id: "16:9", label: "16:9", sub: "Ngang" },
  { id: "9:16", label: "9:16", sub: "Dọc" },
  { id: "4:3",  label: "4:3",  sub: "Cổ điển" },
  { id: "3:2",  label: "3:2",  sub: "Ảnh" },
];

const QUALITY_OPTIONS: { id: ImageQuality; label: string; sub: string }[] = [
  { id: "draft",    label: "Nháp",       sub: "Nhanh" },
  { id: "standard", label: "Tiêu chuẩn", sub: "Cân bằng" },
  { id: "hd",       label: "HD",         sub: "Chi tiết" },
  { id: "ultra-hd", label: "Siêu HD",    sub: "Tối đa" },
];

// ── OptionChip ────────────────────────────────────────────────────────────────

function OptionChip({
  selected,
  onClick,
  label,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sub?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex flex-col items-center justify-center px-2 py-2 rounded-[var(--radius-md)] border text-center transition-colors cursor-pointer select-none",
        selected
          ? "border-[var(--brand-default)] text-[var(--brand-default)] bg-[var(--brand-subtle)]"
          : "border-[var(--border-default)] text-[var(--fg-muted)] hover:border-[var(--fg-muted)]",
      ].join(" ")}
    >
      <span className={["text-[12px] font-medium leading-none", sub ? "mb-0.5" : ""].join(" ")}>
        {label}
      </span>
      {sub && <span className="text-[10px] opacity-70">{sub}</span>}
    </button>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────

export interface ImageGeneratorPanelProps {
  style: ImageStyle;
  onStyleChange: (s: ImageStyle) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (r: AspectRatio) => void;
  quality: ImageQuality;
  onQualityChange: (q: ImageQuality) => void;
  isLoading: boolean;
  canGenerate: boolean;
  onGenerate: () => void;
}

export function ImageGeneratorPanel({
  style,
  onStyleChange,
  aspectRatio,
  onAspectRatioChange,
  quality,
  onQualityChange,
  isLoading,
  canGenerate,
  onGenerate,
}: ImageGeneratorPanelProps) {
  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border-default)]">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--accent-subtle)] flex items-center justify-center">
          <Sparkles size={15} strokeWidth={2} className="text-[var(--accent-default)]" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[var(--fg-default)]">Image Generator</div>
          <div className="text-[11px] text-[var(--fg-subtle)]">Sinh ảnh sáng tạo bằng AI</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* AI Provider */}
        <PanelSection title="Nhà cung cấp AI">
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-[var(--radius-md)]">
            <StatusBadge status="online" label="Higgsfield — Nano Banana Pro" />
          </div>
        </PanelSection>

        {/* Tỷ lệ khung hình */}
        <PanelSection title="Tỷ lệ khung hình">
          <div className="grid grid-cols-3 gap-1.5">
            {RATIO_OPTIONS.map((r) => (
              <OptionChip
                key={r.id}
                label={r.label}
                sub={r.sub}
                selected={aspectRatio === r.id}
                onClick={() => onAspectRatioChange(r.id)}
              />
            ))}
          </div>
        </PanelSection>

        {/* Phong cách */}
        <PanelSection title="Phong cách">
          <div className="flex flex-wrap gap-1.5">
            {STYLE_OPTIONS.map((s) => (
              <OptionChip
                key={s.id}
                label={s.label}
                selected={style === s.id}
                onClick={() => onStyleChange(s.id)}
              />
            ))}
          </div>
        </PanelSection>

        {/* Chất lượng */}
        <PanelSection title="Chất lượng">
          <div className="grid grid-cols-2 gap-1.5">
            {QUALITY_OPTIONS.map((q) => (
              <OptionChip
                key={q.id}
                label={q.label}
                sub={q.sub}
                selected={quality === q.id}
                onClick={() => onQualityChange(q.id)}
              />
            ))}
          </div>
        </PanelSection>

      </div>

      {/* Generate button — sticky footer */}
      <div className="px-5 py-4 border-t border-[var(--border-default)]">
        <PrimaryActionButton
          label="Tạo ảnh ngay"
          loadingText="Đang tạo ảnh..."
          ctaState={isLoading ? "loading" : "idle"}
          disabled={!canGenerate}
          onClick={onGenerate}
        />
      </div>

    </div>
  );
}
