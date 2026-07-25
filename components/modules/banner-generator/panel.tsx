"use client";

import { Image, Sparkles } from "lucide-react";
import { PanelSection } from "@/components/ui/card";
import { GenerateButton } from "@/components/ui/generate-button";
import { StatusBadge } from "@/components/ui/status-indicator";
import { Badge } from "@/components/ui/badge";

const SIZES = [
  { id: "1200x628", label: "Facebook / LinkedIn", sub: "1200 × 628" },
  { id: "1080x1080", label: "Instagram Square",  sub: "1080 × 1080" },
  { id: "1080x1920", label: "Story / Reels",     sub: "1080 × 1920" },
  { id: "728x90",    label: "Web Banner",         sub: "728 × 90" },
];

const STYLES = ["Modern", "Minimal", "Bold", "Festive", "Corporate"];

export function BannerGeneratorPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border-default)]">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--brand-subtle)] flex items-center justify-center">
          <Image size={15} strokeWidth={2} className="text-[var(--brand-default)]" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[var(--fg-default)]">Banner Generator</div>
          <div className="text-[11px] text-[var(--fg-subtle)]">Tạo banner tự động với AI</div>
        </div>
        <Badge variant="primary" size="sm" className="ml-auto">Beta</Badge>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <PanelSection title="Mô hình AI">
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-[var(--radius-md)]">
            <StatusBadge status="online" label="Gemini 2.0 Flash" />
          </div>
        </PanelSection>

        <PanelSection title="Kích thước banner">
          <div className="grid grid-cols-1 gap-1.5">
            {SIZES.map((s, i) => (
              <label key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] cursor-pointer border border-[var(--border-default)] hover:border-[var(--brand-default)] transition-colors has-[:checked]:border-[var(--brand-default)] has-[:checked]:bg-[var(--brand-subtle)]">
                <input type="radio" name="size" defaultChecked={i === 0} className="accent-[var(--brand-default)]" />
                <div>
                  <div className="text-[13px] font-medium text-[var(--fg-default)]">{s.label}</div>
                  <div className="text-[11px] text-[var(--fg-subtle)]">{s.sub}</div>
                </div>
              </label>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Phong cách thiết kế">
          <div className="flex flex-wrap gap-1.5">
            {STYLES.map((s, i) => (
              <label key={s} className="cursor-pointer">
                <input type="radio" name="style" className="hidden peer" defaultChecked={i === 0} />
                <span className="inline-block px-3 py-1.5 text-[12.5px] rounded-full border border-[var(--border-default)] text-[var(--fg-muted)] peer-checked:border-[var(--brand-default)] peer-checked:text-[var(--brand-default)] peer-checked:bg-[var(--brand-subtle)] hover:border-[var(--fg-muted)] transition-colors cursor-pointer">
                  {s}
                </span>
              </label>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Nội dung">
          <textarea
            placeholder="Mô tả nội dung banner... VD: Banner khuyến mãi 50% cho ví ZaloPay, Tết Nguyên Đán 2025"
            rows={4}
            className="w-full px-3 py-2.5 text-[13px] bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-md)] outline-none resize-none text-[var(--fg-default)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--brand-default)] transition-colors"
          />
        </PanelSection>

        <PanelSection title="Số lượng biến thể">
          <div className="flex items-center gap-2">
            {[1, 2, 4, 8].map((n) => (
              <label key={n} className="flex-1 cursor-pointer">
                <input type="radio" name="variants" className="hidden peer" defaultChecked={n === 4} />
                <span className="flex items-center justify-center py-2 text-[13px] font-medium rounded-[var(--radius-md)] border border-[var(--border-default)] text-[var(--fg-muted)] peer-checked:border-[var(--brand-default)] peer-checked:text-[var(--brand-default)] peer-checked:bg-[var(--brand-subtle)] hover:border-[var(--fg-muted)] transition-colors cursor-pointer">
                  {n}
                </span>
              </label>
            ))}
          </div>
        </PanelSection>
      </div>

      <div className="px-5 py-4 border-t border-[var(--border-default)] shrink-0">
        <GenerateButton fullWidth icon={<Sparkles size={15} />} variant="gradient">
          Tạo banner ngay
        </GenerateButton>
      </div>
    </div>
  );
}
