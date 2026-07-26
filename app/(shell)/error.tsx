"use client";

import { useEffect } from "react";

export default function ShellError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ShellError]", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[400px]">
      <div className="text-center px-4 max-w-sm">
        <div className="w-12 h-12 rounded-[var(--radius-xl)] bg-[var(--color-danger-subtle)] flex items-center justify-center mx-auto mb-4">
          <span className="text-xl">⚠️</span>
        </div>
        <h2 className="text-[16px] font-semibold text-[var(--fg-default)] mb-2">
          Module gặp sự cố
        </h2>
        <p className="text-[13px] text-[var(--fg-muted)] mb-5">
          Không thể tải nội dung. Vui lòng thử lại hoặc chọn module khác.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[var(--brand-default)] text-white text-[13px] font-semibold rounded-[var(--radius-lg)] hover:opacity-90 transition-opacity"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
