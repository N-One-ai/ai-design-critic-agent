"use client";

import { useEffect } from "react";
import { PenTool, Copy, Star, Plus, Search } from "lucide-react";
import { useRightPanel } from "@/contexts/right-panel-context";
import { PromptStudioPanel } from "@/components/modules/prompt-studio/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { WorkspaceHeader } from "@/components/ui/section";
import { EmptyState } from "@/components/ui/empty-state";

const LIBRARY_PROMPTS = [
  { id: "1", title: "ZaloPay Hero Banner",    cat: "Marketing",   uses: 142, model: "Gemini" },
  { id: "2", title: "Flash Sale Copy",         cat: "Ad Copy",     uses: 98,  model: "Claude" },
  { id: "3", title: "Feature Announcement",    cat: "Social Media",uses: 76,  model: "Gemini" },
  { id: "4", title: "Cashback Promotion",      cat: "Marketing",   uses: 64,  model: "GPT-4o" },
  { id: "5", title: "App Review Request",      cat: "Email",       uses: 55,  model: "Claude" },
  { id: "6", title: "Partnership Announcement",cat: "Product",     uses: 43,  model: "Gemini" },
];

function PromptCard({ title, cat, uses, model }: { title: string; cat: string; uses: number; model: string }) {
  return (
    <div className="bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-4 group cursor-pointer hover:border-[var(--brand-default)] transition-all">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[rgba(6,182,212,0.1)] flex items-center justify-center shrink-0">
          <PenTool size={13} className="text-[#06b6d4]" />
        </div>
        <button className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[var(--fg-subtle)] hover:text-amber-400">
          <Star size={13} />
        </button>
      </div>
      <p className="text-[13.5px] font-semibold text-[var(--fg-default)] mb-2">{title}</p>
      <div className="flex items-center gap-1.5 mb-3">
        <Badge variant="default" size="sm">{cat}</Badge>
        <Badge variant="accent" size="sm">{model}</Badge>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-[var(--fg-subtle)]">{uses} lần dùng</span>
        <button className="flex items-center gap-1 text-[11.5px] text-[var(--fg-muted)] hover:text-[var(--brand-default)] transition-colors opacity-0 group-hover:opacity-100">
          <Copy size={11} />
          Sao chép
        </button>
      </div>
    </div>
  );
}

export default function PromptStudioPage() {
  const { setContent } = useRightPanel();

  useEffect(() => {
    setContent(<PromptStudioPanel />);
    return () => setContent(null);
  }, [setContent]);

  return (
    <div>
      <WorkspaceHeader
        title="Prompt Studio"
        description="Thư viện prompt AI tối ưu cho nội dung ZaloPay"
        icon={<PenTool size={18} className="text-[#06b6d4]" />}
        badge={<Badge variant="accent" size="sm">New</Badge>}
        actions={
          <Button variant="primary" size="sm" icon={<Plus size={14} />}>
            Prompt mới
          </Button>
        }
      />

      <div className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)]">
            <Search size={14} className="text-[var(--fg-subtle)] shrink-0" />
            <input
              type="text"
              placeholder="Tìm prompt..."
              className="flex-1 text-[13.5px] bg-transparent outline-none text-[var(--fg-default)] placeholder:text-[var(--fg-subtle)]"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {["Tất cả", "Marketing", "Social", "Email"].map((f, i) => (
              <button
                key={f}
                className={`px-3 py-1.5 text-[12.5px] rounded-full border transition-colors ${i === 0 ? "border-[var(--brand-default)] text-[var(--brand-default)] bg-[var(--brand-subtle)]" : "border-[var(--border-default)] text-[var(--fg-muted)] hover:border-[var(--fg-muted)]"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <Tabs
          variant="underline"
          defaultValue="library"
          items={[
            { id: "library",  label: "Thư viện", badge: LIBRARY_PROMPTS.length },
            { id: "my-prompts", label: "Của tôi" },
            { id: "shared",   label: "Team" },
          ]}
        >
          {(id) => {
            if (id === "library") return (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {LIBRARY_PROMPTS.map((p) => (
                  <PromptCard key={p.id} {...p} />
                ))}
              </div>
            );
            if (id === "my-prompts") return (
              <EmptyState
                icon={PenTool}
                title="Chưa có prompt nào"
                description="Tạo prompt mới hoặc sao chép từ thư viện để cá nhân hóa cho dự án của bạn."
                action={<Button size="sm" icon={<Plus size={14} />}>Tạo prompt mới</Button>}
              />
            );
            return (
              <EmptyState
                icon={PenTool}
                title="Chưa có prompt team"
                description="Các prompt được chia sẻ bởi thành viên trong team sẽ hiển thị ở đây."
                size="sm"
              />
            );
          }}
        </Tabs>
      </div>
    </div>
  );
}
