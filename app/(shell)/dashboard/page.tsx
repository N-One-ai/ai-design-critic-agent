"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  Target, Sparkles, Image, Video, Palette, PenTool, Archive, FolderOpen,
  TrendingUp, Clock, Star, ArrowRight, Plus, CheckCircle2, Zap,
  Bell, Users, BarChart2, GitBranch, Rocket, Lock, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, PanelSection } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, StatusDot } from "@/components/ui/status-indicator";
import { ProgressBar } from "@/components/ui/progress";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SectionDivider } from "@/components/ui/section";
import { useRightPanel } from "@/contexts/right-panel-context";

/* ─── Mock data ─── */
const STATS = [
  { label: "Phân tích hôm nay",  value: "12",   delta: "+4",   color: "var(--brand-default)",   icon: Target },
  { label: "Tổng phân tích",     value: "248",  delta: "+18%", color: "var(--accent-default)",  icon: TrendingUp },
  { label: "Điểm TB (30 ngày)",  value: "7.8",  delta: "+0.5", color: "var(--warning-default)", icon: BarChart2 },
  { label: "Credits còn lại",    value: "9,160",delta: "91%",  color: "var(--success-default)", icon: Zap },
];

const RECENT_ACTIVITY = [
  { id: "1", icon: Target,  title: "Brand Analysis hoàn thành",       sub: "Banner Tết 2025.png — Score 8.5/10",  time: "2 phút",  badge: "success" },
  { id: "2", icon: Image,   title: "Banner đã tạo thành công",         sub: "4 biến thể Facebook 1200×628",        time: "14 phút", badge: "accent"  },
  { id: "3", icon: Target,  title: "Brand Analysis hoàn thành",       sub: "Holiday_Banner_v2.jpg — Score 6.2/10",time: "1 giờ",   badge: "warning" },
  { id: "4", icon: Sparkles,title: "Image generated",                  sub: "ZaloPay Hero Banner — 4 variants",    time: "2 giờ",   badge: "accent"  },
  { id: "5", icon: Target,  title: "Brand Analysis hoàn thành",       sub: "Q4_Campaign.psd — Score 9.1/10",      time: "3 giờ",   badge: "success" },
  { id: "6", icon: PenTool, title: "Prompt tối ưu hóa",               sub: "Marketing copy cho Tết 2025",          time: "5 giờ",   badge: "info"    },
];

const QUICK_MODULES = [
  { id: "brand-checker",   Icon: Target,   label: "Brand Checker",   desc: "Kiểm tra brand",       color: "var(--brand-default)",   bg: "var(--brand-subtle)",   available: true  },
  { id: "banner-generator",Icon: Image,    label: "Banner Generator",desc: "Tạo banner",            color: "var(--brand-default)",   bg: "var(--brand-subtle)",   available: true  },
  { id: "image-generator", Icon: Sparkles, label: "Image Generator", desc: "Sinh ảnh AI",           color: "var(--accent-default)",  bg: "var(--accent-subtle)",  available: true  },
  { id: "creative-studio", Icon: Palette,  label: "Creative Studio", desc: "Thiết kế AI",           color: "var(--warning-default)", bg: "var(--warning-subtle)", available: true  },
  { id: "prompt-studio",   Icon: PenTool,  label: "Prompt Studio",   desc: "Tối ưu prompt",        color: "var(--info-default)",    bg: "var(--info-subtle)",    available: true  },
  { id: "video-generator", Icon: Video,    label: "Video Generator", desc: "Video marketing",       color: "var(--fg-subtle)",       bg: "var(--bg-surface-3)",   available: false },
];

const AI_MODELS = [
  { name: "Gemini 2.0 Flash", provider: "Google",     status: "online" as const, usage: 68, calls: "1,240" },
  { name: "Claude Sonnet 4.6",provider: "Anthropic",  status: "online" as const, usage: 24, calls: "420"   },
  { name: "Imagen 3",          provider: "Google",     status: "online" as const, usage: 8,  calls: "86"    },
];

const RECENT_PROJECTS = [
  { id: "1", name: "Tết Nguyên Đán 2025",   count: 24, color: "#0033c9", members: ["Ngọc NA", "Minh TT", "Lan PH"] },
  { id: "2", name: "Campaign Q1/2025",       count: 12, color: "#00cf6a", members: ["Ngọc NA", "Tuan LM"]           },
  { id: "3", name: "ZaloPay Rebrand",         count: 8,  color: "#f59e0b", members: ["Ngọc NA", "An DT", "Duc NQ"]  },
];

