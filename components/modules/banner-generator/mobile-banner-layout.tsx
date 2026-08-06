"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronDown, Download, RefreshCw, Maximize2, X, Image as ImageIcon,
  Plus, Type, Settings, Move, Palette,
} from "lucide-react";
import {
  BannerCanvas,
  BANNER_HERO_BLEND_DEFAULT,
  BANNER_T1_FS_DEFAULT, BANNER_T1_FS_MIN, BANNER_T1_FS_MAX,
  BANNER_T2_FS_DEFAULT, BANNER_T2_FS_MIN, BANNER_T2_FS_MAX,
  BANNER_T1_TEXT_TRANSFORM_DEFAULT, BANNER_T1_ALIGN_DEFAULT, BANNER_T2_ALIGN_DEFAULT,
  BANNER_LOGO_SCALE,
  BANNER_Z_ENABLED_DEFAULT,
  BANNER_Z_OPACITY_DEFAULT,
  BANNER_Z_SCALE_DEFAULT,
  BANNER_Z_OPACITY_MIN,
  BANNER_Z_OPACITY_MAX,
  BANNER_Z_SCALE_MIN,
  BANNER_Z_SCALE_MAX,
} from "./banner-canvas";
import { HeroImageControls } from "./hero-image-controls";
import { HeroBlendSlider } from "./hero-blend-slider";
import { BlendColorPicker } from "./blend-color-picker";
import { FontSizeSlider } from "./font-size-slider";
import { TaglineAlignmentSelector } from "./tagline-alignment-selector";
import { LogoVariantSelector } from "./logo-variant-selector";
import { TypographyColorPicker } from "./typography-color-picker";
import { PrimaryActionButton, type CTAState } from "@/components/ui/primary-action-button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs } from "@/components/ui/tabs";
import { LOGO_VARIANT_DEFAULT } from "@/lib/assets/logo-assets";
import { BLEND_COLOR_DEFAULT, BLEND_OPACITY_RESET } from "@/lib/brand/blend-presets";
import { T_COLOR_DEFAULT, T_OPACITY_DEFAULT } from "@/lib/brand/typography-presets";
import { Z_COLOR_PRESETS } from "@/lib/brand/z-trademark";
import type {
  BannerTemplateValues, BannerHeroStyle, BannerStatus, BannerResult,
} from "@/lib/types";
import type { HeroTransform, HeroBounds } from "./use-hero-drag";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface MobileBannerLayoutProps {
  formValues:        BannerTemplateValues;
  heroImageUrl:      string | null;
  heroTransform:     HeroTransform;
  heroBounds:        HeroBounds | null;
  heroMaxOffsets:    { maxX: number; maxY: number };
  onHeroBoundsReady: (bounds: HeroBounds) => void;
  onRenderComplete:  (dataUrl: string) => void;
  status:            BannerStatus;
  error:             string;
  heroPromptUsed:    string;
  history:           BannerResult[];
  activeTab:         string;
  onChange:          (patch: Partial<BannerTemplateValues>) => void;
  onGenerate:        () => void;
  onExport:          () => void;
  onTransformChange: (t: HeroTransform) => void;
  onResetTransform:  () => void;
  onUseHistoryItem:  (item: BannerResult) => void;
  setActiveTab:      (tab: string) => void;
}

// ── Hero style constants ───────────────────────────────────────────────────────

const HERO_STYLES: { id: BannerHeroStyle; label: string; sub: string }[] = [
  { id: "Modern",    label: "Modern",    sub: "Lifestyle, tự nhiên"         },
  { id: "Festive",   label: "Festive",   sub: "Lễ hội, rực rỡ"             },
  { id: "Minimal",   label: "Minimal",   sub: "Studio, tối giản"            },
  { id: "Bold",      label: "Bold",      sub: "Mạnh mẽ, tương phản"        },
  { id: "Corporate", label: "Corporate", sub: "Chuyên nghiệp, doanh nghiệp" },
];

// ── Accordion Section ──────────────────────────────────────────────────────────

