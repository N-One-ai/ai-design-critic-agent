import { Settings, User, Bell, Shield, Palette, Key } from "lucide-react";

const SETTINGS_SECTIONS = [
  {
    icon: User,
    title: "Tài khoản",
    description: "Thông tin cá nhân và tùy chọn hiển thị",
  },
  {
    icon: Bell,
    title: "Thông báo",
    description: "Quản lý email và push notification",
  },
  {
    icon: Palette,
    title: "Giao diện",
    description: "Chủ đề sáng/tối và cài đặt hiển thị",
  },
  {
    icon: Key,
    title: "API Keys",
    description: "Quản lý kết nối với dịch vụ AI",
  },
  {
    icon: Shield,
    title: "Bảo mật",
    description: "Mật khẩu và xác thực hai yếu tố",
  },
];

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--foreground)] mb-1">Cài đặt</h1>
        <p className="text-[14px] text-[var(--foreground-3)]">
          Tuỳ chỉnh tài khoản và ứng dụng theo ý muốn
        </p>
      </div>

      <div className="space-y-2">
        {SETTINGS_SECTIONS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex items-center gap-4 px-5 py-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--primary)] transition-colors cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[var(--surface-secondary)] flex items-center justify-center shrink-0 group-hover:bg-[var(--primary-subtle)] transition-colors">
              <Icon size={17} strokeWidth={1.8} className="text-[var(--foreground-3)] group-hover:text-[var(--primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold text-[var(--foreground)]">{title}</div>
              <div className="text-[13px] text-[var(--foreground-3)]">{description}</div>
            </div>
            <Settings size={14} strokeWidth={1.8} className="text-[var(--foreground-3)] shrink-0" />
          </div>
        ))}
      </div>

      {/* Version info */}
      <div className="mt-8 pt-6 border-t border-[var(--border)]">
        <div className="flex items-center justify-between text-[12px] text-[var(--foreground-3)]">
          <span>ZaloPay AI Creative Platform</span>
          <span>v1.0.0 · Sprint 3</span>
        </div>
      </div>
    </div>
  );
}
