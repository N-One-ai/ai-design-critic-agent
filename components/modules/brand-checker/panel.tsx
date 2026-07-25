"use client";

import { Target, Loader2 } from "lucide-react";
import type { BrandGuideline, AnalysisStatus } from "@/lib/types";

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
        className="w-5 h-5 rounded-md shrink-0"
        style={{ background: hex, border: "1px solid var(--border)" }}
      />
      <span className="text-[12px] text-[var(--foreground-3)]">{label}</span>
      <span className="text-[11px] font-mono text-[var(--foreground-3)] ml-auto">{hex}</span>
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
  const isLoading = status === "loading";

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
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border)]">
        <div className="w-7 h-7 rounded-lg bg-[var(--primary-subtle)] flex items-center justify-center">
          <Target size={15} strokeWidth={2} className="text-[var(--primary)]" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[var(--foreground)]">Brand Checker</div>
          <div className="text-[11px] text-[var(--foreground-3)]">Kiểm tra tuân thủ thương hiệu</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Brand guideline summary */}
        <section>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--foreground-3)] mb-3">
            Nhận diện thương hiệu
          </h4>

          {brandGuideline ? (
            <div className="space-y-3">
              {/* Logo */}
              {logoUrl && (
                <div className="flex items-center justify-center py-3 px-4 bg-[var(--surface-secondary)] rounded-xl">
                  <img
                    src={logoUrl}
                    alt="Brand logo"
                    className="max-h-10 max-w-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}

              {/* Brand name + tone */}
              <div>
                <p className="text-[13px] font-semibold text-[var(--foreground)]">
                  {brandGuideline.brandName || "ZaloPay"}
                </p>
                {brandGuideline.tone && (
                  <p className="text-[12px] text-[var(--foreground-3)] mt-0.5">
                    {brandGuideline.tone.join(" · ")}
                  </p>
                )}
              </div>

              {/* Color swatches */}
              {swatches.length > 0 && (
                <div className="space-y-1.5">
                  {swatches.map((s) => (
                    <ColorSwatch key={s.label} {...s} />
                  ))}
                </div>
              )}

              {/* Typography */}
              {brandGuideline.typography && (
                <div className="text-[12px] text-[var(--foreground-3)] space-y-0.5">
                  <div className="flex justify-between">
                    <span>Font tiêu đề</span>
                    <span className="font-medium text-[var(--foreground-2)]">
                      {brandGuideline.typography.headingFont || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Font nội dung</span>
                    <span className="font-medium text-[var(--foreground-2)]">
                      {brandGuideline.typography.bodyFont || "—"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-[13px] text-[var(--foreground-3)] animate-pulse">
              Đang tải quy chuẩn...
            </div>
          )}
        </section>

        {/* Analysis settings */}
        <section>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--foreground-3)] mb-3">
            Cài đặt phân tích
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-[12.5px] font-medium text-[var(--foreground)] mb-1.5">
                Tên thiết kế
              </label>
              <input
                type="text"
                value={designName}
                onChange={(e) => onDesignNameChange(e.target.value)}
                placeholder="VD: Banner khuyến mãi Tết"
                className="w-full px-3 py-2 text-[13px] bg-[var(--surface)] border border-[var(--border)] rounded-lg outline-none text-[var(--foreground)] placeholder:text-[var(--foreground-3)] focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-medium text-[var(--foreground)] mb-1.5">
                Mô hình AI
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg">
                <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                <span className="text-[13px] text-[var(--foreground-2)]">Gemini 2.0 Flash</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Analyze button — always at bottom */}
      <div className="px-5 py-4 border-t border-[var(--border)] shrink-0">
        {!selectedFile && (
          <p className="text-[12px] text-[var(--foreground-3)] text-center mb-3">
            Tải lên một thiết kế trước để bắt đầu phân tích
          </p>
        )}
        <button
          onClick={onAnalyze}
          disabled={!selectedFile || isLoading}
          className="
            w-full flex items-center justify-center gap-2.5
            px-4 py-3 rounded-xl text-[14px] font-semibold text-white
            bg-[var(--primary)] hover:bg-[var(--primary-hover)]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-150 shadow-sm
          "
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Đang phân tích...
            </>
          ) : (
            <>
              <Target size={16} strokeWidth={2} />
              Phân tích ngay
            </>
          )}
        </button>
      </div>
    </div>
  );
}
