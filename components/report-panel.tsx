"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Download, FileText, Image, Clipboard, Link, Check } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

interface ReportPanelProps {
  result: AnalysisResult | null;
  reportMarkdown: string;
  isLoading: boolean;
  error: string;
}

function slugify(name: string): string {
  return (name || "bao-cao")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "bao-cao";
}

function addCopyButtons(container: HTMLElement) {
  container.querySelectorAll("pre").forEach((pre) => {
    if (pre.closest(".prompt-card-body")) return;
    if (pre.querySelector(".copy-btn")) return;
    const code = pre.querySelector("code") || pre;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(code.textContent || "").then(() => {
        btn.textContent = "Đã copy!";
        setTimeout(() => {
          btn.textContent = "Copy";
        }, 1500);
      });
    });
    pre.appendChild(btn);
  });
}

function initLucideIcons(container: HTMLElement) {
  if (typeof window !== "undefined" && (window as unknown as { lucide?: { createIcons: (opts: object) => void } }).lucide) {
    (window as unknown as { lucide: { createIcons: (opts: object) => void } }).lucide.createIcons({ nodes: Array.from(container.querySelectorAll("i[data-lucide]")) });
  }
}

function wirePromptCards(container: HTMLElement) {
  container.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const toggleBtn = target.closest("[data-action='toggle-prompt']");
    if (toggleBtn) {
      const card = toggleBtn.closest(".prompt-card") as HTMLElement;
      const body = card.querySelector(".prompt-card-body") as HTMLElement;
      const expanded = card.getAttribute("data-expanded") === "true";
      card.setAttribute("data-expanded", expanded ? "false" : "true");
      body.classList.toggle("hidden", expanded);
      const label = toggleBtn.querySelector(".toggle-label");
      if (label) label.textContent = expanded ? "Xem prompt" : "Ẩn prompt";
      return;
    }

    const copyBtn = target.closest("[data-action='copy-prompt']");
    if (copyBtn) {
      const card = copyBtn.closest(".prompt-card") as HTMLElement;
      const pre = card.querySelector(".prompt-card-body pre");
      if (pre) {
        navigator.clipboard.writeText(pre.textContent || "").then(() => {
          (copyBtn as HTMLElement).classList.add("copied");
          setTimeout(() => (copyBtn as HTMLElement).classList.remove("copied"), 1500);
        });
      }
    }
  });
}

