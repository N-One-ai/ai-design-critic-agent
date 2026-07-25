import { type ReactNode } from "react";
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type AlertVariant = "info" | "success" | "warning" | "danger";

const ALERT_STYLES: Record<
  AlertVariant,
  { bg: string; border: string; title: string; text: string; icon: LucideIcon }
> = {
  info: {
    bg:     "bg-[var(--info-subtle)]",
    border: "border-[var(--info-default)]",
    title:  "text-[var(--info-default)]",
    text:   "text-[var(--info-default)]",
    icon:   Info,
  },
  success: {
    bg:     "bg-[var(--success-subtle)]",
    border: "border-[var(--success-default)]",
    title:  "text-[var(--success-default)]",
    text:   "text-[var(--success-default)]",
    icon:   CheckCircle2,
  },
  warning: {
    bg:     "bg-[var(--warning-subtle)]",
    border: "border-[var(--warning-default)]",
    title:  "text-[var(--warning-default)]",
    text:   "text-[var(--warning-default)]",
    icon:   AlertTriangle,
  },
  danger: {
    bg:     "bg-[var(--danger-subtle)]",
    border: "border-[var(--danger-default)]",
    title:  "text-[var(--danger-default)]",
    text:   "text-[var(--danger-default)]",
    icon:   XCircle,
  },
};

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  onDismiss,
  className,
}: AlertProps) {
  const styles = ALERT_STYLES[variant];
  const Icon = styles.icon;

  return (
    <div
      role="alert"
      className={cn(
        "relative flex gap-3 px-4 py-3.5 rounded-[var(--radius-lg)] border",
        styles.bg,
        styles.border,
        className
      )}
    >
      <Icon
        size={17}
        strokeWidth={2}
        className={cn("shrink-0 mt-0.5", styles.text)}
      />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn("text-[13px] font-semibold", styles.title)}>
            {title}
          </p>
        )}
        {children && (
          <div className={cn("text-[13px] mt-0.5", styles.text, title && "opacity-90")}>
            {children}
          </div>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            "shrink-0 flex items-center justify-center w-5 h-5 rounded opacity-70 hover:opacity-100 transition-opacity",
            styles.text
          )}
          aria-label="Đóng"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
