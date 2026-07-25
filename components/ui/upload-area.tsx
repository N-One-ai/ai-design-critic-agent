"use client";

import { useCallback, useRef, type ReactNode } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────
   UploadArea — drag-drop / click to upload
───────────────────────────────────────── */
export interface UploadAreaProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFiles?: (files: File[]) => void;
  className?: string;
  children?: ReactNode;
}

export function UploadArea({
  accept = "image/*",
  multiple = false,
  disabled = false,
  onFiles,
  className,
  children,
}: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  const handle = useCallback(
    (files: FileList | null) => {
      if (!files || !onFiles) return;
      const arr = Array.from(files).filter((f) => {
        if (!accept) return true;
        const types = accept.split(",").map((s) => s.trim());
        return types.some((t) =>
          t.endsWith("/*") ? f.type.startsWith(t.replace("/*", "/")) : f.type === t
        );
      });
      if (arr.length) onFiles(multiple ? arr : arr.slice(0, 1));
    },
    [accept, multiple, onFiles]
  );

  const addDrag = () => zoneRef.current?.setAttribute("data-drag", "true");
  const rmDrag  = () => zoneRef.current?.removeAttribute("data-drag");

  return (
    <div
      ref={zoneRef}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) addDrag(); }}
      onDragLeave={rmDrag}
      onDrop={(e) => { e.preventDefault(); rmDrag(); if (!disabled) handle(e.dataTransfer.files); }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
      aria-label="Tải lên tệp"
      className={cn(
        "group relative flex flex-col items-center justify-center gap-4",
        "border-2 border-dashed rounded-[var(--radius-xl)] cursor-pointer",
        "transition-all duration-fast ease-ease",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-default)]",
        disabled
          ? "border-[var(--border-default)] opacity-50 pointer-events-none"
          : [
              "border-[var(--border-default)]",
              "hover:border-[var(--brand-default)] hover:bg-[var(--brand-subtle)]",
              "data-[drag]:border-[var(--brand-default)] data-[drag]:bg-[var(--brand-subtle)]",
            ],
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={disabled}
        onChange={(e) => handle(e.target.files)}
      />
      {children ?? (
        <DefaultUploadContent />
      )}
    </div>
  );
}

function DefaultUploadContent() {
  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center">
      <div className="w-12 h-12 rounded-[var(--radius-xl)] bg-[var(--bg-surface-2)] group-hover:bg-[var(--brand-subtle)] flex items-center justify-center transition-colors duration-fast">
        <Upload
          size={22}
          strokeWidth={1.5}
          className="text-[var(--fg-subtle)] group-hover:text-[var(--brand-default)] transition-colors"
        />
      </div>
      <div>
        <p className="text-[14px] font-semibold text-[var(--fg-default)]">
          Kéo thả hoặc nhấn để tải lên
        </p>
        <p className="text-[12.5px] text-[var(--fg-muted)] mt-1">
          PNG, JPG, WEBP · Tối đa 10MB
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   FileCard — uploaded file preview
───────────────────────────────────────── */
export interface FileCardProps {
  file: File;
  previewUrl?: string;
  onRemove?: () => void;
  className?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function FileCard({ file, previewUrl, onRemove, className }: FileCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        "bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)]",
        className
      )}
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={file.name}
          className="w-10 h-10 rounded-[var(--radius-md)] object-cover border border-[var(--border-default)] shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)] flex items-center justify-center shrink-0">
          <ImageIcon size={18} strokeWidth={1.5} className="text-[var(--fg-subtle)]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[var(--fg-default)] truncate">{file.name}</p>
        <p className="text-[11.5px] text-[var(--fg-subtle)]">{formatBytes(file.size)}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--fg-subtle)] hover:bg-[var(--bg-surface-3)] hover:text-[var(--fg-default)] transition-colors"
          aria-label="Xóa tệp"
        >
          <X size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
