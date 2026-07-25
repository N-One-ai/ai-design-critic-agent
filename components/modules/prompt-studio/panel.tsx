"use client";

import { PenTool, Sparkles, RefreshCw } from "lucide-react";
import { PanelSection } from "@/components/ui/card";
import { GenerateButton } from "@/components/ui/generate-button";
import { StatusBadge } from "@/components/ui/status-indicator";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["Marketing", "Social Media", "Product", "Email", "Ad Copy", "Story"];
const MODELS = [
  { id: "gemini", label: "Gemini 2.0 Flash", status: "online" as const },
  { id: "claude", label: "Claude Sonnet 4.6", status: "online" as const },
  { id: "gpt4",   label: "GPT-4o",            status: "idle"   as const },
];

export function PromptStudioPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border-default)]">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[rgba(6,182,212,0.12)] flex items-center justify-center">
          <PenTool size={15} strokeWidth={2} className="text-[#06b6d4]" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[var(--fg-default)]">Prompt Studio</div>
          <div className="text-[11px] text-[var(--fg-subtle)]">Thư viện & tối ưu prompt AI</div>
        </div>
        <Badge variant="accent" size="sm" className="ml-auto">New</Badge>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <PanelSection title="Mô hình AI">
          <div className="space-y-1.5">
            {MODELS.map((m, i) => (
              <label key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] cursor-pointer border border-[var(--border-default)] hover:border-[var(--brand-default)] transition-colors has-[:checked]:border-[var(--brand-default)] has-[:checked]:bg-[var(--brand-subtle)]">
                <input type="radio" name="model" defaultChecked={i === 0} className="accent-[var(--brand-default)]" />
                <StatusBadge status={m.status} label={m.label} />
              </label>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Danh mục prompt">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c, i) => (
              <label key={c} className="cursor-pointer">
                <input type="checkbox" className="hidden peer" defaultChecked={i < 2} />
                <span className="inline-block px-2.5 py-1.5 text-[12px] rounded-full border border-[var(--border-default)] text-[var(--fg-muted)] peer-checked:border-[var(--brand-default)] peer-checked:text-[var(--brand-default)] peer-checked:bg-[var(--brand-subtle)] hover:border-[var(--fg-muted)] transition-colors cursor-pointer">
                  {c}
                </span>
              </label>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Biến số tùy chỉnh">
          <div className="space-y-2.5">
            {[
              { label: "Tên thương hiệu", placeholder: "ZaloPay", value: "ZaloPay" },
              { label: "Tone of voice",    placeholder: "Thân thiện, chuyên nghiệp", value: "" },
              { label: "Target audience",  placeholder: "Người dùng 18-35 tuổi",    value: "" },
            ].map(({ label, placeholder }) => (
              <div key={label}>
                <p className="text-[11.5px] font-medium text-[var(--fg-muted)] mb-1">{label}</p>
                <input
                  type="text"
                  placeholder={placeholder}
                  className="w-full h-8 px-3 text-[13px] bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-md)] outline-none text-[var(--fg-default)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--brand-default)] transition-colors"
                />
              </div>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Tối ưu hóa">
          <div className="space-y-2">
            {["Tối ưu cho SEO", "Thêm CTA mạnh mẽ", "Chuẩn hóa theo brand voice"].map((opt) => (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[var(--brand-default)]" />
                <span className="text-[13px] text-[var(--fg-muted)]">{opt}</span>
              </label>
            ))}
          </div>
        </PanelSection>
      </div>

      <div className="px-5 py-4 border-t border-[var(--border-default)] space-y-2 shrink-0">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-[13px] font-medium text-[var(--fg-muted)] bg-[var(--bg-surface-2)] border border-[var(--border-default)] hover:border-[var(--fg-muted)] transition-colors">
          <RefreshCw size={13} />
          Tạo lại biến thể
        </button>
        <GenerateButton fullWidth icon={<Sparkles size={15} />} variant="gradient">
          Tối ưu prompt
        </GenerateButton>
      </div>
    </div>
  );
}
