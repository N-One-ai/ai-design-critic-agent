import { Star } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--foreground)] mb-1">Favorites</h1>
        <p className="text-[14px] text-[var(--foreground-3)]">
          Thiết kế và nội dung đã đánh dấu yêu thích
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--surface-secondary)] flex items-center justify-center mb-4">
          <Star size={24} strokeWidth={1.5} className="text-[var(--foreground-3)]" />
        </div>
        <h3 className="text-[16px] font-semibold text-[var(--foreground)] mb-2">
          Chưa có nội dung yêu thích
        </h3>
        <p className="text-[14px] text-[var(--foreground-3)] max-w-xs mb-6">
          Nhấn ⭐ trên bất kỳ kết quả phân tích nào để lưu vào đây.
        </p>
        <Link
          href="/brand-checker"
          className="text-[13px] font-medium text-[var(--primary)] hover:underline"
        >
          Bắt đầu với Brand Checker →
        </Link>
      </div>
    </div>
  );
}
