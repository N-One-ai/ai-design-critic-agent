"use client";

import { useRef } from "react";
import { Image as ImageIcon, X, Upload } from "lucide-react";
import { PanelSection } from "@/components/ui/card";
import { PrimaryActionButton, type CTAState } from "@/components/ui/primary-action-button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import type { BannerFormValues, BannerStatus } from "@/lib/types";

// ── Platform → dimension mapping ──────────────────────────────────────────────

const PLATFORMS = [
  { id: "facebook",  label: "Facebook / LinkedIn",    sub: "1200 × 628",  dims: { width: 1200, height: 628  } },
  { id: "instagram", label: "Instagram Feed",         sub: "1080 × 1080", dims: { width: 1080, height: 1080 } },
  { id: "story",     label: "Story / Reels / TikTok", sub: "1080 × 1920", dims: { width: 1080, height: 1920 } },
  { id: "web",       label: "Web Banner",             sub: "728 × 90",    dims: { width: 728,  height: 90   } },
] as const;

const STYLES = ["Modern", "Minimal", "Bold", "Festive", "Corporate"] as const;

// ── Component ─────────────────────────────────────────────────────────────────

interface BannerGeneratorPanelProps {
  formValues: BannerFormValues;
  onChange: (patch: Partial<BannerFormValues>) => void;
  onGenerate: () => void;
  status: BannerStatus;
}

async function imageFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX   = 768;
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error("canvas ctx")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("img load")); };
    img.src = url;
  });
}

