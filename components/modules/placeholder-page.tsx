import type { LucideIcon } from "lucide-react";

interface PlaceholderPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: "soon" | "beta";
  features?: string[];
  accentColor?: string;
}

export function PlaceholderPage({
  icon: Icon,
  title,
  description,
  badge = "soon",
  features = [],
  accentColor = "var(--primary)",
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: `color-mix(in srgb, ${accentColor} 12%, transparent)` }}
      >
        <Icon size={28} strokeWidth={1.5} style={{ color: accentColor }} />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <h1 className="text-[22px] font-bold text-[var(--foreground)]">{title}</h1>
        {badge && (
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: badge === "soon"
                ? "var(--surface-secondary)"
                : "color-mix(in srgb, var(--primary) 15%, transparent)",
              color: badge === "soon" ? "var(--foreground-3)" : "var(--primary)",
            }}
          >
            {badge === "soon" ? "Coming Soon" : "Beta"}
          </span>
        )}
      </div>

      <p className="text-[15px] text-[var(--foreground-3)] max-w-md leading-relaxed mb-8">
        {description}
      </p>

      {features.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full mb-8">
          {features.map((f) => (
            <div
              key={f}
              className="flex items-center gap-2.5 px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-left"
            >
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: accentColor }}
              />
              <span className="text-[13px] text-[var(--foreground-2)]">{f}</span>
            </div>
          ))}
        </div>
      )}

      <button
        className="flex items-center gap-2 px-5 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[13px] font-medium text-[var(--foreground-2)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors cursor-default"
        disabled
      >
        Thông báo khi ra mắt
      </button>
    </div>
  );
}
