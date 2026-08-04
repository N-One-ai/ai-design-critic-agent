"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw,
  ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Award,
  Shield,
  Palette,
  Type,
  Eye,
  Layout,
  MousePointerClick,
  Zap,
  Download,
  FileText,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ScoreBar, ProgressCircle } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { UploadArea } from "@/components/ui/upload-area";
import type {
  AnalysisResult,
  AnalysisStatus,
  AnalysisCategories,
  CategoryScore,
  AiRedesignPrompt,
} from "@/lib/types";

// ── Props ──────────────────────────────────────────────────────────────────────

interface WorkspaceProps {
  selectedFile: File | null;
  previewUrl: string | null;
  status: AnalysisStatus;
  result: AnalysisResult | null;
  error: string;
  isLoading: boolean;
  onFileSelect: (file: File) => void;
  onRetry?: () => void;
}

// ── Score & verdict helpers ────────────────────────────────────────────────────

type ScoreVariant = "success" | "warning" | "danger" | "brand";
type Verdict      = "pass" | "needs-work" | "fail";

function scoreVariant(score: number | null | undefined): ScoreVariant {
  if (score == null) return "brand";
  if (score >= 7) return "success";
  if (score >= 5) return "warning";
  return "danger";
}

function scoreTextColor(score: number | null | undefined): string {
  const v = scoreVariant(score);
  if (v === "success") return "text-[var(--accent-default)]";
  if (v === "warning") return "text-[var(--warning-default)]";
  if (v === "danger")  return "text-[var(--danger-default)]";
  return "text-[var(--fg-subtle)]";
}

function verdictFromScore(score: number | null | undefined): Verdict {
  if (score == null) return "needs-work";
  if (score >= 7) return "pass";
  if (score >= 5) return "needs-work";
  return "fail";
}

const VERDICT_CONFIG: Record<Verdict, {
  label:  string;
  color:  string;
  bg:     string;
  border: string;
  Icon:   LucideIcon;
}> = {
  pass: {
    label:  "PASS",
    color:  "text-[var(--accent-default)]",
    bg:     "bg-[var(--accent-subtle)]",
    border: "border-[var(--accent-default)]",
    Icon:   CheckCircle2,
  },
  "needs-work": {
    label:  "NEEDS WORK",
    color:  "text-[var(--warning-default)]",
    bg:     "bg-[var(--warning-subtle)]",
    border: "border-[var(--warning-default)]",
    Icon:   AlertTriangle,
  },
  fail: {
    label:  "FAIL",
    color:  "text-[var(--danger-default)]",
    bg:     "bg-[var(--danger-subtle)]",
    border: "border-[var(--danger-default)]",
    Icon:   XCircle,
  },
};

// ── Category config ────────────────────────────────────────────────────────────

interface CategoryConfig {
  label: string;
  Icon:  LucideIcon;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  logoCompliance:       { label: "Logo",            Icon: Award },
  trademarkCompliance:  { label: "Trademark Z",      Icon: Shield },
  colorCompliance:      { label: "Màu sắc",          Icon: Palette },
  typographyCompliance: { label: "Typography",       Icon: Type },
  visualHierarchy:      { label: "Visual Hierarchy", Icon: Eye },
  layout:               { label: "Layout",           Icon: Layout },
  ctaEvaluation:        { label: "Call to Action",   Icon: MousePointerClick },
};

const CATEGORY_ORDER = [
  "logoCompliance",
  "trademarkCompliance",
  "colorCompliance",
  "typographyCompliance",
  "visualHierarchy",
  "layout",
  "ctaEvaluation",
] as const;

// ── Analysis Timeline ──────────────────────────────────────────────────────────

const ANALYSIS_STEPS = [
  "Tải thiết kế lên",
  "Phân tích nhận diện thương hiệu & logo",
  "Kiểm tra màu sắc & typography",
  "Đánh giá bố cục & visual hierarchy",
  "Tổng hợp kết quả AI...",
];
const STEP_DELAYS = [0, 1400, 3800, 6800, 11000];

