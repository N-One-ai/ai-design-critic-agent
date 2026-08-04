"use client";

import { useState } from "react";
import { Image as ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import { PanelSection } from "@/components/ui/card";
import { PrimaryActionButton, type CTAState } from "@/components/ui/primary-action-button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import type { BannerHeroStyle, BannerStatus, BannerTemplateValues } from "@/lib/types";
import { FontSizeSlider } from "./font-size-slider";
import { TaglineAlignmentSelector } from "./tagline-alignment-selector";
import { HeroImageControls } from "./hero-image-controls";
import { HeroBlendSlider } from "./hero-blend-slider";
import { LogoVariantSelector } from "./logo-variant-selector";
import {
  BANNER_T1_FS_DEFAULT, BANNER_T1_FS_MIN, BANNER_T1_FS_MAX,
  BANNER_T2_FS_DEFAULT, BANNER_T2_FS_MIN, BANNER_T2_FS_MAX,
  BANNER_T1_TEXT_TRANSFORM_DEFAULT,
  BANNER_T1_ALIGN_DEFAULT,
  BANNER_T2_ALIGN_DEFAULT,
  BANNER_HERO_BLEND_DEFAULT,
} from "./banner-canvas";
import { type HeroTransform } from "./use-hero-drag";

// ── Hero style options ────────────────────────────────────────────────────────

const HERO_STYLES: { id: BannerHeroStyle; label: string; sub: string }[] = [
  { id: "Modern",    label: "Modern",    sub: "Lifestyle, tự nhiên"    },
  { id: "Festive",   label: "Festive",   sub: "Lễ hội, rực rỡ"        },
  { id: "Minimal",   label: "Minimal",   sub: "Studio, tối giản"       },
  { id: "Bold",      label: "Bold",      sub: "Mạnh mẽ, tương phản"   },
  { id: "Corporate", label: "Corporate", sub: "Chuyên nghiệp, doanh nghiệp" },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface BannerGeneratorPanelProps {
  formValues:          BannerTemplateValues;
  onChange:            (patch: Partial<BannerTemplateValues>) => void;
  onGenerate:          () => void;
  status:              BannerStatus;
  heroImageUrl?:       string | null;
  heroTransform?:      HeroTransform;
  heroMaxOffsetX?:     number;
  heroMaxOffsetY?:     number;
  onTransformChange?:  (t: HeroTransform) => void;
  onResetTransform?:   () => void;
  heroBlend?:          number;
  onBlendChange?:      (v: number) => void;
}

export function BannerGeneratorPanel({
  formValues,
  onChange,
  onGenerate,
  status,
  heroImageUrl,
  heroTransform,
  heroMaxOffsetX,
  heroMaxOffsetY,
  onTransformChange,
  onResetTransform,
  heroBlend,
  onBlendChange,
}: BannerGeneratorPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const isLoading = status === "loading";
  const ctaState: CTAState =
    status === "loading" ? "loading" :
    status === "done"    ? "success" :
    status === "error"   ? "error"   : "idle";

  const canGenerate = formValues.product.trim().length > 0;

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border-default)]">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--brand-subtle)] flex items-center justify-center">
          <ImageIcon size={15} strokeWidth={2} className="text-[var(--brand-default)]" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[var(--fg-default)]">Banner Generator</div>
          <div className="text-[11px] text-[var(--fg-subtle)]">Template Zalopay chuẩn thương hiệu</div>
        </div>
        <Badge variant="primary" size="sm" className="ml-auto">Beta</Badge>
      </div>

      {/* ── Scrollable form ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* ── Logo variant ───────────────────────────────────────────────── */}
        <LogoVariantSelector
          value={formValues.logoVariant ?? "white"}
          onChange={(v) => onChange({ logoVariant: v })}
          disabled={isLoading}
        />

        {/* ── Taglines section ───────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="text-[11px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wide">
              Nội dung banner
            </div>
            <div className="flex-1 h-px bg-[var(--border-default)]" />
            <span className="text-[10.5px] text-[var(--fg-muted)]">Cập nhật ngay lập tức</span>
          </div>

          <div className="space-y-3">
            <PanelSection title="Tagline 1 — Label (hộp xanh nhỏ)">
              <Input
                placeholder="VD: Ưu đãi độc quyền"
                value={formValues.tagline1}
                onChange={(e) => onChange({ tagline1: e.target.value })}
                disabled={isLoading}
              />

              {/* Text Transform control */}
              <div className="flex items-center gap-3 mt-2.5">
                <span
                  className="text-[11px] shrink-0"
                  style={{ color: "var(--fg-muted)" }}
                >
                  Kiểu chữ
                </span>
                <div className="flex items-center gap-4">
                  {(
                    [
                      { value: "none",      label: "Giữ nguyên" },
                      { value: "uppercase", label: "IN HOA"     },
                    ] as const
                  ).map(({ value, label }) => (
                    <label key={value} className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="t1TextTransform"
                        value={value}
                        checked={(formValues.t1TextTransform ?? BANNER_T1_TEXT_TRANSFORM_DEFAULT) === value}
                        onChange={() => onChange({ t1TextTransform: value })}
                        className="accent-[var(--brand-default)]"
                        disabled={isLoading}
                      />
                      <span className="text-[11.5px] text-[var(--fg-default)]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* T1 alignment */}
              <div className="mt-2.5">
                <TaglineAlignmentSelector
                  value={formValues.t1Align ?? BANNER_T1_ALIGN_DEFAULT}
                  onChange={(v) => onChange({ t1Align: v })}
                  disabled={isLoading}
                />
              </div>

              <p className="text-[11px] text-[var(--fg-muted)] mt-1.5">
                Nền xanh #0033C9 · Aeonik Pro Bold
              </p>
            </PanelSection>

            <PanelSection title="Tagline 2 — Tiêu đề chính (chữ lớn)">
              <Textarea
                placeholder={"VD: Nạp Data 4G\nKhông mất tiền"}
                value={formValues.tagline2}
                onChange={(e) => onChange({ tagline2: e.target.value })}
                rows={3}
                disabled={isLoading}
              />

              {/* T2 alignment */}
              <div className="mt-2.5">
                <TaglineAlignmentSelector
                  value={formValues.t2Align ?? BANNER_T2_ALIGN_DEFAULT}
                  onChange={(v) => onChange({ t2Align: v })}
                  disabled={isLoading}
                />
              </div>

              <p className="text-[11px] text-[var(--fg-muted)] mt-1.5">
                Tối đa 2 dòng · xuống dòng bằng Enter · Aeonik Pro Bold
              </p>
            </PanelSection>
          </div>
        </div>

        {/* ── Typography controls ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="text-[11px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wide">
              Typography
            </div>
            <div className="flex-1 h-px bg-[var(--border-default)]" />
            <span className="text-[10.5px] text-[var(--fg-muted)]">Cập nhật ngay lập tức</span>
          </div>

          <div className="space-y-4">
            <FontSizeSlider
              label="Tagline 1 (hộp xanh nhỏ)"
              value={formValues.t1FontSize ?? BANNER_T1_FS_DEFAULT}
              defaultValue={BANNER_T1_FS_DEFAULT}
              min={BANNER_T1_FS_MIN}
              max={BANNER_T1_FS_MAX}
              step={1}
              disabled={isLoading}
              onChange={(v) => onChange({ t1FontSize: v })}
            />
            <FontSizeSlider
              label="Tagline 2 (tiêu đề chính)"
              value={formValues.t2FontSize ?? BANNER_T2_FS_DEFAULT}
              defaultValue={BANNER_T2_FS_DEFAULT}
              min={BANNER_T2_FS_MIN}
              max={BANNER_T2_FS_MAX}
              step={2}
              disabled={isLoading}
              onChange={(v) => onChange({ t2FontSize: v })}
            />
          </div>
        </div>

        {/* ── Hero image section ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="text-[11px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wide">
              Hình ảnh AI
            </div>
            <div className="flex-1 h-px bg-[var(--border-default)]" />
          </div>

          <div className="space-y-3">
            <PanelSection title="Sản phẩm / Chủ thể *">
              <Input
                placeholder="VD: smartphone hiện đại đang dùng ZaloPay, thanh toán thành công..."
                value={formValues.product}
                onChange={(e) => onChange({ product: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-[11px] text-[var(--fg-muted)] mt-1.5">
                AI sẽ tạo ảnh này và đặt vào vùng hero phía dưới
              </p>
            </PanelSection>

            <PanelSection title="Tên chiến dịch">
              <Input
                placeholder="VD: Tết Sale 2025, Flash Sale tháng 6..."
                value={formValues.campaignName}
                onChange={(e) => onChange({ campaignName: e.target.value })}
                disabled={isLoading}
              />
            </PanelSection>

            <PanelSection title="Đối tượng mục tiêu">
              <Input
                placeholder="VD: giới trẻ đô thị, chị em nội trợ..."
                value={formValues.audience}
                onChange={(e) => onChange({ audience: e.target.value })}
                disabled={isLoading}
              />
            </PanelSection>

            {/* Hero style selector */}
            <PanelSection title="Phong cách hình ảnh">
              <div className="space-y-1.5">
                {HERO_STYLES.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] cursor-pointer border border-[var(--border-default)] hover:border-[var(--brand-default)] transition-colors has-[:checked]:border-[var(--brand-default)] has-[:checked]:bg-[var(--brand-subtle)]"
                  >
                    <input
                      type="radio"
                      name="heroStyle"
                      checked={formValues.heroStyle === s.id}
                      onChange={() => onChange({ heroStyle: s.id })}
                      className="accent-[var(--brand-default)]"
                      disabled={isLoading}
                    />
                    <div>
                      <div className="text-[12.5px] font-medium text-[var(--fg-default)]">{s.label}</div>
                      <div className="text-[11px] text-[var(--fg-subtle)]">{s.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </PanelSection>
          </div>
        </div>

        {/* ── Hero image position controls ────────────────────────────────── */}
        {heroImageUrl && heroTransform && onTransformChange && onResetTransform && (
          <div>
            <HeroImageControls
              transform={heroTransform}
              onChange={onTransformChange}
              onReset={onResetTransform}
              disabled={isLoading}
              maxOffsetX={heroMaxOffsetX}
              maxOffsetY={heroMaxOffsetY}
            />
          </div>
        )}

        {/* ── Hoà nền (Hero image blend) ──────────────────────────────────── */}
        {heroImageUrl && onBlendChange && (
          <div className="px-3 py-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] space-y-2.5">
            <div>
              <div className="text-xs font-semibold text-[var(--fg-default)]">Hoà nền</div>
              <div className="text-[11px] text-[var(--fg-muted)] mt-0.5">
                Điều chỉnh mức độ hoà trộn giữa hình ảnh AI và nền banner.
              </div>
            </div>
            <HeroBlendSlider
              value={heroBlend ?? BANNER_HERO_BLEND_DEFAULT}
              onChange={onBlendChange}
              disabled={isLoading}
            />
          </div>
        )}

        {/* ── Advanced (collapsible) ──────────────────────────────────────── */}
        <div>
          <button
            type="button"
            className="flex items-center gap-2 w-full text-left group"
            onClick={() => setAdvancedOpen((v) => !v)}
          >
            <div className="text-[11px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wide group-hover:text-[var(--fg-default)] transition-colors">
              Nâng cao
            </div>
            <div className="flex-1 h-px bg-[var(--border-default)]" />
            {advancedOpen
              ? <ChevronUp size={13} className="text-[var(--fg-subtle)]" />
              : <ChevronDown size={13} className="text-[var(--fg-subtle)]" />}
          </button>

          {advancedOpen && (
            <div className="mt-3 space-y-3">
              <PanelSection title="Ghi đè prompt AI (tùy chọn)">
                <Textarea
                  placeholder="Nhập prompt trực tiếp để thay thế prompt tự động của AI..."
                  value={formValues.heroPromptOverride}
                  onChange={(e) => onChange({ heroPromptOverride: e.target.value })}
                  rows={4}
                  disabled={isLoading}
                />
                <p className="text-[11px] text-[var(--fg-muted)] mt-1.5">
                  Khi để trống, AI tự tạo prompt từ thông tin trên. Khi điền vào, AI sẽ dùng prompt này.
                </p>
              </PanelSection>
            </div>
          )}
        </div>

        {/* ── Brand lock notice ───────────────────────────────────────────── */}
        <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] px-3 py-2.5">
          <p className="text-[11.5px] text-[var(--fg-muted)] leading-relaxed">
            <span className="font-semibold text-[var(--fg-subtle)]">Khoá thương hiệu:</span>{" "}
            Logo ZaloPay, màu nền xanh (#00CF6A), và typography được render tự động.
            AI chỉ tạo ảnh hero subject ở vùng dưới.
          </p>
        </div>

      </div>

      {/* ── Generate button ──────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-t border-[var(--border-default)] shrink-0">
        <PrimaryActionButton
          label="Tạo Hero Image"
          loadingText="Đang tạo ảnh AI..."
          ctaState={ctaState}
          disabled={!canGenerate}
          onClick={onGenerate}
        />
        <p className="text-[11px] text-[var(--fg-muted)] text-center mt-2">
          Tagline và logo render ngay — chỉ ảnh hero cần AI
        </p>
      </div>

    </div>
  );
}
