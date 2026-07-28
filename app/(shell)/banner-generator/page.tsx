"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Download,
  Filter,
  Grid,
  List,
  Plus,
  Star,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  Pencil,
  X,
} from "lucide-react";
import { useRightPanel } from "@/contexts/right-panel-context";
import { BannerGeneratorPanel } from "@/components/modules/banner-generator/panel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { WorkspaceHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import type { BannerFormValues, BannerResult, BannerStatus } from "@/lib/types";

// ── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_FORM: BannerFormValues = {
  campaignObjective: "",
  promotion:         "",
  brand:             "ZaloPay",
  targetAudience:    "",
  platform:          "facebook",
  language:          "vi",
  dimensions:        { width: 1200, height: 628 },
  visualStyle:       "Modern",
};

const HISTORY_KEY = "banner-history";

const PLATFORM_LABELS: Record<string, string> = {
  facebook:  "Facebook",
  instagram: "Instagram",
  story:     "Story/Reels",
  web:       "Web Banner",
};

const TEMPLATES = [
  { id: "1", name: "Tết Nguyên Đán",    cat: "Seasonal", ratio: "16:9", color: "#e53e3e" },
  { id: "2", name: "Flash Sale 50%",     cat: "Promo",    ratio: "1:1",  color: "#0033c9" },
  { id: "3", name: "ZaloPay Cashback",   cat: "Feature",  ratio: "16:9", color: "#00cf6a" },
  { id: "4", name: "App Download CTA",   cat: "CTA",      ratio: "16:9", color: "#6366f1" },
  { id: "5", name: "Momo vs ZaloPay",    cat: "Compare",  ratio: "1:1",  color: "#f59e0b" },
  { id: "6", name: "ZLP Rewards",        cat: "Loyalty",  ratio: "16:9", color: "#0033c9" },
  { id: "7", name: "QR Code Story",      cat: "Social",   ratio: "9:16", color: "#00cf6a" },
  { id: "8", name: "Holiday Partner",    cat: "Brand",    ratio: "16:9", color: "#9333ea" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Sub-components ────────────────────────────────────────────────────────────

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

interface GenerationStepProps {
  active: boolean;
  done: boolean;
  label: string;
}
function GenerationStep({ active, done, label }: GenerationStepProps) {
  return (
    <div className={`flex items-center gap-1.5 text-[11.5px] font-medium shrink-0 ${active || done ? "text-[var(--brand-default)]" : "text-[var(--fg-subtle)]"}`}>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        done    ? "border-[var(--brand-default)] bg-[var(--brand-default)]"
        : active ? "border-[var(--brand-default)] bg-[var(--brand-subtle)]"
        :          "border-[var(--border-default)]"
      }`}>
        {done   && <Check size={9} className="text-white" />}
        {active && !done && <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-default)] animate-pulse" />}
      </div>
      <span>{label}</span>
    </div>
  );
}

interface BannerResultViewProps {
  result: BannerResult;
  isEditing: boolean;
  editedPrompt: string;
  copied: boolean;
  onEditedPromptChange: (v: string) => void;
  onToggleEdit: () => void;
  onRegenerate: () => void;
  onDownload: () => void;
  onCopyPrompt: () => void;
  isGenerating: boolean;
}
function BannerResultView({
  result,
  isEditing,
  editedPrompt,
  copied,
  onEditedPromptChange,
  onToggleEdit,
  onRegenerate,
  onDownload,
  onCopyPrompt,
  isGenerating,
}: BannerResultViewProps) {
  const time = new Date(result.createdAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-4">
      {/* Banner image */}
      <Card variant="default" padding="none" className="overflow-hidden">
        <div className="bg-[var(--bg-surface-2)] flex items-center justify-center p-4 sm:p-6 min-h-[180px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.imageDataUrl}
            alt="Generated banner"
            className="max-w-full max-h-[500px] rounded-[var(--radius-md)] object-contain shadow-[var(--shadow-2)]"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[var(--border-default)] flex-wrap">
          {result.platform && (
            <Badge variant="default" size="sm">
              {PLATFORM_LABELS[result.platform] ?? result.platform}
            </Badge>
          )}
          <span className="text-[11px] text-[var(--fg-subtle)]">
            {result.dimensions.width} × {result.dimensions.height}
          </span>
          {result.visualStyle && (
            <Badge variant="default" size="sm">{result.visualStyle}</Badge>
          )}
          <span className="text-[11px] text-[var(--fg-subtle)] ml-auto">{time}</span>
        </div>
      </Card>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" icon={<Download size={13} />} onClick={onDownload}>
          Tải xuống
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw size={13} />}
          onClick={onRegenerate}
          disabled={isGenerating}
        >
          Tạo lại
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={isEditing ? <X size={13} /> : <Pencil size={13} />}
          onClick={onToggleEdit}
        >
          {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa prompt"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={copied ? <Check size={13} /> : <Copy size={13} />}
          onClick={onCopyPrompt}
        >
          {copied ? "Đã copy" : "Copy prompt"}
        </Button>
      </div>

      {/* Prompt section */}
      <Card variant="default" padding="md">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[12.5px] font-semibold text-[var(--fg-default)]">
            Prompt đã sử dụng
          </span>
          {result.negativePrompt && (
            <span className="text-[11px] text-[var(--fg-subtle)]">+ negative prompt</span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editedPrompt}
              onChange={(e) => onEditedPromptChange(e.target.value)}
              rows={6}
              className="w-full px-3 py-2.5 text-[12.5px] font-mono bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-md)] outline-none resize-none text-[var(--fg-default)] focus:border-[var(--brand-default)] transition-colors"
            />
            <Button
              variant="primary"
              size="sm"
              icon={<Sparkles size={13} />}
              onClick={onRegenerate}
              disabled={!editedPrompt.trim() || isGenerating}
            >
              Tạo lại với prompt này
            </Button>
          </div>
        ) : (
          <p className="text-[12.5px] text-[var(--fg-muted)] leading-relaxed font-mono bg-[var(--bg-surface-2)] rounded-[var(--radius-md)] p-3 select-all break-all">
            {result.prompt}
          </p>
        )}

        {result.negativePrompt && !isEditing && (
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <p className="text-[11px] font-semibold text-[var(--fg-subtle)] mb-1">Negative prompt:</p>
            <p className="text-[11.5px] text-[var(--fg-subtle)] font-mono leading-relaxed break-all">
              {result.negativePrompt}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

function HistoryCard({ item, onUse }: { item: BannerResult; onUse: (item: BannerResult) => void }) {
  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    const a = document.createElement("a");
    a.href = item.imageDataUrl;
    a.download = `banner-${item.generationId}.jpg`;
    a.click();
  }

  return (
    <Card variant="default" padding="sm" interactive className="group cursor-pointer" onClick={() => onUse(item)}>
      <div className="relative rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-surface-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageDataUrl}
          alt={item.campaignObjective ?? "Banner"}
          className="w-full aspect-video object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="xs" variant="primary" icon={<Download size={12} />} onClick={handleDownload}>
            Tải xuống
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-[12.5px] font-medium text-[var(--fg-default)] truncate">
          {item.campaignObjective || "Banner"}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {item.platform && (
            <Badge variant="default" size="sm">
              {PLATFORM_LABELS[item.platform] ?? item.platform}
            </Badge>
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

  const [formValues, setFormValues]       = useState<BannerFormValues>(DEFAULT_FORM);
  const [status, setStatus]               = useState<BannerStatus>("idle");
  const [result, setResult]               = useState<BannerResult | null>(null);
  const [history, setHistory]             = useState<BannerResult[]>([]);
  const [error, setError]                 = useState("");
  const [quotaPrompt, setQuotaPrompt]     = useState(""); // prompt from IMAGE_QUOTA_EXCEEDED
  const [progressMsg, setProgressMsg]     = useState("Đang tối ưu hóa prompt...");
  const [isEditing, setIsEditing]         = useState(false);
  const [editedPrompt, setEditedPrompt]   = useState("");
  const [copied, setCopied]               = useState(false);
  const [activeTab, setActiveTab]         = useState("create");

  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load history on mount (localStorage is client-only)
  useEffect(() => { setHistory(loadHistory()); }, []);

  const onChange = useCallback((patch: Partial<BannerFormValues>) => {
    setFormValues((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleGenerate = useCallback(async (customPrompt?: string) => {
    if (!customPrompt?.trim() && !formValues.campaignObjective.trim()) return;

    setStatus("loading");
    setError("");
    setQuotaPrompt("");
    setIsEditing(false);
    setProgressMsg("Đang tối ưu hóa prompt với AI...");
    setActiveTab("create");

    if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    progressTimerRef.current = setTimeout(
      () => setProgressMsg("Đang tạo hình ảnh banner..."),
      8_000,
    );

    try {
      const body: Record<string, unknown> = {
        campaignObjective: formValues.campaignObjective,
        promotion:         formValues.promotion,
        brand:             formValues.brand,
        targetAudience:    formValues.targetAudience,
        platform:          formValues.platform,
        language:          formValues.language,
        visualStyle:       formValues.visualStyle,
        dimensions:        formValues.dimensions,
      };
      if (customPrompt?.trim())                body.customPrompt          = customPrompt.trim();
      if (formValues.referenceImageDataUrl)    body.referenceImageDataUrl  = formValues.referenceImageDataUrl;

      const res = await fetch("/api/generate-banner", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      const rawText = await res.text();
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(rawText);
      } catch {
        setError(
          res.status === 413
            ? "Ảnh tham khảo quá lớn. Vui lòng chọn ảnh nhỏ hơn."
            : rawText.slice(0, 200),
        );
        setStatus("error");
        return;
      }

      if (!res.ok) {
        setError((data.error as string) || res.statusText);
        // Save the optimised prompt when image generation failed due to billing
        if (data.errorCode === "IMAGE_QUOTA_EXCEEDED" && data.prompt) {
          setQuotaPrompt(data.prompt as string);
        }
        setStatus("error");
        return;
      }

      const newResult: BannerResult = {
        generationId:      data.generationId as string,
        imageDataUrl:      data.imageDataUrl as string,
        prompt:            data.prompt as string,
        negativePrompt:    data.negativePrompt as string | undefined,
        dimensions:        data.dimensions as { width: number; height: number },
        platform:          data.platform as string | undefined,
        visualStyle:       data.visualStyle as string | undefined,
        campaignObjective: formValues.campaignObjective,
        promotion:         formValues.promotion,
        brand:             formValues.brand,
        createdAt:         new Date().toISOString(),
      };

      setResult(newResult);
      setEditedPrompt(newResult.prompt);
      setStatus("done");

      setHistory((prev) => {
        const updated = [newResult, ...prev.slice(0, 19)]; // keep latest 20
        persistHistory(updated);
        return updated;
      });
    } catch (err) {
      setError(`Yêu cầu thất bại: ${(err as Error).message}`);
      setStatus("error");
    } finally {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    }
  }, [formValues]);

  const handleRegenerate = useCallback(() => {
    if (isEditing && editedPrompt.trim()) {
      handleGenerate(editedPrompt);
    } else {
      handleGenerate();
    }
  }, [isEditing, editedPrompt, handleGenerate]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const a = document.createElement("a");
    a.href     = result.imageDataUrl;
    a.download = `banner-${result.generationId}.jpg`;
    a.click();
  }, [result]);

  const handleCopyPrompt = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [result]);

  // Display a history item as the current result (without re-generating)
  const handleUseHistoryItem = useCallback((item: BannerResult) => {
    setResult(item);
    setEditedPrompt(item.prompt);
    setStatus("done");
    setIsEditing(false);
    setActiveTab("create");
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (progressTimerRef.current) clearTimeout(progressTimerRef.current); };
  }, []);

  // Inject controlled panel into right panel context
  useEffect(() => {
    setContent(
      <BannerGeneratorPanel
        formValues={formValues}
        onChange={onChange}
        onGenerate={() => handleGenerate()}
        status={status}
      />,
    );
  }, [formValues, onChange, handleGenerate, status, setContent]);

  useEffect(() => { return () => setContent(null); }, [setContent]);

  const isGenerating   = status === "loading";
  const isImageStep    = progressMsg.includes("Tạo hình");
  const historyBadge   = history.length > 0 ? history.length : undefined;

  return (
    <div>
      <WorkspaceHeader
        title="Banner Generator"
        description="Tạo banner quảng cáo đúng chuẩn ZaloPay chỉ trong vài giây"
        icon={<ImageIcon size={18} className="text-[var(--brand-default)]" />}
        badge={<Badge variant="primary" size="sm">Beta</Badge>}
        actions={
          status === "done" && result ? (
            <Button variant="primary" size="sm" icon={<Download size={14} />} onClick={handleDownload}>
              Tải xuống
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
            { id: "templates",  label: "Templates", badge: TEMPLATES.length },
          ]}
        >
          {(id) => {

            // ── Tạo mới tab ───────────────────────────────────────────
            if (id === "create") return (
              <div className="mt-5 space-y-5">

                {/* Loading state */}
                {isGenerating && (
                  <Card variant="default" padding="md">
                    <div className="flex items-center gap-4 py-2">
                      <Spinner size="md" />
                      <div>
                        <p className="text-[14px] font-semibold text-[var(--fg-default)]">
                          {progressMsg}
                        </p>
                        <p className="text-[12.5px] text-[var(--fg-muted)]">
                          Có thể mất 30–60 giây, vui lòng không đóng trang...
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <GenerationStep active={!isImageStep} done={isImageStep}  label="Tối ưu hóa prompt" />
                      <div className="h-px flex-1 bg-[var(--border-default)]" />
                      <GenerationStep active={isImageStep}  done={false}        label="Tạo hình ảnh" />
                    </div>
                  </Card>
                )}

                {/* Error state */}
                {status === "error" && error && (
                  <div className="space-y-3">
                    <Alert variant="danger" title="Tạo banner thất bại">{error}</Alert>
                    {quotaPrompt && (
                      <Card variant="default" padding="md">
                        <p className="text-[12px] font-medium text-[var(--fg-subtle)] mb-2">
                          Prompt đã tạo (copy để dùng với công cụ khác):
                        </p>
                        <p className="text-[12.5px] text-[var(--fg-default)] leading-relaxed font-mono whitespace-pre-wrap break-all bg-[var(--bg-surface-2)] rounded-[var(--radius-sm)] p-3">
                          {quotaPrompt}
                        </p>
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={copied ? <Check size={12} /> : <Copy size={12} />}
                          className="mt-2"
                          onClick={async () => {
                            try { await navigator.clipboard.writeText(quotaPrompt); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
                          }}
                        >
                          {copied ? "Đã copy" : "Copy prompt"}
                        </Button>
                      </Card>
                    )}
                    <div className="flex justify-center">
                      <Button variant="secondary" size="sm" icon={<RefreshCw size={13} />} onClick={handleRegenerate}>
                        Thử lại
                      </Button>
                    </div>
                  </div>
                )}

                {/* Result */}
                {status === "done" && result && (
                  <BannerResultView
                    result={result}
                    isEditing={isEditing}
                    editedPrompt={editedPrompt}
                    copied={copied}
                    onEditedPromptChange={setEditedPrompt}
                    onToggleEdit={() => setIsEditing((v) => !v)}
                    onRegenerate={handleRegenerate}
                    onDownload={handleDownload}
                    onCopyPrompt={handleCopyPrompt}
                    isGenerating={isGenerating}
                  />
                )}

                {/* Idle state */}
                {status === "idle" && (
                  <EmptyState
                    icon={Sparkles}
                    title="Sẵn sàng tạo banner"
                    description="Điền thông tin chiến dịch ở bảng bên phải, rồi nhấn Tạo banner ngay."
                  />
                )}
              </div>
            );

            // ── Banner của tôi tab ─────────────────────────────────────
            if (id === "my-banners") return (
              <div className="mt-5">
                {history.length === 0 ? (
                  <EmptyState
                    icon={ImageIcon}
                    title="Chưa có banner nào"
                    description="Các banner bạn tạo sẽ được lưu tự động ở đây."
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

            // ── Templates tab ──────────────────────────────────────────
            return (
              <div className="mt-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Tất cả</Badge>
                    <Badge variant="default">Seasonal</Badge>
                    <Badge variant="default">Promo</Badge>
                    <Badge variant="default">Social</Badge>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
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
                        <button className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
                  <Card
                    variant="flat"
                    padding="sm"
                    interactive
                    className="flex flex-col items-center justify-center gap-2 min-h-[140px] cursor-pointer border-2 border-dashed"
                    onClick={() => setActiveTab("create")}
                  >
                    <Plus size={20} className="text-[var(--fg-subtle)]" />
                    <p className="text-[12.5px] text-[var(--fg-muted)]">Tạo template mới</p>
                  </Card>
                </div>
              </div>
            );
          }}
        </Tabs>
      </div>
    </div>
  );
}
