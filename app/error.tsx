"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="vi">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
          <div className="text-center px-4 max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-[20px] font-semibold text-[var(--fg-default)] mb-2">
              Đã xảy ra lỗi
            </h1>
            <p className="text-[14px] text-[var(--fg-muted)] mb-6">
              Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại.
            </p>
            <button
              onClick={reset}
              className="px-5 py-2.5 bg-[var(--brand-default)] text-white text-[14px] font-semibold rounded-[var(--radius-lg)] hover:opacity-90 transition-opacity"
            >
              Thử lại
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