interface MobileSectionProps {
  title:        string;
  icon?:        React.ReactNode;
  defaultOpen?: boolean;
  children:     React.ReactNode;
}

function MobileSection({ title, icon, defaultOpen = false, children }: MobileSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--border-default)] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-4 min-h-[52px] text-left active:bg-[var(--bg-surface-2)] transition-colors select-none"
      >
        {icon && (
          <span className="text-[var(--fg-subtle)] shrink-0 flex items-center">{icon}</span>
        )}
        <span className="flex-1 text-[14px] font-semibold text-[var(--fg-default)] leading-snug">
          {title}
        </span>
        <ChevronDown
          size={17}
          className="text-[var(--fg-subtle)] shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* CSS grid row animation — no JS height measurement needed */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-5 pt-0.5 space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Fullscreen Preview Modal ───────────────────────────────────────────────────

interface FullscreenPreviewProps {
  dataUrl:    string | null;
  onClose:    () => void;
  onDownload: () => void;
}

function FullscreenPreview({ dataUrl, onClose, onDownload }: FullscreenPreviewProps) {
  const [scale, setScale] = useState(1);
  const [pan, setPan]     = useState({ x: 0, y: 0 });

  const lastDist  = useRef<number | null>(null);
  const lastPan   = useRef<{ x: number; y: number } | null>(null);
  const tapCount  = useRef(0);
  const tapTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Lock body scroll while fullscreen is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2) {
      lastDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      lastPan.current = null;
    } else if (e.touches.length === 1) {
      lastPan.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastDist.current = null;

      // Double-tap detection (300ms window)
      tapCount.current += 1;
      if (tapCount.current === 1) {
        tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 300);
      } else if (tapCount.current >= 2) {
        if (tapTimer.current) clearTimeout(tapTimer.current);
        tapCount.current = 0;
        reset();
      }
    }
  }, [reset]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 2 && lastDist.current !== null) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const ratio = newDist / lastDist.current;
      setScale((s) => Math.min(5, Math.max(1, s * ratio)));
      lastDist.current = newDist;
    } else if (e.touches.length === 1 && lastPan.current !== null) {
      const dx = e.touches[0].clientX - lastPan.current.x;
      const dy = e.touches[0].clientY - lastPan.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastPan.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    lastDist.current = null;
    if (scale <= 1.05) {
      setScale(1);
      setPan({ x: 0, y: 0 });
    }
  }, [scale]);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black flex flex-col"
      style={{ touchAction: "none" }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top, 12px))" }}
      >
        <button
          onClick={onClose}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20 transition-colors"
          aria-label="Đóng"
        >
          <X size={20} className="text-white" />
        </button>
        <span className="text-[13px] font-medium text-white/75 tracking-wide">Xem trước</span>
        <button
          onClick={onDownload}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20 transition-colors"
          aria-label="Tải xuống"
        >
          <Download size={18} className="text-white" />
        </button>
      </div>

      {/* Zoomable image area */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "none" }}
      >
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt="Banner preview"
            draggable={false}
            style={{
              width:           "min(90vw, 90vh)",
              height:          "min(90vw, 90vh)",
              objectFit:       "contain",
              borderRadius:    14,
              willChange:      "transform",
              transform:       `scale(${scale}) translate(${pan.x / scale}px, ${pan.y / scale}px)`,
              transformOrigin: "center center",
              transition:      scale === 1 ? "transform 0.2s ease" : "none",
            }}
          />
        ) : (
          <Spinner size="lg" className="text-white" />
        )}
      </div>

      {/* Bottom hint */}
      <div
        className="pb-6 text-center shrink-0"
        style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))" }}
      >
        <p className="text-[11px] text-white/35">
          Pinch để zoom · Double tap để thu nhỏ
        </p>
      </div>
    </div>
  );
}

// ── Mobile History Card ────────────────────────────────────────────────────────

