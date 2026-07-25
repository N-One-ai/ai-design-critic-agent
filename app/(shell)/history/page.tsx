import { Clock, Search } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--foreground)] mb-1">Lịch sử</h1>
        <p className="text-[14px] text-[var(--foreground-3)]">
          Toàn bộ các phân tích và nội dung đã tạo
        </p>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl mb-6">
        <Search size={16} strokeWidth={1.8} className="text-[var(--foreground-3)] shrink-0" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên thiết kế..."
          className="flex-1 text-[14px] bg-transparent outline-none text-[var(--foreground)] placeholder:text-[var(--foreground-3)]"
        />
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--surface-secondary)] flex items-center justify-center mb-4">
          <Clock size={24} strokeWidth={1.5} className="text-[var(--foreground-3)]" />
        </div>
        <h3 className="text-[16px] font-semibold text-[var(--foreground)] mb-2">Chưa có lịch sử</h3>
        <p className="text-[14px] text-[var(--foreground-3)] max-w-xs">
          Khi bạn phân tích thiết kế bằng Brand Checker, kết quả sẽ được lưu lại tại đây.
        </p>
      </div>
    </div>
  );
}