function AnalysisTimeline({ isLoading }: { isLoading: boolean }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    setActiveStep(0);
    const timers = STEP_DELAYS.slice(1).map((delay, i) =>
      setTimeout(() => setActiveStep(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--brand-subtle)] flex items-center justify-center shrink-0">
          <Zap size={14} strokeWidth={2} className="text-[var(--brand-default)]" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[var(--fg-default)]">AI đang phân tích</p>
          <p className="text-[11px] text-[var(--fg-subtle)]">Kiểm tra 7 tiêu chuẩn thương hiệu Zalopay</p>
        </div>
      </div>

      {ANALYSIS_STEPS.map((step, i) => {
        const isComplete = i < activeStep;
        const isActive   = i === activeStep;
        return (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 transition-opacity duration-300",
              i > activeStep ? "opacity-30" : "opacity-100"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
              isComplete ? "bg-[var(--accent-subtle)]" :
              isActive   ? "bg-[var(--brand-subtle)]"  :
                           "bg-[var(--bg-surface-3)]"
            )}>
              {isComplete ? (
                <CheckCircle2 size={12} strokeWidth={2.5} className="text-[var(--accent-default)]" />
              ) : isActive ? (
                <div className="w-2 h-2 rounded-full bg-[var(--brand-default)] animate-pulse" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--fg-subtle)]" />
              )}
            </div>
            <span className={cn(
              "text-[13px] leading-none",
              isComplete ? "text-[var(--fg-muted)]"              :
              isActive   ? "text-[var(--fg-default)] font-medium" :
                           "text-[var(--fg-subtle)]"
            )}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Stage Divider ──────────────────────────────────────────────────────────────

function StageDivider({ index, label }: { index: number; label: string }) {
  return (
    <div className="flex items-center gap-3 pt-6 pb-1">
      <span className="text-[10px] font-mono font-bold text-[var(--fg-subtle)] tracking-wider shrink-0">
        0{index}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--fg-subtle)] shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-[var(--border-default)]" />
    </div>
  );
}

// ── Stat Chip ──────────────────────────────────────────────────────────────────

function StatChip({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: "neutral" | "success" | "warning";
}) {
  return (
    <div className={cn(
      "inline-flex items-center text-[11.5px] px-2.5 py-1 rounded-[var(--radius-full)] border",
      variant === "success" ? "bg-[var(--accent-subtle)]  text-[var(--accent-default)]  border-transparent" :
      variant === "warning" ? "bg-[var(--warning-subtle)] text-[var(--warning-default)] border-transparent" :
                              "bg-[var(--bg-surface-1)]   text-[var(--fg-subtle)]       border-[var(--border-default)]"
    )}>
      {label}
    </div>
  );
}

// ── Stage 1: Executive Report ──────────────────────────────────────────────────

function ExecutiveReport({
  result,
  onRetry,
}: {
  result: AnalysisResult;
  onRetry?: () => void;
}) {
  const score   = result.overallScore;
  const verdict = verdictFromScore(score);
  const cfg     = VERDICT_CONFIG[verdict];
  const { Icon: VIcon } = cfg;

  const cats = result.categories as Record<string, unknown> | undefined;
  const total   = cats ? CATEGORY_ORDER.filter((k) => cats[k] != null).length : 0;
  const passed  = cats ? CATEGORY_ORDER.filter((k) => {
    const c = cats[k] as CategoryScore | undefined;
    return c?.score != null && c.score >= 7;
  }).length : 0;
  const failing = cats ? CATEGORY_ORDER.filter((k) => {
    const c = cats[k] as CategoryScore | undefined;
    return c?.score != null && c.score < 5;
  }).length : 0;

  return (
    <div className="space-y-4">
      {/* Verdict row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-full)] text-[10.5px] font-bold tracking-widest border shrink-0",
            cfg.color, cfg.bg, cfg.border
          )}>
            <VIcon size={11} strokeWidth={2.5} />
            {cfg.label}
          </div>
          <span className="text-[13px] text-[var(--fg-subtle)] truncate max-w-xs">
            {result.designName || "Thiết kế"}
          </span>
        </div>
        {onRetry && (
          <Button variant="ghost" size="sm" icon={<RefreshCw size={13} />} onClick={onRetry}>
            Phân tích lại
          </Button>
        )}
      </div>

      {/* Score */}
      <div className="flex items-end gap-5 flex-wrap">
        <div className="flex items-baseline gap-1.5 shrink-0">
          <span className={cn("text-[64px] font-bold leading-none tabular-nums", scoreTextColor(score))}>
            {score ?? "—"}
          </span>
          <span className="text-[20px] text-[var(--fg-subtle)] font-light mb-1">/10</span>
        </div>
        <div className="flex-1 min-w-[160px] max-w-sm pb-1">
          <ScoreBar score={score ?? 0} />
        </div>
      </div>

      {/* Summary */}
      {result.summary && (
        <p className="text-[14px] text-[var(--fg-muted)] leading-[1.75] max-w-2xl">
          {result.summary}
        </p>
      )}

      {/* Signal chips */}
      {total > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          <StatChip label={`${total} hạng mục kiểm tra`} />
          {passed > 0 && <StatChip label={`${passed} đạt chuẩn`} variant="success" />}
          {failing > 0 && <StatChip label={`${failing} cần khắc phục`} variant="warning" />}
        </div>
      )}
    </div>
  );
}

