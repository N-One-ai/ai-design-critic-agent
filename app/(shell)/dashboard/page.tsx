import { Target, Sparkles, Clock, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionDivider } from "@/components/ui/section";

const STAT_CARDS = [
  { label: "Phân tích hôm nay", value: "0",  icon: Target,     color: "var(--brand-default)" },
  { label: "Tổng phân tích",    value: "0",  icon: TrendingUp, color: "var(--accent-default)" },
  { label: "Điểm TB (30 ngày)", value: "—",  icon: Sparkles,   color: "var(--warning-default)" },
  { label: "Gần đây nhất",      value: "—",  icon: Clock,      color: "var(--fg-subtle)" },
];

const QUICK_ACTIONS = [
  {
    title: "Brand Checker",
    description: "Kiểm tra thiết kế theo tiêu chuẩn ZaloPay",
    href: "/brand-checker",
    icon: Target,
    available: true,
  },
  {
    title: "Banner Generator",
    description: "Tạo banner quảng cáo tự động bằng AI",
    href: "/banner-generator",
    icon: Sparkles,
    available: false,
  },
];

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-[var(--fg-default)] mb-1">
          Chào mừng trở lại
        </h1>
        <p className="text-[14px] text-[var(--fg-muted)]">
          ZaloPay AI Creative Platform — Không gian sáng tạo thông minh của bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} variant="default" padding="sm">
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-8 h-8 rounded-[var(--radius-lg)] flex items-center justify-center"
                style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}
              >
                <Icon size={16} strokeWidth={1.8} style={{ color }} />
              </div>
            </div>
            <div className="text-[24px] font-bold text-[var(--fg-default)] leading-none mb-1 tabular-nums">
              {value}
            </div>
            <div className="text-[12px] text-[var(--fg-muted)]">{label}</div>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <p className="type-label text-[var(--fg-subtle)] mb-4">Thao tác nhanh</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_ACTIONS.map(({ title, description, href, icon: Icon, available }) => (
            <Card
              key={title}
              variant="default"
              padding="md"
              interactive={available}
              className={!available ? "opacity-60" : ""}
            >
              <CardContent>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[var(--radius-xl)] bg-[var(--brand-subtle)] flex items-center justify-center shrink-0">
                    <Icon size={18} strokeWidth={1.8} className="text-[var(--brand-default)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[14px] font-semibold text-[var(--fg-default)]">{title}</span>
                      {!available && <Badge variant="default" size="sm">Soon</Badge>}
                    </div>
                    <p className="text-[13px] text-[var(--fg-muted)]">{description}</p>
                  </div>
                </div>
                {available && (
                  <Link
                    href={href}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--brand-default)] hover:gap-2.5 transition-all duration-fast"
                  >
                    Mở ngay
                    <ArrowRight size={14} />
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* Recent activity */}
      <div>
        <p className="type-label text-[var(--fg-subtle)] mb-4">Hoạt động gần đây</p>
        <Card variant="default" padding="none">
          <EmptyState
            icon={Clock}
            title="Chưa có hoạt động nào"
            description={
              <>
                Hãy thử{" "}
                <Link href="/brand-checker" className="text-[var(--brand-default)] hover:underline">
                  Brand Checker
                </Link>{" "}
                ngay!
              </>
            }
            size="sm"
          />
        </Card>
      </div>
    </div>
  );
}