const ROADMAP = [
  { q: "Q1 2025", items: ["Video Generator",     "Team collaboration",    "Asset versioning"],        done: false },
  { q: "Q2 2025", items: ["AI prompt optimizer", "Multi-language support","Canva integration"],       done: false },
  { q: "Q3 2025", items: ["API marketplace",     "White-label export",    "Advanced analytics"],      done: false },
];

/* ─── Dashboard right panel ─── */
function DashboardPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-[var(--border-default)]">
        <p className="text-[13px] font-semibold text-[var(--fg-default)]">Tổng quan tài khoản</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 space-y-5">
          <PanelSection title="Credits sử dụng">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--fg-muted)]">Đã dùng</span>
                <span className="font-semibold text-[var(--fg-default)]">840 / 10,000</span>
              </div>
              <ProgressBar value={8.4} variant="brand" showValue={false} />
              <p className="text-[11.5px] text-[var(--fg-subtle)]">Reset vào ngày 01/02/2025</p>
            </div>
          </PanelSection>

          <PanelSection title="Trạng thái hệ thống">
            <div className="space-y-2">
              {[
                { label: "API Gateway",    ok: true },
                { label: "AI Models",      ok: true },
                { label: "Asset Storage",  ok: true },
                { label: "Analytics",      ok: false },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[13px] text-[var(--fg-muted)]">{label}</span>
                  <StatusDot status={ok ? "online" : "warning"} />
                </div>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Hoạt động nhóm">
            <div className="space-y-2">
              {[
                { name: "Ngọc NA",  action: "Tạo banner",         time: "2m" },
                { name: "Minh TT",  action: "Brand analysis",     time: "14m" },
                { name: "Lan PH",   action: "Upload asset",        time: "1h" },
              ].map(({ name, action, time }) => (
                <div key={name} className="flex items-center gap-2.5">
                  <Avatar size="xs" name={name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium text-[var(--fg-default)] truncate">{name}</p>
                    <p className="text-[11px] text-[var(--fg-subtle)] truncate">{action}</p>
                  </div>
                  <span className="text-[11px] text-[var(--fg-subtle)] shrink-0">{time}</span>
                </div>
              ))}
            </div>
          </PanelSection>

          <PanelSection title="Thông báo quan trọng">
            <div className="space-y-2">
              {[
                { text: "Brand guideline ZaloPay v2.4 đã được cập nhật", icon: Bell },
                { text: "42 template Tết 2025 đã sẵn sàng",              icon: Star },
              ].map(({ text, icon: Icon }) => (
                <div key={text} className="flex items-start gap-2 p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)]">
                  <Icon size={13} className="text-[var(--brand-default)] mt-0.5 shrink-0" />
                  <p className="text-[12px] text-[var(--fg-muted)] leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </PanelSection>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─── */
export default function DashboardPage() {
  const { setContent } = useRightPanel();
  useEffect(() => {
    setContent(<DashboardPanel />);
    return () => setContent(null);
  }, [setContent]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <div className="p-6 max-w-5xl space-y-8">

      {/* ── Welcome ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-[var(--fg-default)] tracking-tight">
            {greeting}, Ngọc 👋
          </h1>
          <p className="text-[14px] text-[var(--fg-muted)] mt-1">
            Hôm nay bạn đã thực hiện <strong className="text-[var(--fg-default)]">12 phân tích</strong>.
            Nền tảng hoạt động tốt.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" icon={<FolderOpen size={14} />}>Dự án</Button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />}>Tạo mới</Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, delta, color, icon: Icon }) => (
          <Card key={label} variant="default" padding="md" interactive>
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center"
                style={{ background: `color-mix(in srgb, ${color} 14%, transparent)` }}
              >
                <Icon size={17} strokeWidth={1.8} style={{ color }} />
              </div>
              <Badge variant="success" size="sm">{delta}</Badge>
            </div>
            <div className="text-[26px] font-bold text-[var(--fg-default)] leading-none mb-1 tabular-nums">{value}</div>
            <div className="text-[12px] text-[var(--fg-muted)]">{label}</div>
          </Card>
        ))}
      </div>

      {/* ── Quick modules ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="type-label text-[var(--fg-subtle)]">Modules</p>
          <Link href="/brand-checker" className="text-[12.5px] text-[var(--brand-default)] hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_MODULES.map(({ id, Icon, label, desc, color, bg, available }) => (
            available
              ? (
                <Link key={id} href={`/${id}`}>
                  <Card variant="default" padding="sm" interactive className="text-center h-full">
                    <div
                      className="w-10 h-10 rounded-[var(--radius-xl)] mx-auto mb-2.5 flex items-center justify-center"
                      style={{ background: bg }}
                    >
                      <Icon size={18} strokeWidth={1.8} style={{ color }} />
                    </div>
                    <p className="text-[12.5px] font-semibold text-[var(--fg-default)] leading-tight">{label}</p>
                    <p className="text-[11px] text-[var(--fg-subtle)] mt-0.5">{desc}</p>
                  </Card>
                </Link>
              )
              : (
                <Card key={id} variant="flat" padding="sm" className="text-center opacity-50">
                  <div className="w-10 h-10 rounded-[var(--radius-xl)] mx-auto mb-2.5 bg-[var(--bg-surface-3)] flex items-center justify-center">
                    <Icon size={18} strokeWidth={1.8} className="text-[var(--fg-subtle)]" />
                  </div>
                  <p className="text-[12.5px] font-semibold text-[var(--fg-default)] leading-tight">{label}</p>
                  <Badge variant="default" size="sm" className="mt-1 mx-auto">Soon</Badge>
                </Card>
              )
          ))}
        </div>
      </div>

      <SectionDivider />

      {/* ── Recent activity + Recent projects ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity feed */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <p className="type-label text-[var(--fg-subtle)]">Hoạt động gần đây</p>
            <Link href="/history" className="text-[12.5px] text-[var(--brand-default)] hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={12} />
            </Link>
          </div>
          <Card variant="default" padding="none">
            {RECENT_ACTIVITY.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 px-4 py-3.5 ${i < RECENT_ACTIVITY.length - 1 ? "border-b border-[var(--border-subtle)]" : ""} hover:bg-[var(--bg-surface-2)] transition-colors cursor-pointer`}
                >
                  <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--bg-surface-3)] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={13} strokeWidth={1.8} className="text-[var(--fg-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--fg-default)] truncate">{item.title}</p>
                    <p className="text-[12px] text-[var(--fg-subtle)] truncate">{item.sub}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-[var(--fg-subtle)]">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

        {/* Recent projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="type-label text-[var(--fg-subtle)]">Dự án gần đây</p>
            <Link href="/projects" className="text-[12.5px] text-[var(--brand-default)] hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {RECENT_PROJECTS.map((p) => (
              <Card key={p.id} variant="default" padding="sm" interactive>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0 text-white text-[11px] font-bold"
                    style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}99)` }}
                  >
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--fg-default)] truncate">{p.name}</p>
                    <p className="text-[11px] text-[var(--fg-subtle)]">{p.count} files</p>
                  </div>
                  <AvatarGroup avatars={p.members.map((m) => ({ name: m }))} size="xs" max={3} />
                </div>
              </Card>
            ))}
            <Link href="/projects">
              <Card variant="flat" padding="sm" interactive>
                <div className="flex items-center gap-2 text-[var(--fg-muted)] hover:text-[var(--brand-default)] transition-colors">
                  <Plus size={14} />
                  <span className="text-[13px]">Tạo dự án mới</span>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── AI Models + Roadmap ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* AI Models status */}
        <div className="lg:col-span-2">
          <p className="type-label text-[var(--fg-subtle)] mb-4">Mô hình AI</p>
          <div className="space-y-3">
            {AI_MODELS.map((m) => (
              <Card key={m.name} variant="default" padding="sm">
                <div className="flex items-center gap-3 mb-2">
                  <StatusDot status={m.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--fg-default)] truncate">{m.name}</p>
                    <p className="text-[11px] text-[var(--fg-subtle)]">{m.provider} · {m.calls} calls</p>
                  </div>
                </div>
                <ProgressBar value={m.usage} variant="brand" size="xs" />
              </Card>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div className="lg:col-span-3">
          <p className="type-label text-[var(--fg-subtle)] mb-4">Roadmap</p>
          <Card variant="default" padding="none">
            {ROADMAP.map((r, ri) => (
              <div
                key={r.q}
                className={`px-5 py-4 ${ri < ROADMAP.length - 1 ? "border-b border-[var(--border-subtle)]" : ""}`}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <Badge variant="primary" size="sm">{r.q}</Badge>
                  <GitBranch size={12} className="text-[var(--fg-subtle)]" />
                </div>
                <div className="space-y-1.5">
                  {r.items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-[var(--fg-subtle)] shrink-0" />
                      <span className="text-[13px] text-[var(--fg-muted)]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="px-5 py-3 border-t border-[var(--border-default)] flex items-center justify-between">
              <span className="text-[12px] text-[var(--fg-subtle)]">Vote cho tính năng bạn muốn</span>
              <button className="text-[12.5px] font-medium text-[var(--brand-default)] hover:underline flex items-center gap-1">
                <Rocket size={12} />
                Đề xuất
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Team & Favorites ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="type-label text-[var(--fg-subtle)]">Nhóm</p>
            <Link href="/team" className="text-[12.5px] text-[var(--brand-default)] hover:underline flex items-center gap-1">
              Quản lý <ChevronRight size={12} />
            </Link>
          </div>
          <Card variant="default" padding="md">
            <div className="flex items-center justify-between mb-4">
              <AvatarGroup
                avatars={[
                  { name: "Ngọc NA" }, { name: "Minh TT" }, { name: "Lan PH" },
                  { name: "Tuan LM" }, { name: "Duc NQ" },
                ]}
                size="sm"
                max={4}
              />
              <Button variant="ghost" size="xs" icon={<Plus size={12} />}>Thêm</Button>
            </div>
            <div className="space-y-2">
              {[
                { name: "Ngọc NA",  role: "Admin",     online: true  },
                { name: "Minh TT",  role: "Designer",  online: true  },
                { name: "Lan PH",   role: "Designer",  online: false },
              ].map(({ name, role, online }) => (
                <div key={name} className="flex items-center gap-2.5">
                  <Avatar name={name} size="xs" />
                  <div className="flex-1">
                    <p className="text-[12.5px] font-medium text-[var(--fg-default)]">{name}</p>
                    <p className="text-[11px] text-[var(--fg-subtle)]">{role}</p>
                  </div>
                  <StatusBadge status={online ? "online" : "offline"} label={online ? "Online" : "Offline"} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Favorites */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="type-label text-[var(--fg-subtle)]">Yêu thích</p>
            <Link href="/favorites" className="text-[12.5px] text-[var(--brand-default)] hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {[
              { icon: Target,   label: "ZaloPay Tết Analysis",    score: "9.1", type: "Brand Check" },
              { icon: Image,    label: "Holiday Campaign Banner",  score: "—",   type: "Banner" },
              { icon: Sparkles, label: "ZP Hero Image v3",         score: "—",   type: "Image" },
            ].map(({ icon: Icon, label, score, type }) => (
              <Card key={label} variant="default" padding="sm" interactive>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--brand-subtle)] flex items-center justify-center shrink-0">
                    <Icon size={14} strokeWidth={1.8} className="text-[var(--brand-default)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--fg-default)] truncate">{label}</p>
                    <p className="text-[11px] text-[var(--fg-subtle)]">{type}</p>
                  </div>
                  {score !== "—" && (
                    <Badge variant="success" size="sm">{score}/10</Badge>
                  )}
                  <Star size={14} className="text-[var(--warning-default)] fill-current shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* ── Platform news ── */}
      <div>
        <p className="type-label text-[var(--fg-subtle)] mb-4">Platform Updates</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "Sprint 4 Design System",     desc: "20+ component mới, token system hoàn chỉnh.",   badge: "new",     icon: CheckCircle2 },
            { title: "Brand Checker 2.0",           desc: "Phân tích nhanh hơn 3×, báo cáo chi tiết hơn.", badge: "updated", icon: Rocket     },
            { title: "Template Library",            desc: "42 template Tết Nguyên Đán 2025 mới thêm.",     badge: "new",     icon: Bell        },
          ].map(({ title, desc, badge, icon: Icon }) => (
            <Card key={title} variant="default" padding="md" interactive>
              <div className="flex items-start gap-3">
                <Icon size={16} strokeWidth={1.8} className="text-[var(--brand-default)] mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[13px] font-semibold text-[var(--fg-default)]">{title}</p>
                    <Badge variant={badge === "new" ? "accent" : "primary"} size="sm">{badge}</Badge>
                  </div>
                  <p className="text-[12px] text-[var(--fg-muted)] leading-relaxed">{desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