// ── Stage 2: Brand Health ──────────────────────────────────────────────────────

function BrandHealth({ categories }: { categories?: AnalysisCategories }) {
  if (!categories) return null;
  const cats    = categories as Record<string, unknown>;
  const visible = CATEGORY_ORDER.filter((k) => k in cats && cats[k] != null);
  if (!visible.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {visible.map((key) => {
        const cat    = cats[key] as CategoryScore & Record<string, unknown>;
        const config = CATEGORY_CONFIG[key];
        if (!config) return null;
        const { Icon, label } = config;
        const score = cat.score;

        return (
          <div
            key={key}
            className="flex flex-col gap-2 p-3.5 rounded-[var(--radius-lg)] bg-[var(--bg-surface-1)] border border-[var(--border-default)]"
          >
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <Icon size={13} strokeWidth={1.8} className="text-[var(--fg-subtle)] shrink-0" />
                <span className="text-[12px] font-semibold text-[var(--fg-default)] truncate">
                  {label}
                </span>
              </div>
              <span className={cn("text-[15px] font-bold tabular-nums shrink-0", scoreTextColor(score))}>
                {score != null ? score : "—"}
              </span>
            </div>
            {typeof score === "number" && <ScoreBar score={score} />}
            {cat.conclusion && (
              <p className="text-[11px] text-[var(--fg-subtle)] leading-relaxed line-clamp-2">
                {cat.conclusion as string}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Stage 3: Visual Review ─────────────────────────────────────────────────────

function VisualReview({
  previewUrl,
  result,
}: {
  previewUrl: string | null;
  result: AnalysisResult;
}) {
  if (!previewUrl) return null;

  const cats = result.categories as Record<string, unknown> | undefined;
  const chips = cats
    ? CATEGORY_ORDER.slice(0, 4).flatMap((key) => {
        const cat = cats[key] as CategoryScore | undefined;
        if (!cat || cat.score == null) return [];
        const config = CATEGORY_CONFIG[key];
        if (!config) return [];
        return [{ key, label: config.label, score: cat.score }];
      })
    : [];

  return (
    <div className="space-y-5">
      {/* Annotated image */}
      <div className="relative rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-surface-2)] border border-[var(--border-default)] flex items-center justify-center min-h-[200px]">
        <img
          src={previewUrl}
          alt="Design preview"
          className="max-h-[400px] max-w-full object-contain"
        />
        {chips.length > 0 && (
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {chips.map(({ key, label, score }) => {
              const v = scoreVariant(score);
              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] text-[10.5px] font-semibold shadow-sm",
                    v === "success" ? "bg-[rgba(0,207,106,0.9)] text-white"  :
                    v === "warning" ? "bg-[rgba(217,119,6,0.9)] text-white"  :
                                      "bg-[rgba(220,38,38,0.9)] text-white"
                  )}
                >
                  <span>{label}</span>
                  <span className="font-bold tabular-nums">{score}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick findings — no card borders, clean columnar lists */}
      {(result.strengths?.length || result.mainIssues?.length) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {result.strengths?.length ? (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <CheckCircle2 size={12} strokeWidth={2} className="text-[var(--accent-default)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)]">
                  Điểm mạnh
                </span>
              </div>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-[12.5px] text-[var(--fg-muted)] leading-relaxed">
                    <span className="w-1 h-1 mt-2 rounded-full bg-[var(--accent-default)] shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.mainIssues?.length ? (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <AlertTriangle size={12} strokeWidth={2} className="text-[var(--warning-default)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)]">
                  Vấn đề
                </span>
              </div>
              <ul className="space-y-2">
                {result.mainIssues.map((issue, i) => (
                  <li key={i} className="flex gap-2 text-[12.5px] text-[var(--fg-muted)] leading-relaxed">
                    <span className="w-1 h-1 mt-2 rounded-full bg-[var(--warning-default)] shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ── Stage 4: AI Insights ───────────────────────────────────────────────────────

function AIInsights({ result }: { result: AnalysisResult }) {
  const narrative = result.summary;
  const issues    = result.mainIssues;
  if (!narrative && !issues?.length) return null;

  return (
    <div className="space-y-5">
      {/* Analyst narrative — styled as a pull quote */}
      {narrative && (
        <div
          className="pl-4 border-l-2 border-[var(--brand-default)]"
        >
          <p className="text-[14px] text-[var(--fg-default)] leading-[1.8] italic font-normal">
            &ldquo;{narrative}&rdquo;
          </p>
        </div>
      )}

      {/* Issue threads */}
      {issues?.length ? (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)] mb-3">
            Các vấn đề phát hiện
          </p>
          {issues.map((issue, i) => (
            <div
              key={i}
              className="flex gap-3 px-4 py-3 rounded-[var(--radius-md)] bg-[var(--warning-subtle)] border-l-2 border-[var(--warning-default)]"
            >
              <span className="text-[10.5px] font-bold text-[var(--warning-default)] shrink-0 mt-0.5 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-[13px] text-[var(--fg-muted)] leading-relaxed">{issue}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ── Prompt Block ───────────────────────────────────────────────────────────────

function PromptBlock({ label, text }: { label: string; text: string }) {
  const [copied,   setCopied]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[var(--bg-surface-2)]">
        <span className="text-[12px] font-semibold text-[var(--fg-default)]">
          Prompt cho {label}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            title="Sao chép"
            className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-subtle)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--fg-default)] transition-colors"
          >
            {copied
              ? <Check size={12} strokeWidth={2.5} className="text-[var(--accent-default)]" />
              : <Copy size={12} strokeWidth={1.8} />
            }
          </button>
          <button
            onClick={() => setExpanded((p) => !p)}
            title={expanded ? "Thu gọn" : "Xem prompt"}
            className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-subtle)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--fg-default)] transition-colors"
          >
            {expanded ? <ChevronUp size={12} strokeWidth={2} /> : <ChevronDown size={12} strokeWidth={2} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-3.5 py-3 bg-[var(--bg-surface-1)]">
          <pre className="text-[11.5px] text-[var(--fg-muted)] whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Stage 5: AI Actions ────────────────────────────────────────────────────────

function AIActions({ result }: { result: AnalysisResult }) {
  const suggestions = result.improvementSuggestions;
  const prompt      = result.aiRedesignPrompt;
  if (!suggestions?.length && !prompt?.chatgptPrompt && !prompt?.geminiPrompt) return null;

  const cats = result.categories as Record<string, unknown> | undefined;
  const failingCount = cats
    ? CATEGORY_ORDER.filter((k) => {
        const c = cats[k] as CategoryScore | undefined;
        return c?.score != null && c.score < 5;
      }).length
    : 0;

  const getPriority = (i: number): "HIGH" | "MED" | "LOW" => {
    if (i < Math.min(failingCount, 2)) return "HIGH";
    if (i < 4) return "MED";
    return "LOW";
  };

  const priorityStyle: Record<"HIGH" | "MED" | "LOW", string> = {
    HIGH: "bg-[var(--danger-subtle)] text-[var(--danger-default)]",
    MED:  "bg-[var(--warning-subtle)] text-[var(--warning-default)]",
    LOW:  "bg-[var(--bg-surface-3)] text-[var(--fg-subtle)]",
  };

  return (
    <div className="space-y-5">
      {/* Action items */}
      {suggestions?.length ? (
        <div className="space-y-2">
          {suggestions.map((s, i) => {
            const priority = getPriority(i);
            return (
              <div
                key={i}
                className="flex items-start gap-3 px-4 py-3 rounded-[var(--radius-lg)] bg-[var(--bg-surface-1)] border border-[var(--border-default)]"
              >
                <span className={cn(
                  "shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-[var(--radius-xs)] tracking-wider mt-[2px] leading-tight",
                  priorityStyle[priority]
                )}>
                  {priority}
                </span>
                <p className="text-[13px] text-[var(--fg-muted)] leading-relaxed">{s}</p>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Prompt Studio */}
      {(prompt?.chatgptPrompt || prompt?.geminiPrompt) ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={13} strokeWidth={2} className="text-[var(--brand-default)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--fg-subtle)]">
              Prompt thiết kế lại bằng AI
            </span>
          </div>
          <div className="space-y-2">
            {prompt.chatgptPrompt && (
              <PromptBlock label="ChatGPT" text={prompt.chatgptPrompt} />
            )}
            {prompt.geminiPrompt && (
              <PromptBlock label="Gemini" text={prompt.geminiPrompt} />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ── Stage 6: Export Center ─────────────────────────────────────────────────────

function ExportCenter({ result }: { result: AnalysisResult }) {
  const [copiedReport, setCopiedReport] = useState(false);

  const buildReportText = () =>
    [
      `AI DESIGN REVIEW — ${result.designName ?? "Thiết kế"}`,
      `Điểm tổng thể: ${result.overallScore ?? "—"}/10`,
      "",
      result.summary ?? "",
      "",
      "ĐIỂM MẠNH:",
      ...(result.strengths?.map((s) => `• ${s}`) ?? []),
      "",
      "VẤN ĐỀ:",
      ...(result.mainIssues?.map((i) => `• ${i}`) ?? []),
      "",
      "ĐỀ XUẤT:",
      ...(result.improvementSuggestions?.map((s, i) => `${i + 1}. ${s}`) ?? []),
    ].join("\n");

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(buildReportText());
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `brand-review-${(result.designName ?? "design").replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 pb-6">
      <Button
        variant="secondary"
        size="sm"
        icon={
          copiedReport
            ? <Check size={13} className="text-[var(--accent-default)]" />
            : <Copy size={13} />
        }
        onClick={handleCopyReport}
      >
        {copiedReport ? "Đã sao chép" : "Sao chép báo cáo"}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        icon={<Download size={13} />}
        onClick={handleDownloadJSON}
      >
        Tải JSON
      </Button>
    </div>
  );
}

// ── Review Document (wraps all 6 stages) ──────────────────────────────────────

function ReviewDocument({
  result,
  previewUrl,
  onRetry,
}: {
  result: AnalysisResult;
  previewUrl: string | null;
  onRetry?: () => void;
}) {
  return (
    <div>
      <ExecutiveReport result={result} onRetry={onRetry} />

      <StageDivider index={1} label="Brand Health" />
      <BrandHealth categories={result.categories} />

      <StageDivider index={2} label="Visual Review" />
      <VisualReview previewUrl={previewUrl} result={result} />

      <StageDivider index={3} label="Nhận định của AI" />
      <AIInsights result={result} />

      <StageDivider index={4} label="Đề xuất cải thiện" />
      <AIActions result={result} />

      <StageDivider index={5} label="Xuất báo cáo" />
      <ExportCenter result={result} />
    </div>
  );
}

// ── Upload Hero ────────────────────────────────────────────────────────────────

function UploadHero({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-full)] bg-[var(--brand-subtle)] text-[var(--brand-default)] text-[11px] font-semibold mb-4">
          <Sparkles size={11} strokeWidth={2} />
          AI-Powered Review
        </div>
        <h1 className="text-[24px] font-black text-[var(--fg-default)] mb-2 tracking-tight">
          AI Design Review
        </h1>
        <p className="text-[13.5px] text-[var(--fg-muted)] max-w-sm mx-auto leading-relaxed">
          Tải thiết kế lên để nhận báo cáo tuân thủ thương hiệu Zalopay theo 7 tiêu chí.
        </p>
      </div>

      <UploadArea
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onFiles={(files) => {
          const f = files[0];
          if (f) onFileSelect(f);
        }}
      />

      <div className="flex flex-wrap justify-center gap-2">
        {[
          { Icon: Award,             label: "Logo & Trademark" },
          { Icon: Palette,           label: "Màu sắc" },
          { Icon: Type,              label: "Typography" },
          { Icon: Eye,               label: "Visual Hierarchy" },
          { Icon: Layout,            label: "Layout" },
          { Icon: MousePointerClick, label: "Call to Action" },
        ].map(({ Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-full)] text-[11.5px] text-[var(--fg-muted)]"
          >
            <Icon size={11} strokeWidth={1.8} className="text-[var(--fg-subtle)]" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── File Bar ───────────────────────────────────────────────────────────────────

function FileBar({
  file,
  onReplace,
}: {
  file: File;
  onReplace: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 mb-5 rounded-[var(--radius-lg)] bg-[var(--bg-surface-1)] border border-[var(--border-default)]">
      <div className="flex items-center gap-2.5 min-w-0">
        <ImageIcon size={14} strokeWidth={1.8} className="text-[var(--fg-subtle)] shrink-0" />
        <span className="text-[13px] font-medium text-[var(--fg-default)] truncate">{file.name}</span>
        <span className="text-[11.5px] text-[var(--fg-subtle)] shrink-0">
          {(file.size / 1024).toFixed(0)} KB
        </span>
      </div>
      <Button variant="ghost" size="xs" icon={<RefreshCw size={12} />} onClick={onReplace}>
        Thay ảnh
      </Button>
    </div>
  );
}

// ── BrandCheckerWorkspace ──────────────────────────────────────────────────────

export function BrandCheckerWorkspace({
  selectedFile,
  previewUrl,
  status,
  result,
  error,
  isLoading,
  onFileSelect,
  onRetry,
}: WorkspaceProps) {
  const handleReplaceFile = () => {
    const inp    = document.createElement("input");
    inp.type     = "file";
    inp.accept   = "image/png,image/jpeg,image/jpg,image/webp";
    inp.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) onFileSelect(f);
    };
    inp.click();
  };

  return (
    <div className="p-4 sm:p-6 max-w-none">

      {/* File context bar — visible once a file is selected */}
      {selectedFile && (
        <FileBar file={selectedFile} onReplace={handleReplaceFile} />
      )}

      {/* Empty state: upload hero */}
      {!selectedFile && (
        <UploadHero onFileSelect={onFileSelect} />
      )}

      {/* Loading: AI Analysis Timeline */}
      {isLoading && <AnalysisTimeline isLoading={isLoading} />}

      {/* Error state */}
      {error && !isLoading && (
        <div className="space-y-3">
          <Alert variant="danger" title="Lỗi phân tích">{error}</Alert>
          {onRetry && (
            <div className="flex justify-center">
              <Button variant="secondary" size="sm" icon={<RefreshCw size={13} />} onClick={onRetry}>
                Thử lại
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Ready state: file selected, awaiting analysis */}
      {selectedFile && !result && !isLoading && !error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] bg-[var(--bg-surface-2)] border border-[var(--border-default)]">
          <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--brand-subtle)] flex items-center justify-center shrink-0">
            <Zap size={14} strokeWidth={2} className="text-[var(--brand-default)]" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[var(--fg-default)]">Sẵn sàng phân tích</p>
            <p className="text-[12px] text-[var(--fg-muted)]">
              Nhấn{" "}
              <strong className="text-[var(--fg-default)]">Phân tích ngay</strong>{" "}
              ở bảng bên phải để bắt đầu.
            </p>
          </div>
        </div>
      )}

      {/* Results: 6-stage Review Document */}
      {result && !isLoading && (
        <div className="animate-in">
          <ReviewDocument result={result} previewUrl={previewUrl} onRetry={onRetry} />
        </div>
      )}

    </div>
  );
}
