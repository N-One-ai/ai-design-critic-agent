"use client";

import { RefreshCw, ImageIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { ReportPanel } from "@/components/report-panel";
import { UploadArea } from "@/components/ui/upload-area";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScoreBar, ProgressCircle } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
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
  const handleReplaceFile = () => {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    inp.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files?.[0];
      if (f) onFileSelect(f);
    };
    inp.click();
  };

  return (
    <div className="p-6 max-w-none space-y-5">
      {/* Upload zone — no file yet */}
      {!selectedFile && (
        <UploadArea
          onFiles={(files) => {
            const f = files[0];
            if (f && f.type.startsWith("image/")) onFileSelect(f);
          }}
        />
      )}

      {/* File preview */}
      {selectedFile && previewUrl && (
        <Card variant="default" padding="none">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-2.5">
              <ImageIcon size={15} strokeWidth={1.8} className="text-[var(--fg-subtle)]" />
              <span className="text-[13.5px] font-medium text-[var(--fg-default)] truncate max-w-xs">
                {selectedFile.name}
              </span>
              <span className="text-[12px] text-[var(--fg-subtle)]">
                ({(selectedFile.size / 1024).toFixed(0)} KB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="xs"
              icon={<RefreshCw size={12} />}
              onClick={handleReplaceFile}
            >
              Thay ảnh
            </Button>
          </div>
          <div className="flex items-center justify-center bg-[var(--bg-surface-2)] py-4 px-6">
            <img
              src={previewUrl}
              alt="Design preview"
              className="max-h-72 max-w-full rounded-[var(--radius-lg)] object-contain border border-[var(--border-default)]"
            />
          </div>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <Card variant="default" padding="md">
          <div className="flex flex-col items-center gap-4 py-6">
            <Spinner size="lg" />
            <div className="text-center">
              <p className="text-[14px] font-semibold text-[var(--fg-default)] mb-1">Đang phân tích...</p>
              <p className="text-[13px] text-[var(--fg-muted)]">AI đang kiểm tra thiết kế theo tiêu chuẩn ZaloPay</p>
            </div>
          </div>
        </Card>
      )}

      {/* Error */}
      {error && !isLoading && (
        <Alert variant="danger" title="Lỗi phân tích">{error}</Alert>
      )}

      {/* Results */}
      {result && !isLoading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card variant="default" padding="md">
              <CardHeader>
                <CardTitle>Điểm tổng thể</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-5">
                  <ProgressCircle value={(result.overallScore ?? 0) * 10} size={80} variant="success" />
                  <div className="flex-1">
                    <div className="text-[40px] font-bold leading-none text-[var(--accent-default)] tabular-nums">
                      {result.overallScore}
                      <span className="text-[18px] text-[var(--fg-subtle)] font-normal">/10</span>
                    </div>
                    <div className="mt-3">
                      <ScoreBar score={result.overallScore ?? 0} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="default" padding="md">
              <CardHeader>
                <CardTitle>Radar — Điểm theo hạng mục</CardTitle>
              </CardHeader>
              <CardContent>
                <RadarChartComponent categories={result.categories} />
              </CardContent>
            </Card>
          </div>

          <Card variant="default" padding="none">
            <div className="px-5 py-3.5 border-b border-[var(--border-default)]">
              <p className="text-[13px] font-semibold text-[var(--fg-default)]">
                Báo cáo phân tích chi tiết
              </p>
            </div>
            <div className="p-5">
              <ReportPanel
                result={result}
                reportMarkdown={reportMarkdown}
                isLoading={false}
                error=""
              />
            </div>
          </Card>
        </>
      )}

      {/* Ready state — file selected, not analyzed */}
      {selectedFile && !result && !isLoading && !error && (
        <div className="text-center py-10">
          <p className="text-[14px] text-[var(--fg-muted)]">
            Nhấn <strong className="text-[var(--fg-default)]">Phân tích ngay</strong> ở bảng bên phải để bắt đầu.
          </p>
        </div>
      )}
    </div>
  );
}
