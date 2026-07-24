"use client";

import type { BrandGuideline } from "@/lib/types";

interface BrandPanelProps {
  brandGuideline: BrandGuideline | null;
  logoUrl: string | null;
}

export function BrandPanel({ brandGuideline, logoUrl }: BrandPanelProps) {
  if (!brandGuideline) {
    return (
      <div className="card">
        <h2>Nhận diện thương hiệu</h2>
        <div className="placeholder-text">Đang tải...</div>
        <style jsx>{`
          .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 24px;
            margin-bottom: 24px;
          }
          h2 {
            font-size: 15px;
            margin: 0 0 12px;
            color: var(--primary);
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .placeholder-text {
            color: var(--muted);
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  const bg = brandGuideline;
  const colors = bg.colors || {};
  const swatches: { label: string; hex: string }[] = [];
  if (colors.primary?.hex) swatches.push({ label: "Màu chính", hex: colors.primary.hex });
  if (colors.secondary?.hex) swatches.push({ label: "Màu phụ", hex: colors.secondary.hex });
  (colors.accent?.allowedColors || []).forEach((hex, i) =>
    swatches.push({ label: `Màu nhấn ${i + 1}`, hex })
  );

  return (
    <div className="card">
      <h2>Nhận diện thương hiệu</h2>
      <div className="brand-row">
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Brand logo"
            className="logo-img"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div>
          <div className="brand-name">{bg.brandName || "—"}</div>
          <div className="brand-tone">{(bg.tone || []).join(", ")}</div>
        </div>
      </div>

      <div className="swatches">
        {swatches.map((s) => (
          <div key={s.label} className="swatch">
            <span className="swatch-color" style={{ background: s.hex }} />
            {s.label} {s.hex}
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: "18px" }}>Quy chuẩn thương hiệu</h2>
      <dl>
        <div>
          <dt>Font tiêu đề</dt>
          <span>{bg.typography?.headingFont || "—"}</span>
        </div>
        <div>
          <dt>Font nội dung</dt>
          <span>{bg.typography?.bodyFont || "—"}</span>
        </div>
        <div>
          <dt>Tỷ lệ màu</dt>
          <span>
            {bg.brandRules?.colorBalance
              ? Object.entries(bg.brandRules.colorBalance)
                  .map(([k, v]) => `${k}: ${v}%`)
                  .join(", ")
              : "—"}
          </span>
        </div>
        <div>
          <dt>Độ tương phản tối thiểu</dt>
          <span>{bg.brandRules?.minimumContrast || "—"}</span>
        </div>
        <div>
          <dt>Yêu cầu logo</dt>
          <span>{bg.logo?.rules?.mustAppear ? "Có" : "Không"}</span>
        </div>
        <div>
          <dt>Vị trí logo ưu tiên</dt>
          <span>
            {(bg.logo?.rules?.preferredPositions || []).join(", ") || "—"}
          </span>
        </div>
      </dl>

      <style jsx>{`
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 24px;
        }
        h2 {
          font-size: 15px;
          margin: 0 0 12px;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .brand-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 12px;
        }
        .logo-img {
          max-width: 160px;
          max-height: 60px;
          object-fit: contain;
          background: var(--surface-secondary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 8px;
        }
        .brand-name {
          font-weight: 600;
          font-size: 16px;
        }
        .brand-tone {
          font-size: 12px;
          color: var(--muted);
        }
        .swatches {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .swatch {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--muted);
        }
        .swatch-color {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 1px solid var(--border);
          display: inline-block;
        }
        dl {
          margin: 0;
          font-size: 13px;
          color: var(--muted);
        }
        dl div {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          border-bottom: 1px dashed var(--border);
        }
        dl div:last-child {
          border-bottom: none;
        }
        dl dt {
          font-weight: 500;
          color: var(--foreground);
        }
      `}</style>
    </div>
  );
}
