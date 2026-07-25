"use client";

import { Palette, Sparkles } from "lucide-react";
import { PanelSection } from "@/components/ui/card";
import { GenerateButton } from "@/components/ui/generate-button";
import { Badge } from "@/components/ui/badge";

const CANVAS_SIZES = [
  { id: "a4",     label: "A4 Print",      sub: "210 × 297mm" },
  { id: "social", label: "Social Media",  sub: "1080 × 1080px" },
  { id: "banner", label: "Web Banner",    sub: "1200 × 628px" },
  { id: "custom", label: "Custom",        sub: "Tùy chỉnh" },
];

const EXPORT_FORMATS = ["PNG", "JPG", "PDF", "SVG", "WebP"];

export function CreativeStudioPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border-default)]">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[rgba(236,72,153,0.12)] flex items-center justify-center">
          <Palette size={15} strokeWidth={2} className="text-[#ec4899]" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[var(--fg-default)]">Creative Studio</div>
          <div className="text-[11px] text-[var(--fg-subtle)]">Thiết kế tích hợp AI</div>
        </div>
        <Badge variant="primary" size="sm" className="ml-auto">Beta</Badge>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <PanelSection title="Kích thước canvas">
          <div className="space-y-1.5">
            {CANVAS_SIZES.map((c, i) => (
              <label key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] cursor-pointer border border-[var(--border-default)] hover:border-[var(--brand-default)] transition-colors has-[:checked]:border-[var(--brand-default)] has-[:checked]:bg-[var(--brand-subtle)]">
                <input type="radio" name="canvas" defaultChecked={i === 1} className="accent-[var(--brand-default)]" />
                <div>
                  <div className="text-[13px] font-medium text-[var(--fg-default)]">{c.label}</div>
                  <div className="text-[11px] text-[var(--fg-subtle)]">{c.sub}</div>
                </div>
              </label>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="AI Suggestions">
          <div className="space-y-2">
            {[
              "Tự động điều chỉnh màu sắc theo brand",
              "Gợi ý layout tối ưu",
              "Kiểm tra brand compliance realtime",
            ].map((s) => (
              <label key={s} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[var(--brand-default)]" />
                <span className="text-[13px] text-[var(--fg-muted)]">{s}</span>
              </label>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Xuất file">
          <div className="flex flex-wrap gap-1.5">
            {EXPORT_FORMATS.map((f, i) => (
              <label key={f} className="cursor-pointer">
                <input type="checkbox" className="hidden peer" defaultChecked={i < 2} />
                <span className="inline-block px-3 py-1.5 text-[12.5px] rounded-full border border-[var(--border-default)] text-[var(--fg-muted)] peer-checked:border-[var(--brand-default)] peer-checked:text-[var(--brand-default)] peer-checked:bg-[var(--brand-subtle)] hover:border-[var(--fg-muted)] transition-colors cursor-pointer">
                  {f}
                </span>
              </label>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="AI Auto-Fill" description="Điền nội dung tự động từ brand guideline">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium text-[var(--brand-default)] bg-[var(--brand-subtle)] border border-[var(--brand-default)] hover:bg-[var(--brand-default)] hover:text-white transition-colors">
            <Sparkles size={14} />
            Auto-fill từ Brand Guideline
          </button>
        </PanelSection>
      </div>

      <div className="px-5 py-4 border-t border-[var(--border-default)] shrink-0">
        <GenerateButton fullWidth icon={<Sparkles size={15} />} variant="gradient">
          AI Enhance
        </GenerateButton>
      </div>
    </div>
  );
}
