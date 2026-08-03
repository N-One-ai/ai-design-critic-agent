"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sparkles, Download, Grid, Plus, Heart, Loader2, AlertCircle, Info } from "lucide-react";
import { useRightPanel } from "@/contexts/right-panel-context";
import { ImageGeneratorPanel } from "@/components/modules/image-generator/panel";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { WorkspaceHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import type { ImageGenerateResponse, ImageStyle, ImageQuality, AspectRatio } from "@/lib/ai/types/image";

// Label maps used in the loading state display
const STYLE_LABELS: Record<string, string> = {
  "realistic":    "Thực tế",
  "illustration": "Minh họa",
  "flat-design":  "Thiết kế phẳng",
  "3d-render":    "3D Render",
  "watercolor":   "Màu nước",
  "pixel-art":    "Pixel Art",
  "cinematic":    "Điện ảnh",
  "editorial":    "Biên tập",
};
const QUALITY_LABELS: Record<string, string> = {
  "draft":    "Nháp",
  "standard": "Tiêu chuẩn",
  "hd":       "HD",
  "ultra-hd": "Siêu HD",
};

// ── Sample gallery ────────────────────────────────────────────────────────────

const GALLERY_ITEMS = [
  { id: "1", prompt: "Banner hero Zalopay — gradient xanh",       w: 2, h: 1, colors: ["#0033c9", "#3b5bdb"] },
  { id: "2", prompt: "Thanh toán di động — phong cách sống",      w: 1, h: 1, colors: ["#00cf6a", "#00a354"] },
  { id: "3", prompt: "Zalopay mùa lễ hội",                        w: 1, h: 2, colors: ["#e53e3e", "#c53030"] },
  { id: "4", prompt: "Nền fintech trừu tượng",                    w: 1, h: 1, colors: ["#6366f1", "#4f46e5"] },
  { id: "5", prompt: "Cảnh thanh toán QR Zalopay",                w: 1, h: 1, colors: ["#0033c9", "#00cf6a"] },
  { id: "6", prompt: "Chuyên viên trẻ dùng Zalopay",              w: 2, h: 1, colors: ["#f59e0b", "#d97706"] },
  { id: "7", prompt: "Ví điện tử — concept art",                  w: 1, h: 1, colors: ["#06b6d4", "#0891b2"] },
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
            <Button size="xs" variant="primary" icon={<Download size={10} />}>Lưu</Button>
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

// ── Generate tab ──────────────────────────────────────────────────────────────

type GenerateState = "idle" | "loading" | "success" | "error";

const QUICK_PROMPTS = [
  "Banner hero Zalopay",
  "Phong cách sống Việt Nam",
  "Nền gradient trừu tượng",
  "Mockup giao diện di động",
];

const MIN_ROWS = 4;
const MAX_ROWS = 10;

function toCSSRatio(r: string): string {
  return r.replace(":", "/");
}

function GenerateTab({
  style,
  aspectRatio,
  quality,
  onStateChange,
  onCanGenerateChange,
  generateRef,
}: {
  style: ImageStyle;
  aspectRatio: AspectRatio;
  quality: ImageQuality;
  onStateChange: (loading: boolean) => void;
  onCanGenerateChange: (can: boolean) => void;
  generateRef: React.MutableRefObject<(() => void) | null>;
}) {
  const [prompt,   setPrompt]   = useState("");
  const [state,    setState]    = useState<GenerateState>("idle");
  const [result,   setResult]   = useState<ImageGenerateResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const textareaRef             = useRef<HTMLTextAreaElement>(null);

  // ── Textarea auto-resize ──────────────────────────────────────────────────
  const autoResize = useCallback((el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    const cs     = getComputedStyle(el);
    const lineH  = parseFloat(cs.lineHeight)    || 22;
    const padTop = parseFloat(cs.paddingTop)    || 12;
    const padBot = parseFloat(cs.paddingBottom) || 12;
    const minH   = lineH * MIN_ROWS + padTop + padBot;
    const maxH   = lineH * MAX_ROWS + padTop + padBot;
    el.style.height = `${Math.min(maxH, Math.max(minH, el.scrollHeight))}px`;
  }, []);

  useEffect(() => {
    if (textareaRef.current) autoResize(textareaRef.current);
  }, [autoResize]);

  function handlePromptChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(e.target.value);
    autoResize(e.target);
  }

  // Notify parent whenever prompt content changes so the Generate button in
  // the right panel can enable / disable correctly.
  useEffect(() => {
    onCanGenerateChange(!!prompt.trim());
  }, [prompt, onCanGenerateChange]);

  // ── Generation ────────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!prompt.trim() || state === "loading") return;

    setState("loading");
    onStateChange(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch("/api/image/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:      prompt.trim(),
          style,
          aspectRatio,
          quality,
        }),
      });

      const data = await res.json() as ImageGenerateResponse | { success: false; error: string };

      if (!data.success) {
        setErrorMsg((data as { success: false; error: string }).error ?? "Tạo ảnh thất bại.");
        setState("error");
        return;
      }

      setResult(data as ImageGenerateResponse);
      setState("success");
    } catch {
      setErrorMsg("Kết nối thất bại. Vui lòng kiểm tra mạng và thử lại.");
      setState("error");
    } finally {
      onStateChange(false);
    }
  }

  // Keep the ref in sync on every render so the panel's Generate button always
  // calls the version of handleGenerate that has the latest prompt/state.
  useEffect(() => {
    generateRef.current = handleGenerate;
  });

  function handleDownload() {
    if (!result?.imageUrl) return;
    const a = document.createElement("a");
    a.href     = result.imageUrl;
    a.download = `zalopay-creative-${Date.now()}.png`;
    a.click();
  }

  function handleQuickPrompt(p: string) {
    setPrompt(p);
    setTimeout(() => {
      if (textareaRef.current) autoResize(textareaRef.current);
    }, 0);
  }

  const charClass =
    prompt.length > 4000 ? "text-[#f87171]" :
    prompt.length > 3000 ? "text-[#fb923c]" :
    "text-[var(--fg-subtle)]";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mt-5 max-w-2xl">

      {/* ── Prompt input card ──────────────────────────────────────────────── */}
      <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5 mb-6">
        <p className="text-[13px] font-semibold text-[var(--fg-default)] mb-3">Mô tả hình ảnh</p>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={handlePromptChange}
          placeholder={"Mô tả ý tưởng của bạn...\n\nVí dụ: Thiết kế banner quảng cáo Zalopay với phong cách hiện đại, màu sắc theo Brand Guideline và bố cục phù hợp cho mạng xã hội."}
          className="w-full px-4 py-3 text-[14px] bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-[var(--radius-lg)] outline-none resize-none text-[var(--fg-default)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--brand-default)] transition-colors"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-[12px] text-[var(--fg-subtle)] leading-relaxed">
            Hãy mô tả càng chi tiết càng tốt để tạo ra hình ảnh phù hợp với mong muốn của bạn.
          </p>
          <span className={["text-[11px] tabular-nums shrink-0 ml-3", charClass].join(" ")}>
            {prompt.length} / 4000
          </span>
        </div>
      </div>

      {/* ── Quick prompts ─────────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="type-label text-[var(--fg-subtle)] mb-3">Ý tưởng gợi ý</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleQuickPrompt(p)}
              className="px-3 py-1.5 text-[12.5px] rounded-full border border-[var(--border-default)] text-[var(--fg-muted)] hover:border-[var(--brand-default)] hover:text-[var(--brand-default)] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {state === "error" && errorMsg && (
        <div className="flex items-start gap-3 p-4 mb-4 bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.20)] rounded-[var(--radius-lg)]">
          <AlertCircle size={16} className="text-[#f87171] shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-medium text-[#f87171]">Tạo ảnh thất bại</p>
            <p className="text-[12px] text-[var(--fg-muted)] mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────────────────────── */}
      {state === "loading" && (
        <div className="rounded-[var(--radius-xl)] overflow-hidden bg-[var(--bg-surface-1)] border border-[var(--border-default)] animate-pulse">
          <div
            className="w-full flex flex-col items-center justify-center gap-3 p-8"
            style={{ aspectRatio: toCSSRatio(aspectRatio) }}
          >
            <Loader2 size={28} className="text-[var(--fg-subtle)] animate-spin" />
            <p className="text-[13px] text-[var(--fg-subtle)]">Đang tạo hình ảnh, vui lòng chờ…</p>
            <p className="text-[11px] text-[var(--fg-subtle)]">
              {STYLE_LABELS[style] ?? style} · {aspectRatio} · {QUALITY_LABELS[quality] ?? quality}
            </p>
          </div>
        </div>
      )}

      {/* ── Result ─────────────────────────────────────────────────────────── */}
      {state === "success" && result && (
        <div className="rounded-[var(--radius-xl)] overflow-hidden border border-[var(--border-default)] bg-[var(--bg-surface-1)]">
          <img
            src={result.imageUrl}
            alt={result.metadata.prompt}
            className="w-full object-cover"
          />

          {/* AI compression notice */}
          {result.wasCompressed && (
            <div className="flex items-start gap-2 px-4 py-2.5 bg-[var(--bg-surface-2)] border-b border-[var(--border-default)]">
              <Info size={13} className="text-[var(--fg-subtle)] shrink-0 mt-0.5" />
              <p className="text-[11.5px] text-[var(--fg-subtle)] leading-snug">
                AI đã tự tối ưu prompt để phù hợp giới hạn của mô hình.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 flex justify-end gap-2 border-t border-[var(--border-default)]">
            <Button size="xs" variant="secondary" icon={<Download size={11} />} onClick={handleDownload}>
              Tải xuống
            </Button>
            <Button size="xs" variant="primary" icon={<Sparkles size={11} />} onClick={handleGenerate}>
              Tạo lại
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ImageGeneratorPage() {
  const { setContent } = useRightPanel();
  const generateRef = useRef<(() => void) | null>(null);

  const [style,       setStyle]       = useState<ImageStyle>("realistic");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [quality,     setQuality]     = useState<ImageQuality>("standard");
  const [isLoading,   setIsLoading]   = useState(false);
  const [canGenerate, setCanGenerate] = useState(false);

  // Stable callback — generateRef never changes identity, so no deps needed.
  const handleGenerateViaRef = useCallback(() => {
    generateRef.current?.();
  }, []);

  useEffect(() => {
    setContent(
      <ImageGeneratorPanel
        style={style}
        onStyleChange={setStyle}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
        quality={quality}
        onQualityChange={setQuality}
        isLoading={isLoading}
        canGenerate={canGenerate}
        onGenerate={handleGenerateViaRef}
      />
    );
    return () => setContent(null);
  }, [
    setContent,
    style, setStyle,
    aspectRatio, setAspectRatio,
    quality, setQuality,
    isLoading,
    canGenerate,
    handleGenerateViaRef,
  ]);

  return (
    <div>
      <WorkspaceHeader
        title="Tạo hình ảnh"
        description="Sinh ảnh sáng tạo chất lượng cao từ mô tả ý tưởng của bạn"
        icon={<Sparkles size={18} className="text-[var(--accent-default)]" />}

        actions={<Button variant="secondary" size="sm" icon={<Grid size={14} />}>Thư viện</Button>}
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
              <GenerateTab
                style={style}
                aspectRatio={aspectRatio}
                quality={quality}
                onStateChange={setIsLoading}
                onCanGenerateChange={setCanGenerate}
                generateRef={generateRef}
              />
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
                description="Mô tả ý tưởng của bạn và nhấn Tạo ảnh để sinh ra những hình ảnh độc đáo."
                action={<Button size="sm" icon={<Plus size={14} />}>Tạo ảnh đầu tiên</Button>}
              />
            );
          }}
        </Tabs>
      </div>
    </div>
  );
}
