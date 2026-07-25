import { Target, Sparkles, Clock, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

const STAT_CARDS = [
  { label: "Phân tích hôm nay", value: "0", icon: Target, color: "var(--primary)" },
  { label: "Tổng phân tích", value: "0", icon: TrendingUp, color: "var(--accent)" },
  { label: "Điểm TB (30 ngày)", value: "—", icon: Sparkles, color: "#f59e0b" },
  { label: "Gần đây nhất", value: "—", icon: Clock, color: "var(--foreground-3)" },
];

const QUICK_ACTIONS = [
  {
    title: "Brand Checker",
    description: "Kiểm tra thiết kế theo tiêu chuẩn ZaloPay",
    href: "/brand-checker",
    icon: Target,
    label: "Mở ngay",
    available: true,
  },
  {
    title: "Banner Generator",
    description: "Tạo banner quảng cáo tự động bằng AI",
    href: "/banner-generator",
    icon: Sparkles,
    label: "Sắp ra mắt",
    available: false,
  },
];

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[var(--foreground)] mb-1">
          Chào mừng trở lại 👋
        </h1>
        <p className="text-[14px] text-[var(--foreground-3)]">
          ZaloPay AI Creative Platform — Không gian sáng tạo thông minh của bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}
              >
                <Icon size={16} strokeWidth={1.8} style={{ color }} />
              </div>
            </div>
            <div className="text-[24px] font-bold text-[var(--foreground)] leading-none mb-1">
              {value}
            </div>
            <div className="text-[12px] text-[var(--foreground-3)]">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--foreground-3)] mb-4">
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_ACTIONS.map(({ title, description, href, icon: Icon, label, available }) => (
            <div
              key={title}
              className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 transition-all ${
                available ? "hover:border-[var(--primary)] hover:shadow-sm cursor-pointer" : "opacity-60"
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] flex items-center justify-center shrink-0">
                  <Icon size={18} strokeWidth={1.8} className="text-[var(--primary)]" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[var(--foreground)]">{title}</div>
                  <div className="text-[13px] text-[var(--foreground-3)] mt-0.5">{description}</div>
                </div>
              </div>
              {available ? (
                <Link
                  href={href}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--primary)] hover:gap-2.5 transition-all"
                >
                  {label}
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <span className="inline-flex items-center text-[13px] text-[var(--foreground-3)]">
                  {label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div>
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[var(--foreground-3)] mb-4">
          Hoạt động gần đây
        </h2>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 text-center">
          <Clock size={24} strokeWidth={1.5} className="mx-auto mb-3 text-[var(--foreground-3)]" />
          <p className="text-[14px] text-[var(--foreground-3)]">
            Chưa có hoạt động nào. Hãy thử{" "}
            <Link href="/brand-checker" className="text-[var(--primary)] hover:underline">
              Brand Checker
            </Link>{" "}
            ngay!
          </p>
        </div>
      </div>
    </div>
  );
}
