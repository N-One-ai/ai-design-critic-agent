"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────
   Shared field wrapper
───────────────────────────────────────── */
interface FieldWrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

function FieldWrapper({ label, hint, error, required, className, children }: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-[12.5px] font-medium text-[var(--fg-default)]">
          {label}
          {required && <span className="text-[var(--danger-default)] ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[11.5px] text-[var(--danger-default)]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11.5px] text-[var(--fg-subtle)]">{hint}</p>
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────
   Input
───────────────────────────────────────── */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  icon?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, prefix, suffix, icon, wrapperClassName, className, ...props },
  ref
) {
  const hasDecoration = prefix || suffix || icon;

  const fieldBase = cn(
    "w-full text-[13.5px] text-[var(--fg-default)] bg-[var(--bg-surface-1)]",
    "border rounded-[var(--radius-md)] outline-none",
    "transition-[border-color,box-shadow] duration-fast ease-ease",
    "placeholder:text-[var(--fg-subtle)]",
    "disabled:opacity-50 disabled:pointer-events-none",
    error
      ? "border-[var(--danger-default)] focus:border-[var(--danger-default)] focus:ring-1 focus:ring-[var(--danger-default)]"
      : "border-[var(--border-default)] focus:border-[var(--brand-default)] focus:ring-1 focus:ring-[var(--brand-default)]",
    hasDecoration ? "h-9 pl-3 pr-3" : "h-9 px-3",
    className
  );

  const input = hasDecoration ? (
    <div className="relative flex items-center">
      {(prefix || icon) && (
        <span className="absolute left-3 flex items-center text-[var(--fg-subtle)]">
          {prefix || icon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(fieldBase, !!(prefix || icon) && "pl-9", !!suffix && "pr-9")}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 flex items-center text-[var(--fg-subtle)]">
          {suffix}
        </span>
      )}
    </div>
  ) : (
    <input ref={ref} className={fieldBase} {...props} />
  );

  if (!label && !hint && !error) return input;

  return (
    <FieldWrapper
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      className={wrapperClassName}
    >
      {input}
    </FieldWrapper>
  );
});

/* ─────────────────────────────────────────
   Textarea
───────────────────────────────────────── */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, wrapperClassName, className, ...props },
  ref
) {
  const field = (
    <textarea
      ref={ref}
      className={cn(
        "w-full text-[13.5px] text-[var(--fg-default)] bg-[var(--bg-surface-1)]",
        "border rounded-[var(--radius-md)] outline-none resize-none",
        "transition-[border-color,box-shadow] duration-fast ease-ease",
        "px-3 py-2.5 min-h-[100px]",
        "placeholder:text-[var(--fg-subtle)]",
        "disabled:opacity-50 disabled:pointer-events-none",
        error
          ? "border-[var(--danger-default)] focus:border-[var(--danger-default)] focus:ring-1 focus:ring-[var(--danger-default)]"
          : "border-[var(--border-default)] focus:border-[var(--brand-default)] focus:ring-1 focus:ring-[var(--brand-default)]",
        className
      )}
      {...props}
    />
  );

  if (!label && !hint && !error) return field;

  return (
    <FieldWrapper
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      className={wrapperClassName}
    >
      {field}
    </FieldWrapper>
  );
});

/* ─────────────────────────────────────────
   SearchInput
───────────────────────────────────────── */
import { Search, X } from "lucide-react";

export interface SearchInputProps extends Omit<InputProps, "prefix" | "suffix"> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ onClear, className, value, ...props }, ref) {
    return (
      <div className="relative flex items-center">
        <span className="absolute left-3 flex items-center text-[var(--fg-subtle)] pointer-events-none">
          <Search size={15} strokeWidth={1.8} />
        </span>
        <input
          ref={ref}
          value={value}
          className={cn(
            "w-full h-9 pl-9 pr-8 text-[13.5px]",
            "bg-[var(--bg-surface-1)] text-[var(--fg-default)]",
            "border border-[var(--border-default)] rounded-[var(--radius-md)]",
            "outline-none placeholder:text-[var(--fg-subtle)]",
            "transition-[border-color,box-shadow] duration-fast ease-ease",
            "focus:border-[var(--brand-default)] focus:ring-1 focus:ring-[var(--brand-default)]",
            className
          )}
          {...props}
        />
        {onClear && value && (
          <button
            onClick={onClear}
            className="absolute right-2.5 flex items-center text-[var(--fg-subtle)] hover:text-[var(--fg-default)] transition-colors"
            type="button"
            tabIndex={-1}
          >
            <X size={13} strokeWidth={2} />
          </button>
        )}
      </div>
    );
  }
);
