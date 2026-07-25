"use client";

import { useCallback, useRef } from "react";
import { Upload, ImageIcon, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import { ReportPanel } from "@/components/report-panel";
import type { AnalysisResult, AnalysisStatus } from "@/lib/types";

const RadarChartComponent = dynamic(
  () => import("@/components/radar-chart").then((m) => m.RadarChartComponent),
  { ssr: false }
);

interface WorkspaceProps {
  selectedFile: File | null;
  previewUrl: string | null;
  status: AnalysisStatus;
  result: AnalysisResult | null;
  reportMarkdown: string;
  error: string;
  isLoading: boolean;
  onFileSelect: (file: File) => void;
}

function UploadZone({
  onFileSelect,
}: {
  onFileSelect: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn một tệp hình ảnh.");
        return;
      }
      onFileSelect(file);
    },
    [onFileSelect]
  );

  return (
    <div
      ref={zoneRef}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        zoneRef.current?.setAttribute("data-drag", "true");
      }}
      onDragLeave={() => zoneRef.current?.removeAttribute("data-drag")}
      onDrop={(e) => {
        e.preventDefault();
        zoneRef.current?.removeAttribute("data-drag");
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
      }}
      className="
        group flex flex-col items-center justify-center gap-4
        border-2 border-dashed border-[var(--border)] rounded-2xl
        p-16 cursor-pointer
        transition-all duration-200
        hover:border-[var(--primary)] hover:bg-[var(--primary-subtle)]
        data-[drag]:border-[var(--primary)] data-[drag]:bg-[var(--primary-subtle)]
      "
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--surface-secondary)] group-hover:bg-[var(--primary-subtle)] flex items-center justify-center transition-colors">
        <Upload size={24} strokeWidth={1.5} className="text-[var(--foreground-3)] group-hover:text-[var(--primary)]" />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-semibold text-[var(--foreground)] mb-1">
          Tải lên thiết kế của bạn
        </p>
        <p className="text-[13px] text-[var(--foreground-3)]">
          Nhấn hoặc kéo & thả · PNG, JPG, WEBP
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.length && handleFile(e.target.files[0])}
      />
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 7 ? "var(--accent)" : score >= 5 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-[13px] font-bold tabular-nums" style={{ color }}>
        {score}/10
      </span>
    </div>
  );
}

export function BrandCheckerWorkspace({
  selectedFile,
  previewUrl,
  status,
  result,
  reportMarkdown,
  error,
  isLoading,
  onFileSelect,
}: WorkspaceProps) {
  return (
    <div className="p-6 max-w-none">
      {/* Upload zone — visible when no file or when idle */}
      {!selectedFile && (
        <div className="mb-6">
          <UploadZone onFileSelect={onFileSelect} />
        </div>
      )}

      {/* Preview + replace when file selected */}
      {selectedFile && previewUrl && (
        <div className="mb-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2.5">
              <ImageIcon size={16} strokeWidth={1.8} className="text-[var(--foreground-3)]" />
              <span className="text-[13.5px] font-medium text-[var(--foreground)]">
                {selectedFile.name}
              </span>
              <span className="text-[12px] text-[var(--foreground-3)]">
                ({(selectedFile.size / 1024).toFixed(0)} KB)
              </span>
            </div>
            <button
              onClick={() => {
                const inp = document.createElement("input");
                inp.type = "file";
                inp.accept = "image/*";
                inp.onchange = (e) => {
                  const f = (e.target as HTMLInputElement).files?.[0];
                  if (f) onFileSelect(f);
                };
                inp.click();
              }}
              className="flex items-center gap-1.5 text-[12px] text-[var(--foreground-3)] hover:text-[var(--primary)] transition-colors"
            >
              <RefreshCw size={13} />
              Thay ảnh
            </button>
          </div>
          <div className="flex items-center justify-center bg-[var(--surface-secondary)] py-4 px-6">
            <img
              src={previewUrl}
              alt="Design preview"
              className="max-h-72 max-w-full rounded-xl object-contain"
              style={{ border: "1px solid var(--border)" }}
            />
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="mb-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[var(--border)] border-t-[var(--primary)] animate-spin" />
          <div className="text-center">
            <p className="text-[14px] font-semibold text-[var(--foreground)] mb-1">Đang phân tích...</p>
            <p className="text-[13px] text-[var(--foreground-3)]">AI đang kiểm tra thiết kế theo tiêu chuẩn ZaloPay</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="mb-6 bg-[var(--destructive-subtle)] border border-[var(--destructive)] rounded-2xl px-5 py-4">
          <p className="text-[13.5px] font-medium text-[var(--destructive)]">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <>
          {/* Score + radar */}
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--foreground-3)] mb-4">
                Điểm tổng thể
              </h3>
              <div className="text-[52px] font-bold leading-none mb-3" style={{ color: "var(--accent)" }}>
                {result.overallScore}
                <span className="text-[20px] text-[var(--foreground-3)] font-normal">/10</span>
              </div>
              <ScoreBar score={result.overallScore ?? 0} />
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--foreground-3)] mb-2">
                Radar — Điểm theo hạng mục
              </h3>
              <RadarChartComponent categories={result.categories} />
            </div>
          </div>

          {/* Report */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[var(--border)]">
              <h3 className="text-[13px] font-semibold text-[var(--foreground)]">
                Báo cáo phân tích chi tiết
              </h3>
            </div>
            <div className="p-5">
              <ReportPanel
                result={result}
                reportMarkdown={reportMarkdown}
                isLoading={false}
                error=""
              />
            </div>
          </div>
        </>
      )}

      {/* Empty state when file selected but not yet analyzed */}
      {selectedFile && !result && !isLoading && !error && (
        <div className="text-center py-12">
          <p className="text-[14px] text-[var(--foreground-3)]">
            Nhấn <strong className="text-[var(--foreground)]">Phân tích ngay</strong> ở bảng bên phải để bắt đầu.
          </p>
        </div>
      )}
    </div>
  );
}