export function ReportPanel({ result, reportMarkdown, isLoading, error }: ReportPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [flashItem, setFlashItem] = useState<string | null>(null);
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!reportMarkdown) return;
    import("marked").then(({ marked }) => {
      setHtml(String(marked.parse(reportMarkdown)));
    });
  }, [reportMarkdown]);

  useEffect(() => {
    if (!html || !reportRef.current) return;
    addCopyButtons(reportRef.current);
    initLucideIcons(reportRef.current);
    wirePromptCards(reportRef.current);
  }, [html]);

  const handleExport = useCallback(
    async (type: string) => {
      if (type === "markdown") {
        await navigator.clipboard.writeText(reportMarkdown);
        setFlashItem("markdown");
        setTimeout(() => setFlashItem(null), 1500);
        return;
      }
      if (type === "share") {
        await navigator.clipboard.writeText(window.location.href);
        setFlashItem("share");
        setTimeout(() => setFlashItem(null), 1500);
        return;
      }

      const name = slugify(result?.designName || "thiet-ke");

      if (type === "png" || type === "jpeg") {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(reportRef.current!, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
        });
        const mime = type === "jpeg" ? "image/jpeg" : "image/png";
        const dataUrl = canvas.toDataURL(mime, 0.95);
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${name}.${type === "jpeg" ? "jpg" : "png"}`;
        link.click();
        setExportOpen(false);
        return;
      }

      if (type === "pdf") {
        const { default: html2canvas } = await import("html2canvas");
        const { jsPDF } = await import("jspdf");
        const canvas = await html2canvas(reportRef.current!, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
        });
        const pdf = new jsPDF("p", "pt", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const pxPerPage = (canvas.width * pageHeight) / pageWidth;
        let rendered = 0;
        let pageIdx = 0;

        while (rendered < canvas.height) {
          const sliceH = Math.min(pxPerPage, canvas.height - rendered);
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceH;
          const ctx = pageCanvas.getContext("2d")!;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, rendered, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
          const pageDataUrl = pageCanvas.toDataURL("image/png");
          const pageImgH = (sliceH * pageWidth) / canvas.width;
          if (pageIdx > 0) pdf.addPage();
          pdf.addImage(pageDataUrl, "PNG", 0, 0, pageWidth, pageImgH);
          rendered += sliceH;
          pageIdx += 1;
        }

        pdf.save(`${name}.pdf`);
        setExportOpen(false);
      }
    },
    [reportMarkdown, result]
  );

  const hasReport = !!reportMarkdown && !isLoading;

  return (
    <div className="report-card" ref={containerRef}>
      <div className="report-header">
        <h2>Báo cáo</h2>
        <div className="export-menu" style={{ position: "relative" }}>
          <button
            className="export-btn"
            disabled={!hasReport}
            onClick={() => setExportOpen((v) => !v)}
            type="button"
          >
            <Download size={16} strokeWidth={2} />
            Xuất báo cáo
          </button>

          {exportOpen && (
            <div className="export-dropdown">
              {[
                { id: "pdf", icon: FileText, label: "Xuất PDF" },
                { id: "png", icon: Image, label: "Xuất PNG" },
                { id: "jpeg", icon: Image, label: "Xuất JPEG" },
                {
                  id: "markdown",
                  icon: flashItem === "markdown" ? Check : Clipboard,
                  label: flashItem === "markdown" ? "Đã sao chép!" : "Sao chép Markdown",
                },
                {
                  id: "share",
                  icon: flashItem === "share" ? Check : Link,
                  label: flashItem === "share" ? "Đã sao chép liên kết!" : "Chia sẻ liên kết",
                },
              ].map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleExport(id)}
                >
                  <Icon size={16} strokeWidth={2} style={{ color: "var(--accent)" }} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div ref={reportRef}>
        {isLoading && (
          <div className="placeholder">
            <span className="spinner" />
            Đang phân tích thiết kế...
          </div>
        )}
        {!isLoading && error && (
          <div className="error-box">{error}</div>
        )}
        {!isLoading && !error && html && (
          <div
            className="markdown-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
        {!isLoading && !error && !html && (
          <div className="placeholder">
            Tải lên ảnh thiết kế và nhấn &ldquo;Phân tích&rdquo; để tạo báo cáo.
          </div>
        )}
      </div>

      <style jsx>{`
        .report-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 24px;
          min-height: 200px;
        }
        .report-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }
        h2 {
          font-size: 15px;
          margin: 0;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .export-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border: 1px solid var(--primary);
          border-radius: 8px;
          background: var(--surface);
          color: var(--primary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .export-btn:hover:not(:disabled) {
          background: var(--primary);
          color: #fff;
        }
        .export-btn:disabled {
          border-color: var(--border);
          color: var(--muted);
          cursor: not-allowed;
        }
        .export-dropdown {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          min-width: 200px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(16, 24, 40, 0.12);
          padding: 6px;
          z-index: 30;
        }
        .export-dropdown button {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 9px 10px;
          border: none;
          background: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: var(--foreground);
          text-align: left;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .export-dropdown button:hover {
          background: var(--surface-secondary);
          color: var(--primary);
        }
        .placeholder {
          color: var(--muted);
          font-size: 14px;
          text-align: center;
          padding: 60px 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .error-box {
          background: var(--status-error-bg);
          border: 1px solid rgba(185, 28, 28, 0.2);
          color: var(--status-error-text);
          border-radius: 8px;
          padding: 12px 14px;
          font-size: 14px;
        }
        .spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
