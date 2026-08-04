"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Download,
  RefreshCw,
  Sparkles,
  Plus,
} from "lucide-react";
import { useRightPanel } from "@/contexts/right-panel-context";
import { BannerGeneratorPanel } from "@/components/modules/banner-generator/panel";
import {
  BannerCanvas, type BannerCanvasHandle,
  BANNER_T1_FS_DEFAULT, BANNER_T2_FS_DEFAULT,
  BANNER_LOGO_SCALE,
  BANNER_T1_TEXT_TRANSFORM_DEFAULT,
  BANNER_T1_ALIGN_DEFAULT, BANNER_T2_ALIGN_DEFAULT,
  BANNER_HERO_MASK_DEFAULT,
  BANNER_HERO_BLEND_DEFAULT,
  BANNER_CANVAS_DISPLAY_SIZE,
} from "@/components/modules/banner-generator/banner-canvas";
import { LOGO_VARIANT_DEFAULT } from "@/lib/assets/logo-assets";
import { HeroDragLayer } from "@/components/modules/banner-generator/hero-drag-layer";
import {
  useHeroDrag,
  computeMaxOffset,
  HERO_TRANSFORM_DEFAULT,
  type HeroTransform,
  type HeroBounds,
} from "@/components/modules/banner-generator/use-hero-drag";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { WorkspaceHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import type { BannerHeroStyle, BannerResult, BannerStatus, BannerTemplateValues, LogoVariant } from "@/lib/types";
import { BLEND_COLOR_DEFAULT } from "@/lib/brand/blend-presets";

// ── Default form values ───────────────────────────────────────────────────────

const DEFAULT_FORM: BannerTemplateValues = {
  tagline1:           "ƯU ĐÃI ĐỘC QUYỀN",
  tagline2:           "Tiêu dùng thả ga\nHoàn tiền không giới hạn",
  campaignName:       "",
  product:            "",
  audience:           "giới trẻ đô thị Việt Nam",
  heroStyle:          "Modern",
  heroPromptOverride: "",
  t1FontSize:         BANNER_T1_FS_DEFAULT,
  t2FontSize:         BANNER_T2_FS_DEFAULT,
  t1TextTransform:    BANNER_T1_TEXT_TRANSFORM_DEFAULT,
  t1Align:            BANNER_T1_ALIGN_DEFAULT,
  t2Align:            BANNER_T2_ALIGN_DEFAULT,
  heroMaskStyle:      BANNER_HERO_MASK_DEFAULT,
  heroBlend:          BANNER_HERO_BLEND_DEFAULT,
  blendColor:         BLEND_COLOR_DEFAULT,
  logoVariant:        LOGO_VARIANT_DEFAULT, // "primary" — full-colour blue+green logo
};

const HISTORY_KEY = "banner-template-history";

// ── Storage helpers ───────────────────────────────────────────────────────────

function loadHistory(): BannerResult[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as BannerResult[]) : [];
  } catch { return []; }
}

function persistHistory(history: BannerResult[]): void {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
}

// ── History card ──────────────────────────────────────────────────────────────

