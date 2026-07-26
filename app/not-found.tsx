import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="text-center px-4">
        <p className="text-[64px] font-bold text-[var(--border-default)] leading-none select-none">
          404
        </p>
        <h1 className="text-[20px] font-semibold text-[var(--fg-default)] mt-4 mb-2">
          Trang không tìm thấy
        </h1>
        <p className="text-[14px] text-[var(--fg-muted)] mb-8">
          Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand-default)] text-white text-[14px] font-semibold rounded-[var(--radius-lg)] hover:opacity-90 transition-opacity"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
