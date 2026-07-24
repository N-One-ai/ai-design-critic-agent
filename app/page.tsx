"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { StatsGrid } from "@/components/stats-grid";
import { BrandPanel } from "@/components/brand-panel";
import { UploadArea } from "@/components/upload-area";
import { ReportPanel } from "@/components/report-panel";
import type {
  AnalysisResult,
  AnalysisStatus,
  BrandGuideline,
} from "@/lib/types";

const RadarChartComponent = dynamic(
  () =>
    import("@/components/radar-chart").then((m) => m.RadarChartComponent),
  { ssr: false }
);

interface Annotation {
  label: string;
  severity: "critical" | "warning" | "ok";
  x: number;
  y: number;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.substring(result.indexOf(",") + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function HomePage() {
  const [brandGuideline, setBrandGuideline] = useState<BrandGuideline | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [designName, setDesignName] = useState("");
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [reportMarkdown, setReportMarkdown] = useState("");
  const [error, setError] = useState("");
  const [analysisTime, setAnalysisTime] = useState<Date | null>(null);
  const [annotations] = useState<Annotation[]>([]);

  useEffect(() => {
    fetch("/api/brand-guideline")
      .then((r) => r.json())
      .then((data) => {
        setBrandGuideline(data.brandGuideline || null);
        if (data.logoUrl) setLogoUrl(data.logoUrl);
      })
      .catch(() => {});
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setResult(null);
    setReportMarkdown("");
    setError("");
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setStatus("loading");
    setError("");
    setResult(null);
    setReportMarkdown("");

    try {
      const base64 = await fileToBase64(selectedFile);
      const body: Record<string, unknown> = {
        image: { base64, mimeType: selectedFile.type },
      };
      const name = designName.trim();
      if (name) body.designName = name;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const rawText = await res.text();
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(rawText);
      } catch {
        const hint =
          res.status === 413
            ? "Ảnh quá lớn, vui lòng chọn ảnh nhỏ hơn."
            : rawText.slice(0, 200);
        setError(`Lỗi ${res.status}: ${hint}`);
        setStatus("error");
        return;
      }

      if (!res.ok) {
        setError(`Lỗi: ${(data.error as string) || res.statusText}`);
        setStatus("error");
        return;
      }

      setResult(data as unknown as AnalysisResult);
      setReportMarkdown((data.report as string) || "");
      setAnalysisTime(new Date());
      setStatus("done");
    } catch (err) {
      setError(`Yêu cầu thất bại: ${(err as Error).message}`);
      setStatus("error");
    }
  }, [selectedFile, designName]);

  return (
    <>
      <Header />

      <div className="page-content">
        {/* Stats */}
        <StatsGrid
          designName={result?.designName || designName || ""}
          overallScore={result?.overallScore ?? null}
          status={status}
          analysisTime={analysisTime}
        />

        {/* Radar chart */}
        <div className="card radar-card">
          <h2 className="card-title">Biểu đồ radar — điểm theo hạng mục</h2>
          <RadarChartComponent categories={result?.categories || null} />
        </div>

        {/* Main two-column layout */}
        <div className="main-grid">
          <div>
            <BrandPanel brandGuideline={brandGuideline} logoUrl={logoUrl} />
            <UploadArea
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              designName={designName}
              isLoading={status === "loading"}
              annotations={annotations}
              onFileSelect={handleFileSelect}
              onDesignNameChange={setDesignName}
              onAnalyze={handleAnalyze}
            />
          </div>

          <ReportPanel
            result={result}
            reportMarkdown={reportMarkdown}
            isLoading={status === "loading"}
            error={error}
          />
        </div>
      </div>

      <style jsx>{`
        .page-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px 32px 56px;
        }
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .radar-card {
          display: flex;
          flex-direction: column;
        }
        .card-title {
          font-size: 15px;
          margin: 0 0 12px;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .main-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 24px;
        }
        @media (max-width: 900px) {
          .stats-grid-outer {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .main-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .stats-grid-outer {
            grid-template-columns: 1fr !important;
          }
          .page-content {
            padding: 16px 16px 40px;
          }
        }
      `}</style>
    </>
  );
}