export function BannerGeneratorPanel({
  formValues,
  onChange,
  onGenerate,
  status,
}: BannerGeneratorPanelProps) {
  const refFileInput = useRef<HTMLInputElement>(null);
  const isLoading    = status === "loading";
  const ctaState: CTAState =
    status === "loading" ? "loading" :
    status === "done"    ? "success" :
    status === "error"   ? "error"   : "idle";

  async function handleRefImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await imageFileToDataUrl(file);
      onChange({ referenceImageDataUrl: dataUrl });
    } catch {
      // silently skip on canvas / load errors
    }
    e.target.value = ""; // allow re-selection of the same file
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border-default)]">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--brand-subtle)] flex items-center justify-center">
          <ImageIcon size={15} strokeWidth={2} className="text-[var(--brand-default)]" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[var(--fg-default)]">Banner Generator</div>
          <div className="text-[11px] text-[var(--fg-subtle)]">Tạo banner tự động với AI</div>
        </div>
        <Badge variant="primary" size="sm" className="ml-auto">Beta</Badge>
      </div>

      {/* ── Scrollable form ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Campaign objective */}
        <PanelSection title="Mục tiêu chiến dịch *">
          <Textarea
            placeholder="VD: Tăng tải app Zalopay dịp Tết, khuyến mãi hoàn tiền 20%..."
            value={formValues.campaignObjective}
            onChange={(e) => onChange({ campaignObjective: e.target.value })}
            rows={3}
            disabled={isLoading}
          />
        </PanelSection>

        {/* Promotion */}
        <PanelSection title="Chương trình KM">
          <Input
            placeholder="VD: Giảm 50%, hoàn tiền 20.000đ..."
            value={formValues.promotion}
            onChange={(e) => onChange({ promotion: e.target.value })}
            disabled={isLoading}
          />
        </PanelSection>

        {/* Brand + Target audience in a 2-up grid */}
        <div className="grid grid-cols-2 gap-3">
          <PanelSection title="Thương hiệu">
            <Input
              placeholder="Zalopay"
              value={formValues.brand}
              onChange={(e) => onChange({ brand: e.target.value })}
              disabled={isLoading}
            />
          </PanelSection>
          <PanelSection title="Đối tượng KH">
            <Input
              placeholder="Gen Z, đô thị..."
              value={formValues.targetAudience}
              onChange={(e) => onChange({ targetAudience: e.target.value })}
              disabled={isLoading}
            />
          </PanelSection>
        </div>

        {/* Platform selection (auto-sets dimensions) */}
        <PanelSection title="Nền tảng & kích thước">
          <div className="grid grid-cols-1 gap-1.5">
            {PLATFORMS.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] cursor-pointer border border-[var(--border-default)] hover:border-[var(--brand-default)] transition-colors has-[:checked]:border-[var(--brand-default)] has-[:checked]:bg-[var(--brand-subtle)]"
              >
                <input
                  type="radio"
                  name="platform"
                  checked={formValues.platform === p.id}
                  onChange={() => onChange({ platform: p.id, dimensions: p.dims })}
                  className="accent-[var(--brand-default)]"
                  disabled={isLoading}
                />
                <div>
                  <div className="text-[13px] font-medium text-[var(--fg-default)]">{p.label}</div>
                  <div className="text-[11px] text-[var(--fg-subtle)]">{p.sub}</div>
                </div>
              </label>
            ))}
          </div>
        </PanelSection>

        {/* Language toggle */}
        <PanelSection title="Ngôn ngữ banner">
          <div className="flex gap-2">
            {(["vi", "en"] as const).map((lang) => (
              <label key={lang} className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="language"
                  className="hidden peer"
                  checked={formValues.language === lang}
                  onChange={() => onChange({ language: lang })}
                  disabled={isLoading}
                />
                <span className="flex items-center justify-center py-2 text-[13px] font-medium rounded-[var(--radius-md)] border border-[var(--border-default)] text-[var(--fg-muted)] peer-checked:border-[var(--brand-default)] peer-checked:text-[var(--brand-default)] peer-checked:bg-[var(--brand-subtle)] transition-colors select-none">
                  {lang === "vi" ? "Tiếng Việt" : "English"}
                </span>
              </label>
            ))}
          </div>
        </PanelSection>

        {/* Visual style pills */}
        <PanelSection title="Phong cách thiết kế">
          <div className="flex flex-wrap gap-1.5">
            {STYLES.map((s) => (
              <label key={s} className="cursor-pointer">
                <input
                  type="radio"
                  name="style"
                  className="hidden peer"
                  checked={formValues.visualStyle === s}
                  onChange={() => onChange({ visualStyle: s })}
                  disabled={isLoading}
                />
                <span className="inline-block px-3 py-1.5 text-[12.5px] rounded-full border border-[var(--border-default)] text-[var(--fg-muted)] peer-checked:border-[var(--brand-default)] peer-checked:text-[var(--brand-default)] peer-checked:bg-[var(--brand-subtle)] hover:border-[var(--fg-muted)] transition-colors select-none">
                  {s}
                </span>
              </label>
            ))}
          </div>
        </PanelSection>

        {/* Optional reference image */}
        <PanelSection title="Ảnh tham khảo (tùy chọn)">
          <input
            ref={refFileInput}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleRefImageSelect}
          />
          {formValues.referenceImageDataUrl ? (
            <div className="relative rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-default)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formValues.referenceImageDataUrl}
                alt="Ảnh tham khảo"
                className="w-full max-h-28 object-cover"
              />
              <button
                type="button"
                onClick={() => onChange({ referenceImageDataUrl: undefined })}
                disabled={isLoading}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors disabled:opacity-50"
                title="Xóa ảnh tham khảo"
              >
                <X size={11} className="text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => refFileInput.current?.click()}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-[var(--radius-md)] border border-dashed border-[var(--border-default)] text-[12.5px] text-[var(--fg-muted)] hover:border-[var(--brand-default)] hover:text-[var(--brand-default)] hover:bg-[var(--brand-subtle)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={14} />
              Chọn ảnh tham khảo (PNG, JPG, WEBP)
            </button>
          )}
        </PanelSection>

      </div>

      {/* ── Generate button ───────────────────────────────────────────── */}
      <div className="px-5 py-4 border-t border-[var(--border-default)] shrink-0">
        <PrimaryActionButton
          label="Tạo banner ngay"
          loadingText="Đang tạo banner..."
          ctaState={ctaState}
          disabled={!formValues.campaignObjective.trim()}
          onClick={onGenerate}
        />
      </div>

    </div>
  );
}
