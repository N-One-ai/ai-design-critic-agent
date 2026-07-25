import { type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const AVATAR_SIZE: Record<AvatarSize, { px: number; text: string }> = {
  xs: { px: 24, text: "text-[9px]" },
  sm: { px: 32, text: "text-[11px]" },
  md: { px: 40, text: "text-[13px]" },
  lg: { px: 48, text: "text-[16px]" },
  xl: { px: 64, text: "text-[20px]" },
};

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
  fallbackColor?: string;
}

export function Avatar({ src, name, size = "md", className, fallbackColor }: AvatarProps) {
  const { px, text } = AVATAR_SIZE[size];
  const letters = name ? initials(name) : "?";

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 font-bold select-none",
        className
      )}
      style={{ width: px, height: px }}
    >
      {src ? (
        <img
          src={src}
          alt={name ?? "Avatar"}
          width={px}
          height={px}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span
          className={cn("w-full h-full flex items-center justify-center", text)}
          style={{
            background:
              fallbackColor ??
              "linear-gradient(135deg, var(--brand-default), var(--accent-default))",
            color: "white",
          }}
        >
          {letters}
        </span>
      )}
    </div>
  );
}

/* ── AvatarGroup ── */
export function AvatarGroup({
  avatars,
  max = 4,
  size = "sm",
}: {
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarSize;
}) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const { px, text } = AVATAR_SIZE[size];

  return (
    <div className="flex items-center">
      {visible.map((av, i) => (
        <div
          key={i}
          className="rounded-full ring-2 ring-[var(--bg-surface-1)]"
          style={{ marginLeft: i > 0 ? -px / 4 : 0 }}
        >
          <Avatar {...av} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "rounded-full ring-2 ring-[var(--bg-surface-1)]",
            "flex items-center justify-center font-bold bg-[var(--bg-surface-3)] text-[var(--fg-muted)]",
            text
          )}
          style={{ width: px, height: px, marginLeft: -px / 4 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
