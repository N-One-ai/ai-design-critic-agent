"use client";

import { useState } from "react";
import {
  Award,
  Shield,
  Palette,
  Type,
  Eye,
  Layout,
  MousePointerClick,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScoreBar, ProgressCircle } from "@/components/ui/progress";
import { SkeletonCard, Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type {
  AnalysisResult,
  AnalysisCategories,
  CategoryScore,
  CtaEvaluationCategory,
  AiRedesignPrompt,
} from "@/lib/types";

// ── Category config ───────────────────────────────────────────────────────────

interface CategoryConfig {
  label: string;
  description: string;
  Icon: LucideIcon;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  logoCompliance:      { label: "Logo",             description: "Kiểm tra logo thương hiệu",   Icon: Award },
  trademarkCompliance: { label: "Trademark Z",       description: "Biểu tượng chữ Z",            Icon: Shield },
  colorCompliance:     { label: "Màu sắc",           description: "Bảng màu thương hiệu",        Icon: Palette },
  typographyCompliance:{ label: "Typography",        description: "Font chữ thương hiệu",         Icon: Type },
  visualHierarchy:     { label: "Visual Hierarchy",  description: "Thứ bậc thị giác",            Icon: Eye },
  layout:              { label: "Layout",            description: "Bố cục & khoảng trắng",        Icon: Layout },
  ctaEvaluation:       { label: "Call to Action",    description: "CTA — hành động mong muốn",    Icon: MousePointerClick },
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

// ── Score helpers ─────────────────────────────────────────────────────────────

function scoreVariant(score: number | null | undefined): "success" | "warning" | "danger" | "brand" {
  if (score === null || score === undefined) return "brand";
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

// ── AnalysisResultCards ───────────────────────────────────────────────────────

export interface AnalysisResultCardsProps {
  result: AnalysisResult;
  onRetry?: () => void;
}

export function AnalysisResultCards({ result, onRetry }: AnalysisResultCardsProps) {
  return (
    <div className="space-y-5">
      <OverallScoreCard result={result} />
      <CategoriesGrid categories={result.categories} />
      <StrengthsAndIssuesRow
        strengths={result.strengths}
        issues={result.mainIssues}
      />
      <SuggestionsCard suggestions={result.improvementSuggestions} />
      {result.aiRedesignPrompt && (
        <RedesignPromptCard prompt={result.aiRedesignPrompt} />
      )}
      {onRetry && (
        <div className="flex justify-center pt-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={13} />}
            onClick={onRetry}
          >
            Phân tích lại
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Overall score card ────────────────────────────────────────────────────────

function OverallScoreCard({ result }: { result: AnalysisResult }) {
  const score   = result.overallScore;
  const variant = scoreVariant(score);

  return (
    <Card variant="default" padding="md">
      <div className="flex items-start gap-5">
        <ProgressCircle
          value={(score ?? 0) * 10}
          size={84}
          strokeWidth={6}
          variant={variant}
          showValue={false}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--fg-subtle)] mb-1">
            Điểm tổng thể
          </p>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className={cn("text-[44px] font-bold leading-none tabular-nums", scoreTextColor(score))}>
              {score ?? "—"}
            </span>
            <span className="text-[18px] text-[var(--fg-subtle)] font-normal">/10</span>
          </div>
          <ScoreBar score={score ?? 0} className="mb-3" />
          {result.summary && (
            <p className="text-[13px] text-[var(--fg-muted)] leading-relaxed">
              {result.summary}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// ── Categories grid ───────────────────────────────────────────────────────────

function CategoriesGrid({ categories }: { categories?: AnalysisCategories }) {
  if (!categories) return null;

  const cats = categories as Record<string, unknown>;
  const visible = CATEGORY_ORDER.filter((key) => key in cats && cats[key] != null);
  if (!visible.length) return null;

  return (
    <div>
      <h3 className="text-[12px] font-semibold uppercase tracking-widest text-[var(--fg-subtle)] mb-3 px-0.5">
        Phân tích theo hạng mục
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {visible.map((key) => (
          <CategoryCard
            key={key}
            categoryKey={key}
            category={cats[key] as CategoryScore & Record<string, unknown>}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({
  categoryKey,
  category,
}: {
  categoryKey: string;
  category: CategoryScore & Record<string, unknown>;
}) {
  const config  = CATEGORY_CONFIG[categoryKey];
  const score   = category.score;
  const variant = scoreVariant(score);
  if (!config) return null;
  const { Icon, label, description } = config;

  return (
    <Card variant="default" padding="sm">
      {/* Header row */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)] flex items-center justify-center shrink-0">
          <Icon size={14} strokeWidth={1.8} className="text-[var(--fg-muted)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12.5px] font-semibold text-[var(--fg-default)] leading-tight truncate">
            {label}
          </p>
          <p className="text-[11px] text-[var(--fg-subtle)] leading-tight truncate">
            {description}
          </p>
        </div>
        <span className={cn("text-[19px] font-bold tabular-nums shrink-0", scoreTextColor(score))}>
          {score !== null && score !== undefined ? score : "—"}
        </span>
      </div>

      {/* Score bar */}
      {typeof score === "number" && (
        <ScoreBar score={score} className="mb-2.5" />
      )}

      {/* Conclusion */}
      {category.conclusion && (
        <p className="text-[11.5px] text-[var(--fg-muted)] leading-relaxed">
          {category.conclusion as string}
        </p>
      )}

      {/* CTA extra fields */}
      {categoryKey === "ctaEvaluation" && (
        <CtaExtra category={category as unknown as CtaEvaluationCategory} />
      )}
    </Card>
  );
}

function CtaExtra({ category }: { category: CtaEvaluationCategory }) {
  if (!category.ctaFound && !category.ctaText) return null;

  return (
    <div className="mt-2 space-y-1.5">
      {typeof category.ctaFound === "boolean" && (
        <div className="flex items-center gap-1.5">
          {category.ctaFound ? (
            <CheckCircle2 size={12} className="text-[var(--accent-default)]" />
          ) : (
            <AlertTriangle size={12} className="text-[var(--warning-default)]" />
          )}
          <span className="text-[11px] text-[var(--fg-subtle)]">
            {category.ctaFound ? "CTA được phát hiện" : "Không tìm thấy CTA"}
          </span>
        </div>
      )}
      {category.ctaText && (
        <div className="px-2 py-1 bg-[var(--bg-surface-2)] rounded-[var(--radius-sm)]">
          <span className="text-[11px] text-[var(--fg-subtle)]">CTA: </span>
          <span className="text-[11px] font-medium text-[var(--fg-default)]">
            &ldquo;{category.ctaText}&rdquo;
          </span>
        </div>
      )}
      {category.ctaPlacement && (
        <p className="text-[11px] text-[var(--fg-subtle)]">
          📍 {category.ctaPlacement}
        </p>
      )}
    </div>
  );
}

// ── Strengths + Issues row ────────────────────────────────────────────────────

function StrengthsAndIssuesRow({
  strengths,
  issues,
}: {
  strengths?: string[];
  issues?: string[];
}) {
  if (!strengths?.length && !issues?.length) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Strengths */}
      <Card variant="default" padding="md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} strokeWidth={2} className="text-[var(--accent-default)] shrink-0" />
            <CardTitle>Điểm mạnh</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {strengths?.length ? (
            <ul className="space-y-2.5">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-[var(--fg-muted)] leading-relaxed">
                  <span className="w-1.5 h-1.5 mt-[7px] rounded-full bg-[var(--accent-default)] shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-[var(--fg-subtle)] italic">
              Không có điểm mạnh được ghi nhận.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Weaknesses */}
      <Card variant="default" padding="md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} strokeWidth={2} className="text-[var(--warning-default)] shrink-0" />
            <CardTitle>Vấn đề cần cải thiện</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {issues?.length ? (
            <ul className="space-y-2.5">
              {issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px] text-[var(--fg-muted)] leading-relaxed">
                  <span className="w-1.5 h-1.5 mt-[7px] rounded-full bg-[var(--warning-default)] shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-[var(--fg-subtle)] italic">
              Không có vấn đề được phát hiện.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Suggestions card ──────────────────────────────────────────────────────────

function SuggestionsCard({ suggestions }: { suggestions?: string[] }) {
  if (!suggestions?.length) return null;

  return (
    <Card variant="default" padding="md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb size={15} strokeWidth={2} className="text-[var(--brand-default)] shrink-0" />
          <CardTitle>Đề xuất cải thiện</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-[13px] text-[var(--fg-muted)] leading-relaxed">
              <span className="shrink-0 w-5 h-5 flex items-center justify-center text-[10.5px] font-bold bg-[var(--brand-subtle)] text-[var(--brand-default)] rounded-full mt-[1px]">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

// ── Redesign prompt card ──────────────────────────────────────────────────────

function RedesignPromptCard({ prompt }: { prompt: AiRedesignPrompt }) {
  const hasAny = prompt.chatgptPrompt || prompt.geminiPrompt;
  if (!hasAny) return null;

  return (
    <Card variant="default" padding="md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles size={15} strokeWidth={2} className="text-[var(--brand-default)] shrink-0" />
          <CardTitle>Prompt thiết kế lại bằng AI</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prompt.chatgptPrompt && (
            <PromptBlock label="ChatGPT" text={prompt.chatgptPrompt} />
          )}
          {prompt.geminiPrompt && (
            <PromptBlock label="Gemini" text={prompt.geminiPrompt} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PromptBlock({ label, text }: { label: string; text: string }) {
  const [copied,   setCopied]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable in some contexts
    }
  };

  return (
    <div className="border border-[var(--border-default)] rounded-[var(--radius-md)] overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[var(--bg-surface-2)]">
        <span className="text-[12.5px] font-semibold text-[var(--fg-default)]">
          Prompt cho {label}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            title="Sao chép prompt"
            className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-subtle)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--fg-default)] transition-colors"
          >
            {copied ? (
              <Check size={13} strokeWidth={2.5} className="text-[var(--accent-default)]" />
            ) : (
              <Copy size={13} strokeWidth={1.8} />
            )}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            title={expanded ? "Thu gọn" : "Xem prompt"}
            className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--fg-subtle)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--fg-default)] transition-colors"
          >
            {expanded ? (
              <ChevronUp size={13} strokeWidth={2} />
            ) : (
              <ChevronDown size={13} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Expandable body */}
      {expanded && (
        <div className="px-3.5 py-3 bg-[var(--bg-surface-1)]">
          <pre className="text-[11.5px] text-[var(--fg-muted)] whitespace-pre-wrap leading-relaxed font-mono">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

export function AnalysisResultCardsSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Đang tải kết quả phân tích">
      {/* Overall score skeleton */}
      <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5">
        <div className="flex items-start gap-5">
          <div className="w-[84px] h-[84px] rounded-full bg-[var(--bg-surface-3)] animate-pulse-skeleton shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-2 w-full" />
            <SkeletonText lines={2} />
          </div>
        </div>
      </div>

      {/* Categories grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonCard key={i} className="min-h-[110px]" />
        ))}
      </div>

      {/* Strengths + Issues skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>

      {/* Suggestions skeleton */}
      <SkeletonCard />
    </div>
  );
}
