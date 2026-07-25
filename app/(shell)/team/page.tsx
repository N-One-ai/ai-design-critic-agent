"use client";

import { useEffect } from "react";
import { Users, UserPlus, MoreHorizontal, Mail, Shield, Clock } from "lucide-react";
import { useRightPanel } from "@/contexts/right-panel-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { WorkspaceHeader } from "@/components/ui/section";

const MEMBERS = [
  { id: "1", name: "Ngọc Nguyễn",   email: "ngocna2@vng.com.vn",   role: "Admin",    status: "online",  joined: "6 tháng trước", color: "#0033c9" },
  { id: "2", name: "Minh Tran",      email: "minht@vng.com.vn",     role: "Editor",   status: "online",  joined: "4 tháng trước", color: "#00cf6a" },
  { id: "3", name: "Linh Pham",      email: "linhp@vng.com.vn",     role: "Editor",   status: "offline", joined: "3 tháng trước", color: "#e53e3e" },
  { id: "4", name: "Huy Nguyen",     email: "huyn@vng.com.vn",      role: "Viewer",   status: "online",  joined: "2 tháng trước", color: "#f59e0b" },
  { id: "5", name: "Tuan Le",        email: "tuanl@vng.com.vn",     role: "Editor",   status: "offline", joined: "1 tháng trước", color: "#8b5cf6" },
  { id: "6", name: "Thu Nguyen",     email: "thun@vng.com.vn",      role: "Viewer",   status: "online",  joined: "2 tuần trước",  color: "#ec4899" },
];

const ROLE_CONFIG: Record<string, { variant: "default" | "primary" | "success" | "warning" | "accent" }> = {
  Admin:  { variant: "primary" },
  Editor: { variant: "success" },
  Viewer: { variant: "default" },
};

function MemberRow({ name, email, role, status, joined, color }: typeof MEMBERS[0]) {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] group hover:border-[var(--brand-default)] transition-all">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-[13px] font-bold relative"
        style={{ background: color }}
      >
        {name.charAt(0)}
        {status === "online" && (
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--color-success-fg)] border-2 border-[var(--bg-base)]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-[var(--fg-default)] truncate">{name}</p>
        <p className="text-[12px] text-[var(--fg-muted)] truncate">{email}</p>
      </div>
      <div className="hidden md:flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1 text-[12px] text-[var(--fg-subtle)]">
          <Clock size={11} />
          {joined}
        </div>
        <Badge variant={ROLE_CONFIG[role].variant} size="sm">
          {role === "Admin" && <Shield size={10} className="mr-1" />}
          {role}
        </Badge>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--bg-surface-2)] text-[var(--fg-muted)]">
          <Mail size={13} />
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded-[var(--radius-md)] hover:bg-[var(--bg-surface-2)] text-[var(--fg-muted)]">
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { setContent } = useRightPanel();

  useEffect(() => {
    setContent(null);
    return () => setContent(null);
  }, [setContent]);

  const online = MEMBERS.filter((m) => m.status === "online").length;

  return (
    <div>
      <WorkspaceHeader
        title="Team Workspace"
        description="Quản lý thành viên và phân quyền truy cập"
        icon={<Users size={18} className="text-[var(--brand-default)]" />}
        actions={
          <Button variant="primary" size="sm" icon={<UserPlus size={14} />}>
            Mời thành viên
          </Button>
        }
      />

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Tổng thành viên",  value: MEMBERS.length, color: "var(--brand-default)" },
            { label: "Đang online",       value: online,          color: "var(--color-success-fg)" },
            { label: "Chờ xác nhận",      value: 2,              color: "var(--color-warning-fg)" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-4">
              <p className="text-[11.5px] text-[var(--fg-subtle)] mb-1">{label}</p>
              <p className="text-[24px] font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        <Tabs
          variant="underline"
          defaultValue="all"
          items={[
            { id: "all",    label: "Tất cả",    badge: MEMBERS.length },
            { id: "online", label: "Online",    badge: online },
            { id: "admin",  label: "Quản trị" },
          ]}
        >
          {(id) => {
            const filtered = id === "all"
              ? MEMBERS
              : id === "online"
                ? MEMBERS.filter((m) => m.status === "online")
                : MEMBERS.filter((m) => m.role === "Admin");
            return (
              <div className="mt-5 space-y-2">
                {filtered.map((m) => <MemberRow key={m.id} {...m} />)}
              </div>
            );
          }}
        </Tabs>
      </div>
    </div>
  );
}