function MobileHistoryCard({
  item,
  onUse,
}: {
  item:  BannerResult;
  onUse: (item: BannerResult) => void;
}) {
  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    const a   = document.createElement("a");
    a.href     = item.imageDataUrl;
    a.download = `banner-${item.generationId}.png`;
    a.click();
  }

  const label = item.campaignName || "Banner";

  return (
    <Card
      variant="default"
      padding="sm"
      interactive
      className="group cursor-pointer active:scale-[0.97] transition-transform"
      onClick={() => onUse(item)}
    >
      <div className="relative rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-surface-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageDataUrl}
          alt={label}
          className="w-full aspect-square object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-active:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            size="xs"
            variant="primary"
            icon={<Download size={12} />}
            onClick={handleDownload}
          >
            Tải xuống
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-[12px] font-medium text-[var(--fg-default)] truncate">{label}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {item.heroStyle && (
            <Badge variant="default" size="sm">{item.heroStyle}</Badge>
          )}
          <span className="text-[10px] text-[var(--fg-subtle)] ml-auto">
            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function MobileBannerLayout({
  formValues,
  heroImageUrl,
  heroTransform,
  heroBounds: _heroBounds,
  heroMaxOffsets,
  onHeroBoundsReady,
  onRenderComplete,
  status,
  error,
  heroPromptUsed,
  history,
  activeTab,
  onChange,
  onGenerate,
  onExport,
  onTransformChange,
  onResetTransform,
  onUseHistoryItem,
  setActiveTab,
}: MobileBannerLayoutProps) {
  // Local canvas ref — this canvas is only for mobile display
  // (the desktop canvas in page.tsx handles export via its own ref)
  const localCanvasRef = useRef<React.ComponentRef<typeof BannerCanvas>>(null);

  // Measure container width for responsive canvas
  const containerRef   = useRef<HTMLDivElement>(null);
  const [displaySize, setDisplaySize] = useState(360);

  const [fullscreenOpen, setFullscreenOpen]     = useState(false);
  const [previewDataUrl, setPreviewDataUrl]     = useState<string | null>(null);
  const [brandLocked,    setBrandLocked]        = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0].contentRect.width);
      if (w > 0) setDisplaySize(w);
    });
    ro.observe(el);
    const initial = Math.floor(el.getBoundingClientRect().width);
    if (initial > 0) setDisplaySize(initial);
    return () => ro.disconnect();
  }, []);

  const isLoading   = status === "loading";
  const canGenerate = formValues.product.trim().length > 0;
  const historyBadge = history.length > 0 ? history.length : undefined;

  const ctaState: CTAState =
    status === "loading" ? "loading" :
    status === "done"    ? "success" :
    status === "error"   ? "error"   : "idle";

  const openFullscreen = useCallback(() => {
    const url = localCanvasRef.current?.getDataURL() ?? null;
    setPreviewDataUrl(url);
    setFullscreenOpen(true);
  }, []);

  return (
    <>
      {fullscreenOpen && (
        <FullscreenPreview
          dataUrl={previewDataUrl}
          onClose={() => setFullscreenOpen(false)}
          onDownload={onExport}
        />
      )}

      <div className="flex flex-col bg-[var(--bg-base)]">

        {/* ── Tab bar ─────────────────────────────────────────────────────── */}
        <div className="bg-[var(--bg-surface-1)] px-2">
          <Tabs
            variant="underline"
            value={activeTab}
            onChange={setActiveTab}
            items={[
              { id: "create",     label: "Tạo mới" },
              { id: "my-banners", label: "Banner của tôi", badge: historyBadge },
            ]}
          />
        </div>

        {/* ══════════════════ CREATE TAB ════════════════════════════════════ */}
        {activeTab === "create" && (
          <div className="flex flex-col">

            {/* ── Canvas: full-width ──────────────────────────────────────── */}
            <div className="bg-[var(--bg-surface-1)] border-b border-[var(--border-default)]">
              <div ref={containerRef} className="w-full relative">
                <BannerCanvas
                  ref={localCanvasRef}
                  tagline1={formValues.tagline1}
                  tagline2={formValues.tagline2}
                  heroImageUrl={heroImageUrl}
                  t1FontSize={formValues.t1FontSize}
                  t2FontSize={formValues.t2FontSize}
                  logoScale={BANNER_LOGO_SCALE}
                  t1TextTransform={formValues.t1TextTransform}
                  t1Align={formValues.t1Align}
                  t2Align={formValues.t2Align}
                  heroMaskStyle={formValues.heroMaskStyle}
                  heroOffsetX={heroTransform.offsetX}
                  heroOffsetY={heroTransform.offsetY}
                  heroScale={heroTransform.scale}
                  heroBlend={formValues.heroBlend ?? BANNER_HERO_BLEND_DEFAULT}
                  blendColor={formValues.blendColor ?? BLEND_COLOR_DEFAULT}
                  logoVariant={formValues.logoVariant ?? LOGO_VARIANT_DEFAULT}
                  t1Color={formValues.t1Color}
                  t1ColorOpacity={formValues.t1ColorOpacity}
                  t2Color={formValues.t2Color}
                  t2ColorOpacity={formValues.t2ColorOpacity}
                  zEnabled={formValues.zEnabled}
                  zOpacity={formValues.zOpacity}
                  zScale={formValues.zScale}
                  zColor={formValues.zColor}
                  onHeroBoundsReady={onHeroBoundsReady}
                  onRenderComplete={onRenderComplete}
                  displaySize={displaySize}
                  showSafeAreaGuide
                />

                {/* Loading overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px] flex flex-col items-center justify-center gap-3">
                    <Spinner size="lg" className="text-white" />
                    <p className="text-[13px] font-semibold text-white drop-shadow">
                      Đang tạo ảnh hero AI...
                    </p>
                    <p className="text-[11px] text-white/65">Có thể mất 30–60 giây</p>
                  </div>
                )}

                {/* Fullscreen button — top-right corner */}
                {!isLoading && (
                  <button
                    onClick={openFullscreen}
                    className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-black/35 backdrop-blur-sm active:bg-black/55 transition-colors"
                    aria-label="Xem toàn màn hình"
                  >
                    <Maximize2 size={16} className="text-white" />
                  </button>
                )}
              </div>

              {/* Action row below canvas */}
              <div className="flex items-center gap-2 px-4 py-3">
                {heroImageUrl ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Download size={13} />}
                      onClick={onExport}
                      className="flex-1"
                    >
                      Xuất PNG (1200 × 1200)
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<RefreshCw size={13} />}
                      onClick={onGenerate}
                      disabled={isLoading || !canGenerate}
                    >
                      Tạo lại
                    </Button>
                  </>
                ) : status !== "loading" ? (
                  <p className="flex-1 text-center text-[12px] text-[var(--fg-muted)] py-1">
                    Nhấn <strong>Tạo Hero Image</strong> bên dưới để bắt đầu
                  </p>
                ) : null}
              </div>
            </div>

            {/* ── Error alert ─────────────────────────────────────────────── */}
            {status === "error" && error && (
              <div className="px-4 pt-3 pb-0">
                <Alert variant="danger" title="Tạo ảnh thất bại">{error}</Alert>
              </div>
            )}

            {/* ── Prompt info card ────────────────────────────────────────── */}
            {heroPromptUsed && status === "done" && (
              <div className="px-4 py-3">
                <div className="rounded-[var(--radius-md)] bg-[var(--bg-surface-1)] border border-[var(--border-default)] px-3 py-2.5">
                  <p className="text-[11px] font-semibold text-[var(--fg-subtle)] mb-1">
                    Prompt AI đã dùng
                  </p>
                  <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed font-mono break-all">
                    {heroPromptUsed}
                  </p>
                </div>
              </div>
            )}

            {/* ── Accordion form sections ──────────────────────────────────── */}
            <div className="mt-2 bg-[var(--bg-surface-1)] border-t border-[var(--border-default)]">

              {/* Nội dung banner */}
              <MobileSection
                title="Nội dung banner"
                icon={<Type size={15} />}
                defaultOpen
              >
                <LogoVariantSelector
                  value={formValues.logoVariant ?? "white"}
                  onChange={(v) => onChange({ logoVariant: v })}
                  disabled={isLoading}
                />

                {/* Tagline 1 */}
                <div className="space-y-2.5">
                  <p className="text-[11px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wider">
                    Tagline 1 — Label (hộp xanh nhỏ)
                  </p>
                  <Input
                    placeholder="VD: Ưu đãi độc quyền"
                    value={formValues.tagline1}
                    onChange={(e) => onChange({ tagline1: e.target.value })}
                    disabled={isLoading}
                  />
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-[var(--fg-muted)] shrink-0">Kiểu chữ</span>
                    {(
                      [
                        { value: "none",      label: "Giữ nguyên" },
                        { value: "uppercase", label: "IN HOA"     },
                      ] as const
                    ).map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="t1Transform-mobile"
                          value={value}
                          checked={(formValues.t1TextTransform ?? BANNER_T1_TEXT_TRANSFORM_DEFAULT) === value}
                          onChange={() => onChange({ t1TextTransform: value })}
                          className="accent-[var(--brand-default)]"
                          disabled={isLoading}
                        />
                        <span className="text-[12.5px] text-[var(--fg-default)]">{label}</span>
                      </label>
                    ))}
                  </div>
                  <TaglineAlignmentSelector
                    value={formValues.t1Align ?? BANNER_T1_ALIGN_DEFAULT}
                    onChange={(v) => onChange({ t1Align: v })}
                    disabled={isLoading}
                  />
                </div>

                {/* Tagline 2 */}
                <div className="space-y-2.5">
                  <p className="text-[11px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wider">
                    Tagline 2 — Tiêu đề chính
                  </p>
                  <Textarea
                    placeholder={"VD: Nạp Data 4G\nKhông mất tiền"}
                    value={formValues.tagline2}
                    onChange={(e) => onChange({ tagline2: e.target.value })}
                    rows={3}
                    disabled={isLoading}
                  />
                  <TaglineAlignmentSelector
                    value={formValues.t2Align ?? BANNER_T2_ALIGN_DEFAULT}
                    onChange={(v) => onChange({ t2Align: v })}
                    disabled={isLoading}
                  />
                  <p className="text-[10.5px] text-[var(--fg-subtle)]">
                    Tối đa 2 dòng · Enter để xuống dòng
                  </p>
                </div>
              </MobileSection>

              {/* Hình ảnh AI */}
              <MobileSection
                title="Hình ảnh AI"
                icon={<ImageIcon size={15} />}
                defaultOpen
              >
                {/* Product */}
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wider">
                    Sản phẩm / Chủ thể *
                  </p>
                  <Input
                    placeholder="VD: smartphone hiện đại đang dùng ZaloPay..."
                    value={formValues.product}
                    onChange={(e) => onChange({ product: e.target.value })}
                    disabled={isLoading}
                  />
                  <p className="text-[10.5px] text-[var(--fg-subtle)]">
                    AI sẽ tạo ảnh này và đặt vào vùng hero phía dưới
                  </p>
                </div>

                {/* Campaign */}
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wider">
                    Tên chiến dịch
                  </p>
                  <Input
                    placeholder="VD: Tết Sale 2025, Flash Sale tháng 6..."
                    value={formValues.campaignName}
                    onChange={(e) => onChange({ campaignName: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                {/* Audience */}
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wider">
                    Đối tượng mục tiêu
                  </p>
                  <Input
                    placeholder="VD: giới trẻ đô thị, chị em nội trợ..."
                    value={formValues.audience}
                    onChange={(e) => onChange({ audience: e.target.value })}
                    disabled={isLoading}
                  />
                </div>

                {/* Hero style */}
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wider">
                    Phong cách hình ảnh
                  </p>
                  <div className="space-y-2">
                    {HERO_STYLES.map((s) => (
                      <label
                        key={s.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] cursor-pointer border border-[var(--border-default)] transition-colors has-[:checked]:border-[var(--brand-default)] has-[:checked]:bg-[var(--brand-subtle)]"
                      >
                        <input
                          type="radio"
                          name="heroStyle-mobile"
                          checked={formValues.heroStyle === s.id}
                          onChange={() => onChange({ heroStyle: s.id })}
                          className="accent-[var(--brand-default)]"
                          disabled={isLoading}
                        />
                        <div>
                          <div className="text-[13px] font-semibold text-[var(--fg-default)]">{s.label}</div>
                          <div className="text-[11px] text-[var(--fg-subtle)] mt-0.5">{s.sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </MobileSection>

              {/* Điều chỉnh ảnh — only when hero image exists */}
              {heroImageUrl && (
                <MobileSection
                  title="Điều chỉnh ảnh"
                  icon={<Move size={15} />}
                  defaultOpen
                >
                  <HeroImageControls
                    transform={heroTransform}
                    onChange={onTransformChange}
                    onReset={onResetTransform}
                    disabled={isLoading}
                    maxOffsetX={heroMaxOffsets.maxX}
                    maxOffsetY={heroMaxOffsets.maxY}
                  />
                </MobileSection>
              )}

              {/* Hoà nền — only when hero image exists */}
              {heroImageUrl && (
                <MobileSection
                  title="Hoà nền"
                  icon={<Palette size={15} />}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-[var(--fg-muted)]">
                        Hoà trộn hình ảnh AI và nền banner
                      </p>
                      {(
                        (formValues.heroBlend !== undefined &&
                          formValues.heroBlend !== BLEND_OPACITY_RESET) ||
                        (formValues.blendColor !== undefined &&
                          formValues.blendColor !== BLEND_COLOR_DEFAULT)
                      ) && (
                        <button
                          type="button"
                          onClick={() => onChange({ heroBlend: BLEND_OPACITY_RESET, blendColor: BLEND_COLOR_DEFAULT })}
                          disabled={isLoading}
                          className="text-[11.5px] text-[var(--fg-muted)] hover:text-[var(--fg-default)] transition-colors shrink-0 ml-2"
                        >
                          Đặt lại
                        </button>
                      )}
                    </div>
                    <HeroBlendSlider
                      value={formValues.heroBlend ?? BANNER_HERO_BLEND_DEFAULT}
                      onChange={(v) => onChange({ heroBlend: v })}
                      disabled={isLoading}
                    />
                    <BlendColorPicker
                      value={formValues.blendColor ?? BLEND_COLOR_DEFAULT}
                      onChange={(hex) => onChange({ blendColor: hex })}
                      disabled={isLoading}
                    />
                  </div>
                </MobileSection>
              )}

              {/* Typography */}
              <MobileSection
                title="Typography"
                icon={<Type size={15} />}
              >
                {/* Brand Lock toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[var(--fg-muted)]">
                    {brandLocked ? "Khoá màu thương hiệu" : "Cho phép màu tuỳ chọn"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={brandLocked}
                    onClick={() => setBrandLocked((v) => !v)}
                    disabled={isLoading}
                    style={{
                      width:        34,
                      height:       18,
                      borderRadius: 9,
                      background:   brandLocked ? "var(--brand-default)" : "var(--border-strong)",
                      position:     "relative",
                      border:       "none",
                      cursor:       "pointer",
                      transition:   "background 0.15s",
                      flexShrink:   0,
                      padding:      0,
                    }}
                    className="disabled:opacity-40"
                  >
                    <span
                      style={{
                        position:     "absolute",
                        top:          2,
                        left:         brandLocked ? 18 : 2,
                        width:        14,
                        height:       14,
                        borderRadius: "50%",
                        background:   "#ffffff",
                        boxShadow:    "0 1px 3px rgba(0,0,0,0.30)",
                        transition:   "left 0.15s",
                      }}
                    />
                  </button>
                </div>

                <div className="space-y-5">
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
                  <TypographyColorPicker
                    label="Màu chữ Tagline 1"
                    value={formValues.t1Color ?? T_COLOR_DEFAULT}
                    opacity={formValues.t1ColorOpacity ?? T_OPACITY_DEFAULT}
                    onChange={(hex, op) => onChange({ t1Color: hex, t1ColorOpacity: op })}
                    onReset={() => onChange({ t1Color: T_COLOR_DEFAULT, t1ColorOpacity: T_OPACITY_DEFAULT })}
                    disabled={isLoading}
                    brandLocked={brandLocked}
                    bgForContrast="#0033C9"
                    recentKey="banner-typo-t1-recent"
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
                  <TypographyColorPicker
                    label="Màu chữ Tagline 2"
                    value={formValues.t2Color ?? T_COLOR_DEFAULT}
                    opacity={formValues.t2ColorOpacity ?? T_OPACITY_DEFAULT}
                    onChange={(hex, op) => onChange({ t2Color: hex, t2ColorOpacity: op })}
                    onReset={() => onChange({ t2Color: T_COLOR_DEFAULT, t2ColorOpacity: T_OPACITY_DEFAULT })}
                    disabled={isLoading}
                    brandLocked={brandLocked}
                    bgForContrast="#00934A"
                    recentKey="banner-typo-t2-recent"
                  />
                </div>
              </MobileSection>

              {/* Brand Elements */}
              <MobileSection
                title="Brand Elements"
                icon={<Palette size={15} />}
              >
                {/* Trademark Z */}
                <div className="space-y-3">
                  {/* Enable toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-semibold text-[var(--fg-default)]">Trademark Z</div>
                      <div className="text-[11px] text-[var(--fg-muted)] mt-0.5">
                        Hình nền thương hiệu
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formValues.zEnabled ?? BANNER_Z_ENABLED_DEFAULT}
                      onClick={() => onChange({ zEnabled: !(formValues.zEnabled ?? BANNER_Z_ENABLED_DEFAULT) })}
                      disabled={isLoading}
                      style={{
                        width:        34,
                        height:       18,
                        borderRadius: 9,
                        background:   (formValues.zEnabled ?? BANNER_Z_ENABLED_DEFAULT)
                          ? "var(--brand-default)"
                          : "var(--border-strong)",
                        position:     "relative",
                        border:       "none",
                        cursor:       "pointer",
                        transition:   "background 0.15s",
                        flexShrink:   0,
                        padding:      0,
                      }}
                      className="disabled:opacity-40"
                    >
                      <span
                        style={{
                          position:     "absolute",
                          top:          2,
                          left:         (formValues.zEnabled ?? BANNER_Z_ENABLED_DEFAULT) ? 18 : 2,
                          width:        14,
                          height:       14,
                          borderRadius: "50%",
                          background:   "#ffffff",
                          boxShadow:    "0 1px 3px rgba(0,0,0,0.30)",
                          transition:   "left 0.15s",
                        }}
                      />
                    </button>
                  </div>

                  {(formValues.zEnabled ?? BANNER_Z_ENABLED_DEFAULT) && (
                    <div className="space-y-3 pt-1">

                      {/* Opacity slider */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11.5px] text-[var(--fg-muted)]">Độ mờ</span>
                          <span className="text-[11px] font-mono text-[var(--fg-subtle)]">
                            {formValues.zOpacity ?? BANNER_Z_OPACITY_DEFAULT}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={BANNER_Z_OPACITY_MIN}
                          max={BANNER_Z_OPACITY_MAX}
                          step={1}
                          value={formValues.zOpacity ?? BANNER_Z_OPACITY_DEFAULT}
                          onChange={(e) => onChange({ zOpacity: Number(e.target.value) })}
                          disabled={isLoading}
                          className="w-full accent-[var(--brand-default)] disabled:opacity-40"
                        />
                      </div>

                      {/* Scale slider */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11.5px] text-[var(--fg-muted)]">Kích cỡ</span>
                          <span className="text-[11px] font-mono text-[var(--fg-subtle)]">
                            {formValues.zScale ?? BANNER_Z_SCALE_DEFAULT}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={BANNER_Z_SCALE_MIN}
                          max={BANNER_Z_SCALE_MAX}
                          step={5}
                          value={formValues.zScale ?? BANNER_Z_SCALE_DEFAULT}
                          onChange={(e) => onChange({ zScale: Number(e.target.value) })}
                          disabled={isLoading}
                          className="w-full accent-[var(--brand-default)] disabled:opacity-40"
                        />
                      </div>

                      {/* Color swatches */}
                      <div>
                        <span className="text-[11.5px] text-[var(--fg-muted)] block mb-2">Màu sắc</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Auto swatch */}
                          <button
                            type="button"
                            title="Tự động (theo màu nền)"
                            disabled={isLoading}
                            onClick={() => onChange({ zColor: undefined })}
                            style={{
                              width:        28,
                              height:       28,
                              borderRadius: "50%",
                              background:   "conic-gradient(#00CF6A 0deg 120deg, #0033C9 120deg 240deg, #FFFFFF 240deg 360deg)",
                              border:       !formValues.zColor
                                ? "2.5px solid var(--fg-default)"
                                : "1.5px solid rgba(255,255,255,0.15)",
                              cursor:       "pointer",
                              flexShrink:   0,
                            }}
                            className="disabled:opacity-40 hover:scale-105 transition-transform"
                          />
                          {Z_COLOR_PRESETS.map((p) => {
                            const isSel = formValues.zColor?.toUpperCase() === p.hex.toUpperCase();
                            return (
                              <button
                                key={p.id}
                                type="button"
                                title={p.labelVi}
                                disabled={isLoading}
                                onClick={() => onChange({ zColor: p.hex })}
                                style={{
                                  width:        28,
                                  height:       28,
                                  borderRadius: "50%",
                                  background:   p.hex,
                                  border:       isSel
                                    ? "2.5px solid var(--fg-default)"
                                    : "1.5px solid rgba(255,255,255,0.15)",
                                  cursor:       "pointer",
                                  flexShrink:   0,
                                }}
                                className="disabled:opacity-40 hover:scale-105 transition-transform"
                              />
                            );
                          })}
                        </div>
                        <p className="text-[10.5px] text-[var(--fg-muted)] mt-1.5">
                          Tự động = theo màu nền đang chọn
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </MobileSection>

              {/* Nâng cao */}
              <MobileSection
                title="Nâng cao"
                icon={<Settings size={15} />}
              >
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-[var(--fg-subtle)] uppercase tracking-wider">
                    Ghi đè prompt AI (tuỳ chọn)
                  </p>
                  <Textarea
                    placeholder="Nhập prompt trực tiếp để thay thế prompt tự động của AI..."
                    value={formValues.heroPromptOverride}
                    onChange={(e) => onChange({ heroPromptOverride: e.target.value })}
                    rows={4}
                    disabled={isLoading}
                  />
                  <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed">
                    Khi để trống, AI tự tạo prompt từ thông tin trên.
                    Khi điền vào, AI sẽ dùng prompt này.
                  </p>
                </div>
              </MobileSection>

              {/* Brand lock notice */}
              <div className="px-4 py-4 bg-[var(--bg-surface-2)]">
                <p className="text-[11.5px] text-[var(--fg-muted)] leading-relaxed">
                  <span className="font-semibold text-[var(--fg-subtle)]">Khoá thương hiệu:</span>{" "}
                  Logo ZaloPay, màu nền xanh (#00CF6A), và typography được render tự động.
                  AI chỉ tạo ảnh hero subject ở vùng dưới.
                </p>
              </div>
            </div>

            {/* ── Sticky generate button ───────────────────────────────────── */}
            <div
              className="sticky bottom-0 z-20 px-4 py-3 bg-[var(--bg-base)] border-t border-[var(--border-default)]"
              style={{
                paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
                boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
              }}
            >
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
        )}

        {/* ══════════════════ HISTORY TAB ═══════════════════════════════════ */}
        {activeTab === "my-banners" && (
          <div className="p-4">
            {history.length === 0 ? (
              <EmptyState
                icon={ImageIcon}
                title="Chưa có banner nào"
                description="Các banner bạn tạo và xuất sẽ được lưu tự động ở đây."
                action={
                  <Button
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={() => setActiveTab("create")}
                  >
                    Tạo banner đầu tiên
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {history.map((item) => (
                  <MobileHistoryCard
                    key={item.generationId}
                    item={item}
                    onUse={onUseHistoryItem}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
