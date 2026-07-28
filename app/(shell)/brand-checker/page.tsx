"use client";

import { useCallback, useEffect, useState } from "react";
import { BrandCheckerWorkspace } from "@/components/modules/brand-checker/workspace";
import { BrandCheckerPanel } from "@/components/modules/brand-checker/panel";
import { useRightPanel } from "@/contexts/right-panel-context";
import type { AnalysisResult, AnalysisStatus, BrandGuideline } from "@/lib/types";

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

export default function BrandCheckerPage() {
  const { setContent } = useRightPanel();

  const [brandGuideline, setBrandGuideline] = useState<BrandGuideline | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [designName, setDesignName] = useState("");
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

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
    setError("");
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setStatus("loading");
    setError("");
    setResult(null);

    try {
      const base64 = await fileToBase64(selectedFile);
      const body: Record<string, unknown> = {
        image: { base64, mimeType: selectedFile.type },
      };
      if (designName.trim()) body.designName = designName.trim();

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
      setStatus("done");
    } catch (err) {
      setError(`Yêu cầu thất bại: ${(err as Error).message}`);
      setStatus("error");
    }
  }, [selectedFile, designName]);

  // Register right panel content
  useEffect(() => {
    setContent(
      <BrandCheckerPanel
        brandGuideline={brandGuideline}
        logoUrl={logoUrl}
        designName={designName}
        selectedFile={selectedFile}
        status={status}
        onDesignNameChange={setDesignName}
        onAnalyze={handleAnalyze}
      />
    );
  }, [
    brandGuideline,
    logoUrl,
    designName,
    selectedFile,
    status,
    handleAnalyze,
    setContent,
  ]);

  // Clear panel on unmount
  useEffect(() => {
    return () => setContent(null);
  }, [setContent]);

  return (
    <BrandCheckerWorkspace
      selectedFile={selectedFile}
      previewUrl={previewUrl}
      status={status}
      result={result}
      error={error}
      isLoading={status === "loading"}
      onFileSelect={handleFileSelect}
      onRetry={handleAnalyze}
    />
  );
}
