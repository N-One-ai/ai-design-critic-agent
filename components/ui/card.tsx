import { type HTMLAttributes, type ReactNode, forwardRef } from "react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────
   Card
───────────────────────────────────────── */
export type CardVariant = "default" | "elevated" | "flat" | "brand";
export type CardPadding  = "none" | "xs" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
  children?: ReactNode;
}

const CARD_VARIANT: Record<CardVariant, string> = {
  default:  "bg-[var(--bg-surface-1)] border border-[var(--border-default)]",
  elevated: "bg-[var(--bg-surface-1)] shadow-2",
  flat:     "bg-[var(--bg-surface-2)]",
  brand:    "bg-[var(--brand-subtle)] border border-[var(--brand-default)]",
};

const CARD_PADDING: Record<CardPadding, string> = {
  none: "",
  xs:   "p-3",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "default", padding = "md", interactive = false, className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-[var(--radius-lg)] overflow-hidden",
        CARD_VARIANT[variant],
        CARD_PADDING[padding],
        interactive && "transition-[box-shadow,border-color] duration-fast ease-ease cursor-pointer hover:shadow-hover hover:border-[var(--border-strong)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

/* ─────────────────────────────────────────
   CardHeader
───────────────────────────────────────── */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  action?: ReactNode;
  children: ReactNode;
}

export function CardHeader({ action, className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("flex items-start justify-between gap-3 mb-4", className)}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────
   CardTitle
───────────────────────────────────────── */
export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-[15px] font-semibold leading-snug text-[var(--fg-default)]",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

/* ─────────────────────────────────────────
   CardDescription
───────────────────────────────────────── */
export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-[13px] text-[var(--fg-muted)] mt-0.5", className)}
      {...props}
    >
      {children}
    </p>
  );
}

/* ─────────────────────────────────────────
   CardContent
───────────────────────────────────────── */
export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   CardFooter
───────────────────────────────────────── */
export function CardFooter({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 pt-4 mt-4 border-t border-[var(--border-default)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   CardDivider
───────────────────────────────────────── */
export function CardDivider({ className }: { className?: string }) {
  return (
    <hr
      className={cn(
        "border-0 border-t border-[var(--border-default)] -mx-5 my-4",
        className
      )}
    />
  );
}

/* ─────────────────────────────────────────
   Panel (full-height right panel section)
   Usage: groups of settings in the right panel
───────────────────────────────────────── */
export interface PanelSectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function PanelSection({
  title,
  description,
  action,
  className,
  children,
  ...props
}: PanelSectionProps) {
  return (
    <section
      className={cn("py-4 px-5 border-b border-[var(--border-default)] last:border-0", className)}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            {title && (
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--fg-subtle)]">
                {title}
              </h4>
            )}
            {description && (
              <p className="text-[12px] text-[var(--fg-muted)] mt-0.5">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
