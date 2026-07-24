"use client";

import { useCallback, useRef } from "react";

interface Annotation {
  label: string;
  severity: "critical" | "warning" | "ok";
  x: number;
  y: number;
}

interface UploadAreaProps {
  selectedFile: File | null;
  previewUrl: string | null;
  designName: string;
  isLoading: boolean;
  annotations: Annotation[];
  onFileSelect: (file: File) => void;
  onDesignNameChange: (name: string) => void;
  onAnalyze: () => void;
}

const SEVERITY_ICONS: Record<string, string> = {
  critical: "🔴",
  warning: "🟡",
  ok: "🟢",
};

export function UploadArea({
  selectedFile,
  previewUrl,
  designName,
  isLoading,
  annotations,
  onFileSelect,
  onDesignNameChange,
  onAnalyze,
}: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dropzoneRef.current?.classList.add("dragover");
  }, []);

  const handleDragLeave = useCallback(() => {
    dropzoneRef.current?.classList.remove("dragover");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dropzoneRef.current?.classList.remove("dragover");
      if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) handleFile(e.target.files[0]);
    },
    [handleFile]
  );

  return (
    <div className="card">
      <h2>Ảnh thiết kế</h2>

      <div
        ref={dropzoneRef}
        className="dropzone"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
      >
        <div>Nhấn hoặc kéo &amp; thả ảnh vào đây</div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleInputChange}
        />
      </div>

      {previewUrl && (
        <div className="preview">
          <div className="preview-wrap">
            <img src={previewUrl} alt="Preview" className="preview-img" />
            {annotations.map((ann, idx) => (
              <div
                key={idx}
                className={`annotation-marker severity-${ann.severity || "warning"}`}
                style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
              >
                <span className="dot" />
                <span className="annotation-tooltip">
                  {SEVERITY_ICONS[ann.severity] || ""} {ann.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <label className="field-label" htmlFor="designName">
        Tên thiết kế (không bắt buộc)
      </label>
      <input
        type="text"
        id="designName"
        className="text-input"
        placeholder="VD: Banner khuyến mãi Zalopay"
        value={designName}
        onChange={(e) => onDesignNameChange(e.target.value)}
      />

      <button
        className="analyze-btn"
        disabled={!selectedFile || isLoading}
        onClick={onAnalyze}
      >
        {isLoading ? (
          <>
            <span className="spinner" />
            Đang phân tích...
          </>
        ) : (
          "Phân tích"
        )}
      </button>

      <style jsx>{`
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
        }
        h2 {
          font-size: 15px;
          margin: 0 0 12px;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .dropzone {
          border: 2px dashed var(--border);
          border-radius: 10px;
          padding: 28px;
          text-align: center;
          cursor: pointer;
          color: var(--muted);
          transition: border-color 0.15s, background 0.15s;
        }
        .dropzone:hover,
        :global(.dropzone.dragover) {
          border-color: var(--primary);
          background: var(--status-loading-bg);
        }
        .preview {
          margin-top: 14px;
          text-align: center;
        }
        .preview-wrap {
          position: relative;
          display: inline-block;
          max-width: 100%;
        }
        .preview-img {
          display: block;
          max-width: 100%;
          max-height: 260px;
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .annotation-marker {
          position: absolute;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          cursor: pointer;
        }
        .annotation-marker .dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.25);
        }
        .annotation-marker.severity-critical .dot { background: #ef4444; }
        .annotation-marker.severity-warning .dot { background: #f5b900; }
        .annotation-marker.severity-ok .dot { background: #00CF6A; }
        .annotation-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: #1a1d29;
          color: #fff;
          font-size: 12px;
          line-height: 1.4;
          padding: 6px 10px;
          border-radius: 6px;
          white-space: nowrap;
          max-width: 220px;
          overflow: hidden;
          text-overflow: ellipsis;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 0.15s;
          z-index: 20;
        }
        .annotation-marker:hover .annotation-tooltip {
          opacity: 1;
          visibility: visible;
        }
        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin: 14px 0 6px;
          color: var(--foreground);
        }
        .text-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          background: var(--surface);
          color: var(--foreground);
          outline: none;
          transition: border-color 0.15s;
        }
        .text-input:focus {
          border-color: var(--primary);
        }
        .analyze-btn {
          margin-top: 16px;
          width: 100%;
          padding: 12px 16px;
          background: var(--primary);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .analyze-btn:hover:not(:disabled) {
          background: var(--primary-hover);
        }
        .analyze-btn:disabled {
          background: #b9c2e0;
          cursor: not-allowed;
        }
        .spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
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