function HistoryCard({
  item,
  onUse,
}: {
  item: BannerResult;
  onUse: (item: BannerResult) => void;
}) {
  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href     = item.imageDataUrl;
    a.download = `banner-${item.generationId}.png`;
    a.click();
  }

  const label = item.campaignName || item.campaignObjective || "Banner";

  return (
    <Card
      variant="default"
      padding="sm"
      interactive
      className="group cursor-pointer"
      onClick={() => onUse(item)}
    >
      <div className="relative rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-surface-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageDataUrl}
          alt={label}
          className="w-full aspect-square object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="xs" variant="primary" icon={<Download size={12} />} onClick={handleDownload}>
            Tải xuống
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-[12.5px] font-medium text-[var(--fg-default)] truncate">{label}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {item.heroStyle && (
            <Badge variant="default" size="sm">{item.heroStyle}</Badge>
          )}
          <span className="text-[10.5px] text-[var(--fg-subtle)] ml-auto">
            {new Date(item.createdAt).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BannerGeneratorPage() {
  const { setContent } = useRightPanel();

  const [formValues, setFormValues] = useState<BannerTemplateValues>(DEFAULT_FORM);
  const [status, setStatus]         = useState<BannerStatus>("idle");
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [heroPromptUsed, setHeroPromptUsed] = useState("");
  const [error, setError]           = useState("");
  const [history, setHistory]       = useState<BannerResult[]>([]);
  const [activeTab, setActiveTab]   = useState("create");

  // Hero image pan/zoom transform
  const [heroTransform, setHeroTransform] = useState<HeroTransform>(HERO_TRANSFORM_DEFAULT);
  const [heroBounds, setHeroBounds]       = useState<HeroBounds | null>(null);
  const [heroImageAR, setHeroImageAR]     = useState<number | null>(null);

  // Keep a ref so handleRenderComplete can read the latest transform without
  // being recreated on every transform change
  const heroTransformRef = useRef<HeroTransform>(heroTransform);
  useEffect(() => { heroTransformRef.current = heroTransform; }, [heroTransform]);

  // Load image AR whenever heroImageUrl changes (for accurate pan clamping)
  useEffect(() => {
    if (!heroImageUrl) { setHeroImageAR(null); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => setHeroImageAR(img.width / img.height);
    img.onerror = () => setHeroImageAR(null);
    img.src = heroImageUrl;
  }, [heroImageUrl]);

  // Compute dynamic max offsets for panel slider ranges and drag clamping
  const heroMaxOffsets = useMemo(() => {
    if (!heroBounds || !heroImageAR) return { maxX: 200, maxY: 200 };
    const { maxX, maxY } = computeMaxOffset(heroImageAR, heroBounds.w, heroBounds.h, heroTransform.scale);
    return { maxX: Math.max(20, maxX), maxY: Math.max(20, maxY) };
  }, [heroBounds, heroImageAR, heroTransform.scale]);

  // Flag: set true when a generation just finished so onRenderComplete can save to history
  const pendingSaveRef  = useRef(false);
  const canvasRef       = useRef<BannerCanvasHandle>(null);
  // Always-current ref so onRenderComplete closure captures latest form values
  const formValuesRef   = useRef(formValues);
  useEffect(() => { formValuesRef.current = formValues; }, [formValues]);

  // Drag / pan / zoom interaction
  const {
    isDragging, handleMouseDown, handleTouchStart, handleDoubleClick, resetTransform,
  } = useHeroDrag({
    cssDisplaySize: BANNER_CANVAS_DISPLAY_SIZE,
    canvasSize:     1200,
    heroBounds,
    imageAR:        heroImageAR,
    hasImage:       !!heroImageUrl,
    transform:      heroTransform,
    onTransform:    setHeroTransform,
  });

  useEffect(() => { setHistory(loadHistory()); }, []);

  const onChange = useCallback((patch: Partial<BannerTemplateValues>) => {
    setFormValues((prev) => ({ ...prev, ...patch }));
  }, []);

  // Saves the rendered composite banner to history once per generation
  const handleRenderComplete = useCallback(
    (dataUrl: string) => {
      if (!pendingSaveRef.current) return;
      pendingSaveRef.current = false;

      const form = formValuesRef.current;
      const t = heroTransformRef.current;
      const newResult: BannerResult = {
        generationId: `banner-tmpl-${Date.now()}`,
        imageDataUrl: dataUrl,
        heroImageUrl: heroImageUrl ?? undefined,
        prompt:       heroPromptUsed,
        dimensions:   { width: 1200, height: 1200 },
        tagline1:     form.tagline1,
        tagline2:     form.tagline2,
        campaignName: form.campaignName,
        product:      form.product,
        heroStyle:    form.heroStyle,
        heroOffsetX:  t.offsetX,
        heroOffsetY:  t.offsetY,
        heroScale:    t.scale,
        heroBlend:    form.heroBlend    ?? BANNER_HERO_BLEND_DEFAULT,
        blendColor:   form.blendColor   ?? BLEND_COLOR_DEFAULT,
        logoVariant:  form.logoVariant  ?? LOGO_VARIANT_DEFAULT,
        createdAt:    new Date().toISOString(),
      };

      setHistory((prev) => {
        const updated = [newResult, ...prev.slice(0, 19)];
        persistHistory(updated);
        return updated;
      });
    },
    [heroImageUrl, heroPromptUsed],
  );

  const handleGenerate = useCallback(async () => {
    if (!formValues.product.trim()) return;

    setHeroTransform(HERO_TRANSFORM_DEFAULT); // reset pan/zoom for each new image
    setStatus("loading");
    setError("");
    setActiveTab("create");

    try {
      const body: Record<string, unknown> = {
        campaignName:       formValues.campaignName,
        tagline1:           formValues.tagline1,
        tagline2:           formValues.tagline2,
        product:            formValues.product,
        audience:           formValues.audience,
        heroStyle:          formValues.heroStyle,
      };
      if (formValues.heroPromptOverride?.trim()) {
        body.heroPromptOverride = formValues.heroPromptOverride.trim();
      }

      const res = await fetch("/api/generate-banner", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      let data: Record<string, unknown>;
      try {
        data = await res.json();
      } catch {
        setError(`HTTP ${res.status} — invalid response`);
        setStatus("error");
        return;
      }

      if (!res.ok) {
        setError((data.error as string) || res.statusText);
        setStatus("error");
        return;
      }

      const url = (data.heroImageUrl as string) || (data.imageDataUrl as string);
      if (!url) {
        setError("Không nhận được ảnh từ server. Vui lòng thử lại.");
        setStatus("error");
        return;
      }

      setHeroImageUrl(url);
      setHeroPromptUsed((data.heroPrompt as string) || (data.prompt as string) || "");
      pendingSaveRef.current = true;  // onRenderComplete will write to history
      setStatus("done");
    } catch (err) {
      setError(`Yêu cầu thất bại: ${(err as Error).message}`);
      setStatus("error");
    }
  }, [formValues]);

  const handleExport = useCallback(() => {
    const dataUrl = canvasRef.current?.getDataURL();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href     = dataUrl;
    a.download = `zalopay-banner-${Date.now()}.png`;
    a.click();
  }, []);

  const handleUseHistoryItem = useCallback((item: BannerResult) => {
    if (item.heroImageUrl) setHeroImageUrl(item.heroImageUrl);
    if (item.prompt)       setHeroPromptUsed(item.prompt);
    if (item.tagline1 !== undefined || item.tagline2 !== undefined || item.product !== undefined) {
      setFormValues((prev) => ({
        ...prev,
        tagline1:     item.tagline1     ?? prev.tagline1,
        tagline2:     item.tagline2     ?? prev.tagline2,
        campaignName: item.campaignName  ?? prev.campaignName,
        product:      item.product       ?? prev.product,
        heroStyle:    (item.heroStyle as BannerHeroStyle) ?? prev.heroStyle,
      }));
    }
    setHeroTransform({
      offsetX: item.heroOffsetX ?? 0,
      offsetY: item.heroOffsetY ?? 0,
      scale:   item.heroScale   ?? 1.0,
    });
    if (item.heroBlend !== undefined || item.blendColor !== undefined || item.logoVariant !== undefined) {
      setFormValues((prev) => ({
        ...prev,
        ...(item.heroBlend   !== undefined && { heroBlend:   item.heroBlend }),
        ...(item.blendColor  !== undefined && { blendColor:  item.blendColor }),
        ...(item.logoVariant !== undefined && { logoVariant: item.logoVariant }),
      }));
    }
    setStatus("done");
    setActiveTab("create");
  }, []);

  // Inject right panel
  useEffect(() => {
    setContent(
      <BannerGeneratorPanel
        formValues={formValues}
        onChange={onChange}
        onGenerate={handleGenerate}
        status={status}
        heroImageUrl={heroImageUrl}
        heroTransform={heroTransform}
        heroMaxOffsetX={heroMaxOffsets.maxX}
        heroMaxOffsetY={heroMaxOffsets.maxY}
        onTransformChange={setHeroTransform}
        onResetTransform={resetTransform}
        heroBlend={formValues.heroBlend ?? BANNER_HERO_BLEND_DEFAULT}
        onBlendChange={(v) => onChange({ heroBlend: v })}
        blendColor={formValues.blendColor ?? BLEND_COLOR_DEFAULT}
        onBlendColorChange={(hex) => onChange({ blendColor: hex })}
      />,
    );
  }, [
    formValues, onChange, handleGenerate, status, setContent,
    heroImageUrl, heroTransform, heroMaxOffsets,
    setHeroTransform, resetTransform,
  ]);

  useEffect(() => { return () => setContent(null); }, [setContent]);

  const isGenerating  = status === "loading";
  const historyBadge  = history.length > 0 ? history.length : undefined;

  return (
    <div>
      <WorkspaceHeader
        title="Banner Generator"
        description="Template chuẩn Zalopay — AI chỉ tạo ảnh hero, logo và typography được render tự động"
        icon={<ImageIcon size={18} className="text-[var(--brand-default)]" />}
        badge={<Badge variant="primary" size="sm">Beta</Badge>}
        actions={
          heroImageUrl ? (
            <Button variant="primary" size="sm" icon={<Download size={14} />} onClick={handleExport}>
              Xuất banner
            </Button>
          ) : undefined
        }
      />

      <div className="p-4 sm:p-6">
        <Tabs
          variant="underline"
          value={activeTab}
          onChange={setActiveTab}
          items={[
            { id: "create",     label: "Tạo mới" },
            { id: "my-banners", label: "Banner của tôi", badge: historyBadge },
          ]}
        >
          {(id) => {

            // ── Tạo mới ──────────────────────────────────────────────────
            if (id === "create") return (
              <div className="mt-5 space-y-5">

                {/* Error */}
                {status === "error" && error && (
                  <Alert variant="danger" title="Tạo ảnh thất bại">{error}</Alert>
                )}

                {/* Canvas preview — always visible */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative" style={{ display: "inline-block" }}>
                    <BannerCanvas
                      ref={canvasRef}
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
                      onHeroBoundsReady={setHeroBounds}
                      onRenderComplete={handleRenderComplete}
                      className="rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
                    />

                    {/* Drag overlay — active when hero image is loaded and not generating */}
                    {heroImageUrl && heroBounds && !isGenerating && (
                      <HeroDragLayer
                        heroBoundsCanvas={heroBounds}
                        canvasResolution={1200}
                        cssDisplaySize={BANNER_CANVAS_DISPLAY_SIZE}
                        isDragging={isDragging}
                        hasImage={!!heroImageUrl}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        onDoubleClick={handleDoubleClick}
                      />
                    )}

                    {/* Loading overlay */}
                    {isGenerating && (
                      <div className="absolute inset-0 rounded-[20px] bg-black/25 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
                        <Spinner size="lg" className="text-white" />
                        <p className="text-[13px] font-medium text-white text-shadow">
                          Đang tạo ảnh hero AI...
                        </p>
                        <p className="text-[11.5px] text-white/75">Có thể mất 30–60 giây</p>
                      </div>
                    )}
                  </div>

                  {/* Action row below canvas */}
                  <div className="flex items-center gap-2.5 flex-wrap justify-center">
                    {heroImageUrl && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Download size={13} />}
                          onClick={handleExport}
                        >
                          Xuất PNG (1200 × 1200)
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<RefreshCw size={13} />}
                          onClick={handleGenerate}
                          disabled={isGenerating}
                        >
                          Tạo lại ảnh hero
                        </Button>
                      </>
                    )}
                    {!heroImageUrl && status !== "loading" && (
                      <div className="text-center">
                        <p className="text-[13px] text-[var(--fg-muted)] mb-1">
                          Điền thông tin và nhấn <strong>Tạo Hero Image</strong> ở bảng bên phải
                        </p>
                        <p className="text-[12px] text-[var(--fg-subtle)]">
                          Tagline và logo đã hiển thị ngay — chỉ ảnh hero cần AI
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hero prompt display */}
                  {heroPromptUsed && status === "done" && (
                    <Card variant="default" padding="sm" className="w-full max-w-[560px]">
                      <p className="text-[11px] font-semibold text-[var(--fg-subtle)] mb-1">
                        Prompt AI đã dùng
                      </p>
                      <p className="text-[12px] text-[var(--fg-muted)] leading-relaxed font-mono break-all">
                        {heroPromptUsed}
                      </p>
                    </Card>
                  )}
                </div>

              </div>
            );

            // ── Banner của tôi ────────────────────────────────────────────
            return (
              <div className="mt-5">
                {history.length === 0 ? (
                  <EmptyState
                    icon={ImageIcon}
                    title="Chưa có banner nào"
                    description="Các banner bạn tạo và xuất sẽ được lưu tự động ở đây."
                    action={
                      <Button size="sm" icon={<Plus size={14} />} onClick={() => setActiveTab("create")}>
                        Tạo banner đầu tiên
                      </Button>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {history.map((item) => (
                      <HistoryCard key={item.generationId} item={item} onUse={handleUseHistoryItem} />
                    ))}
                  </div>
                )}
              </div>
            );
          }}
        </Tabs>
      </div>
    </div>
  );
}
