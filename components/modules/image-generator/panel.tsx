"use client";

import { Sparkles } from "lucide-react";
import { PanelSection } from "@/components/ui/card";
import { GenerateButton } from "@/components/ui/generate-button";
import { StatusBadge } from "@/components/ui/status-indicator";
import { Badge } from "@/components/ui/badge";

const RATIOS = [
  { id: "1:1",   label: "1:1",   sub: "Square" },
  { id: "16:9",  label: "16:9",  sub: "Landscape" },
  { id: "9:16",  label: "9:16",  sub: "Portrait" },
  { id: "4:3",   label: "4:3",   sub: "Classic" },
];

const STYLES = ["Realistic", "Illustration", "Flat Design", "3D Render", "Watercolor", "Pixel Art"];
const QUALITIES = ["Draft", "Standard", "HD", "Ultra HD"];

export function ImageGeneratorPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border-default)]">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--accent-subtle)] flex items-center justify-center">
          <Sparkles size={15} strokeWidth={2} className="text-[var(--accent-default)]" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[var(--fg-default)]">Image Generator</div>
          <div className="text-[11px] text-[var(--fg-subtle)]">Sinh ảnh sáng tạo bằng AI</div>
        </div>
        <Badge variant="accent" size="sm" className="ml-auto">Beta</Badge>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <PanelSection title="Mô hình AI">
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface-2)] border border-[var(--border-default)] rounded-[var(--radius-md)]">
            <StatusBadge status="online" label="Imagen 3 (Google)" />
          </div>
        </PanelSection>

        <PanelSection title="Prompt">
          <textarea
            placeholder="Mô tả hình ảnh bạn muốn tạo... VD: A vibrant ZaloPay branded hero image with green and blue gradient, fintech style, modern composition"
            rows={5}
            className="w-full px-3 py-2.5 text-[13px] bg-[var(--bg-surface-1)] border border-[var(--border-default)] rounded-[var(--radius-md)] outline-none resize-none text-[var(--fg-default)] placeholder:text-[var(--fg-subtle)] focus:border-[var(--brand-default)] transition-colors"
          />
          <p className="text-[11px] text-[var(--fg-subtle)] mt-1">Viết prompt bằng tiếng Anh để đạt kết quả tốt hơn</p>
        </PanelSection>

        <PanelSection title="Tỷ lệ khung hình">
          <div className="grid grid-cols-4 gap-1.5">
            {RATIOS.map((r, i) => (
              <label key={r.id} className="cursor-pointer">
                <input type="radio" name="ratio" className="hidden peer" defaultChecked={i === 0} />
                <span className="flex flex-col items-center justify-center p-2 text-center rounded-[var(--radius-md)] border border-[var(--border-default)] text-[var(--fg-muted)] peer-checked:border-[var(--brand-default)] peer-checked:text-[var(--brand-default)] peer-checked:bg-[var(--brand-subtle)] hover:border-[var(--fg-muted)] transition-colors cursor-pointer">
                  <span className="text-[13px] font-semibold">{r.label}</span>
                  <span className="text-[10px] mt-0.5">{r.sub}</span>
                </span>
              </label>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Phong cách">
          <div className="flex flex-wrap gap-1.5">
            {STYLES.map((s, i) => (
              <label key={s} className="cursor-pointer">
                <input type="radio" name="imgstyle" className="hidden peer" defaultChecked={i === 0} />
                <span className="inline-block px-2.5 py-1.5 text-[12px] rounded-full border border-[var(--border-default)] text-[var(--fg-muted)] peer-checked:border-[var(--brand-default)] peer-checked:text-[var(--brand-default)] peer-checked:bg-[var(--brand-subtle)] hover:border-[var(--fg-muted)] transition-colors cursor-pointer">
                  {s}
                </span>
              </label>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Chất lượng">
          <div className="grid grid-cols-4 gap-1.5">
            {QUALITIES.map((q, i) => (
              <label key={q} className="cursor-pointer">
                <input type="radio" name="quality" className="hidden peer" defaultChecked={i === 1} />
                <span className="flex items-center justify-center py-2 text-[12px] font-medium rounded-[var(--radius-md)] border border-[var(--border-default)] text-[var(--fg-muted)] peer-checked:border-[var(--brand-default)] peer-checked:text-[var(--brand-default)] peer-checked:bg-[var(--brand-subtle)] hover:border-[var(--fg-muted)] transition-colors cursor-pointer">
                  {q}
                </span>
              </label>
            ))}
          </div>
        </PanelSection>
      </div>

      <div className="px-5 py-4 border-t border-[var(--border-default)] shrink-0">
        <GenerateButton fullWidth icon={<Sparkles size={15} />} variant="gradient">
          Tạo ảnh ngay
        </GenerateButton>
      </div>
    </div>
  );
}
