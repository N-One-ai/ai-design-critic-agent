"use client";

import { useEffect } from "react";
import { Settings, User, Bell, Palette, Key, Shield, ChevronRight, ToggleRight, Globe } from "lucide-react";
import { useRightPanel } from "@/contexts/right-panel-context";
import { Badge } from "@/components/ui/badge";
import { WorkspaceHeader } from "@/components/ui/section";

const SETTINGS_GROUPS = [
  {
    label: "Tài khoản",
    items: [
      { icon: User,    title: "Hồ sơ cá nhân",      desc: "Tên, email, ảnh đại diện",              badge: null     },
      { icon: Shield,  title: "Bảo mật",              desc: "Mật khẩu và xác thực hai yếu tố",       badge: null     },
      { icon: Globe,   title: "Ngôn ngữ & vùng",      desc: "Tiếng Việt · UTC+7",                    badge: null     },
    ],
  },
  {
    label: "Nền tảng",
    items: [
      { icon: Palette, title: "Giao diện",            desc: "Chủ đề, màu sắc, font chữ",             badge: null     },
      { icon: Bell,    title: "Thông báo",             desc: "Email, push notification, digest",       badge: "3 chưa đọc" },
      { icon: ToggleRight, title: "Tính năng thử nghiệm", desc: "Beta features và early access",       badge: "Beta"   },
    ],
  },
  {
    label: "Tích hợp",
    items: [
      { icon: Key,     title: "API Keys",             desc: "Quản lý kết nối dịch vụ AI",            badge: "2 active" },
      { icon: Globe,   title: "Webhooks",             desc: "Tự động hoá với external services",      badge: null     },
    ],
  },
];

function SettingRow({ icon: Icon, title, desc, badge }: { icon: React.ElementType; title: string; desc: string; badge: string | null }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 group cursor-pointer hover:bg-[var(--bg-surface-2)] transition-colors rounded-[var(--radius-lg)]">
      <div className="w-8 h-8 rounded-[var(--radius-lg)] bg-[var(--bg-surface-2)] group-hover:bg-[var(--brand-subtle)] flex items-center justify-center shrink-0 transition-colors">
        <Icon size={15} strokeWidth={1.8} className="text-[var(--fg-muted)] group-hover:text-[var(--brand-default)] transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-[var(--fg-default)]">{title}</p>
        <p className="text-[12px] text-[var(--fg-muted)]">{desc}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {badge && (
          <Badge variant={badge === "Beta" ? "accent" : badge.includes("active") ? "success" : "warning"} size="sm">
            {badge}
          </Badge>
        )}
        <ChevronRight size={14} className="text-[var(--fg-subtle)] group-hover:text-[var(--fg-muted)] transition-colors" />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { setContent } = useRightPanel();

  useEffect(() => {
    setContent(null);
    return () => setContent(null);
  }, [setContent]);

  return (
    <div>
      <WorkspaceHeader
        title="Cài đặt"
        description="Tuỳ chỉnh tài khoản và nền tảng ZaloPay AI"
        icon={<Settings size={18} className="text-[var(--brand-default)]" />}
      />

      <div className="p-4 sm:p-6 max-w-2xl space-y-6">
        {SETTINGS_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="type-label text-[var(--fg-subtle)] mb-2 px-1">{group.label}</p>
            <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden divide-y divide-[var(--border-default)]">
              {group.items.map((item) => (
                <SettingRow key={item.title} {...item} />
              ))}
            </div>
          </div>
        ))}

        <div className="pt-2 border-t border-[var(--border-default)]">
          <div className="flex items-center justify-between text-[12px] text-[var(--fg-subtle)]">
            <span>ZaloPay AI Creative Platform</span>
            <span>v1.0.0 · Sprint 5</span>
          </div>
        </div>
      </div>
    </div>
  );
}
