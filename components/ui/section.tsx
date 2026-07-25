import { type ReactNode, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────
   WorkspaceHeader — top of each module page
───────────────────────────────────────── */
export interface WorkspaceHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function WorkspaceHeader({
  title,
  description,
  icon,
  actions,
  badge,
  className,
}: WorkspaceHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-6 py-5",
        "border-b border-[var(--border-default)] bg-[var(--bg-surface-1)]",
        "sticky top-0 z-10",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-[var(--brand-subtle)] flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[17px] font-semibold text-[var(--fg-default)] truncate">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-[13px] text-[var(--fg-muted)] mt-0.5 truncate">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────
   Section — content section inside workspace
───────────────────────────────────────── */
export interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function Section({
  title,
  description,
  action,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn("", className)} {...props}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title && (
              <h2 className="text-[13.5px] font-semibold text-[var(--fg-default)]">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[12.5px] text-[var(--fg-muted)] mt-0.5">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

/* ─────────────────────────────────────────
   PageContainer — standard workspace content wrapper
───────────────────────────────────────── */
export function PageContainer({
  className,
  children,
  maxWidth = "max-w-4xl",
}: {
  className?: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className={cn("p-6", maxWidth, className)}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   SectionDivider
───────────────────────────────────────── */
export function SectionDivider({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  if (!label) {
    return <hr className={cn("border-t border-[var(--border-default)] my-6", className)} />;
  }
  return (
    <div className={cn("flex items-center gap-3 my-6", className)}>
      <div className="flex-1 h-px bg-[var(--border-default)]" />
      <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--fg-subtle)]">
        {label}
      </span>
      <div className="flex-1 h-px bg-[var(--border-default)]" />
    </div>
  );
}
