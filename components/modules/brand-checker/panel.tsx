"use client";

import { Target } from "lucide-react";
import type { BrandGuideline, AnalysisStatus } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { PrimaryActionButton, type CTAState } from "@/components/ui/primary-action-button";
import { StatusBadge } from "@/components/ui/status-indicator";
import { PanelSection } from "@/components/ui/card";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";

interface BrandCheckerPanelProps {
  brandGuideline: BrandGuideline | null;
  logoUrl: string | null;
  designName: string;
  selectedFile: File | null;
  status: AnalysisStatus;
  onDesignNameChange: (name: string) => void;
  onAnalyze: () => void;
}

function ColorSwatch({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-4.5 h-4.5 rounded-[var(--radius-sm)] shrink-0"
        style={{ background: hex, border: "1px solid var(--border-default)", width: 18, height: 18 }}
      />
      <span className="text-[12px] text-[var(--fg-muted)]">{label}</span>
      <span className="text-[11px] font-mono text-[var(--fg-subtle)] ml-auto">{hex}</span>
    </div>
  );
}

export function BrandCheckerPanel({
  brandGuideline,
  logoUrl,
  designName,
  selectedFile,
  status,
  onDesignNameChange,
  onAnalyze,
}: BrandCheckerPanelProps) {
  const ctaState: CTAState =
    status === "loading" ? "loading" :
    status === "done"    ? "success" :
    status === "error"   ? "error"   : "idle";

  const colors = brandGuideline?.colors;
  const swatches: { hex: string; label: string }[] = [];
  if (colors?.primary?.hex) swatches.push({ label: "Primary", hex: colors.primary.hex });
  if (colors?.secondary?.hex) swatches.push({ label: "Secondary", hex: colors.secondary.hex });
  (colors?.accent?.allowedColors || []).slice(0, 3).forEach((hex, i) =>
    swatches.push({ label: `Accent ${i + 1}`, hex })
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border-default)]">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--brand-subtle)] flex items-center justify-center">
          <Target size={15} strokeWidth={2} className="text-[var(--brand-default)]" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[var(--fg-default)]">Brand Checker</div>
          <div className="text-[11px] text-[var(--fg-subtle)]">Kiểm tra tuân thủ thương hiệu</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Brand identity */}
        <PanelSection title="Nhận diện thương hiệu">
          {brandGuideline ? (
            <div className="space-y-3">
              {logoUrl && (
                <div className="flex items-center justify-center py-3 px-4 bg-[var(--bg-surface-2)] rounded-[var(--radius-lg)]">
                  <img
                    src={logoUrl}
                    alt="Brand logo"
                    className="max-h-10 max-w-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}

              <div>
                <p className="text-[13px] font-semibold text-[var(--fg-default)]">
                  {brandGuideline.brandName || "Zalopay"}
                </p>
                {brandGuideline.tone && (
                  <p className="text-[12px] text-[var(--fg-muted)] mt-0.5">
                    {brandGuideline.tone.join(" · ")}
                  </p>
                )}
              </div>

              {swatches.length > 0 && (
                <div className="space-y-1.5">
                  {swatches.map((s) => (
                    <ColorSwatch key={s.label} {...s} />
                  ))}
                </div>
              )}

              {brandGuideline.typography && (
                <div className="text-[12px] text-[var(--fg-subtle)] space-y-0.5">
                  <div className="flex justify-between">
                    <span>Font tiêu đề</span>
                    <span className="font-medium text-[var(--fg-muted)]">
                      {brandGuideline.typography.headingFont || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Font nội dung</span>
                    <span className="font-medium text-[var(--fg-muted)]">
                      {brandGuideline.typography.bodyFont || "—"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-[var(--radius-lg)]" />
              <SkeletonText lines={2} />
            </div>
          )}
        </PanelSection>

        {/* Analysis settings */}
        <PanelSection title="Cài đặt phân tích">
          <div className="space-y-3">
            <Input
              label="Tên thiết kế"
              value={designName}
              onChange={(e) => onDesignNameChange(e.target.value)}
              placeholder="VD: Banner khuyến mãi Tết"
            />

            <div>
              <p className="text-[12.5px] font-medium text-[var(--fg-default)] mb-1.5">Mô hình AI</p>
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-[var(--radius-md)]">
                <StatusBadge status="online" label="Gemini 2.0 Flash" />
              </div>
            </div>
          </div>
        </PanelSection>
      </div>

      {/* Analyze CTA */}
      <div className="px-5 py-4 border-t border-[var(--border-default)] shrink-0">
        {!selectedFile && (
          <p className="text-[12px] text-[var(--fg-subtle)] text-center mb-3">
            Tải lên một thiết kế trước để bắt đầu phân tích
          </p>
        )}
        <PrimaryActionButton
          label="Phân tích ngay"
          loadingText="Đang phân tích..."
          ctaState={ctaState}
          disabled={!selectedFile}
          onClick={onAnalyze}
        />
      </div>
    </div>
  );
}
