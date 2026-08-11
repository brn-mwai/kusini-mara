"use client";

import {
  ButtonHTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Icon } from "@phosphor-icons/react";
import { CaretDown, Check } from "@phosphor-icons/react";
import type { Tone } from "@/lib/format";

// ── Badge ────────────────────────────────────────────────────────────────────

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  brand: "bg-brand-subtle text-brand",
  neutral: "bg-raised text-ink-secondary",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-[10px] py-[3px] text-[11px] font-semibold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

// ── Button ───────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const BUTTON_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-hover disabled:opacity-50 disabled:hover:bg-brand",
  secondary:
    "bg-card text-ink border border-line hover:bg-raised disabled:opacity-50",
  ghost: "bg-transparent text-ink-secondary hover:bg-raised disabled:opacity-50",
  danger:
    "bg-danger text-white hover:opacity-90 disabled:opacity-50",
};

export function Button({
  variant = "secondary",
  icon: IconCmp,
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: Icon;
}) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex h-9 items-center gap-1.5 rounded-ctl px-3.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed ${BUTTON_CLASSES[variant]} ${className}`}
    >
      {IconCmp ? <IconCmp size={16} aria-hidden /> : null}
      {children}
    </button>
  );
}

// ── SegmentedControl ─────────────────────────────────────────────────────────

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-0.5 rounded-ctl bg-raised p-0.5"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={opt.value === value}
          onClick={() => onChange(opt.value)}
          className={`h-8 rounded-[6px] px-3 text-[13px] font-medium transition-colors ${
            opt.value === value
              ? "bg-card text-ink shadow-sm"
              : "text-ink-secondary hover:text-ink"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── FilterChip ───────────────────────────────────────────────────────────────

export function FilterChip({
  label,
  icon: IconCmp,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string;
  icon?: Icon;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = selected.length > 0;
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors ${
          active
            ? "border-brand bg-brand-subtle text-brand"
            : "border-line bg-card text-ink-secondary hover:bg-raised"
        }`}
      >
        {IconCmp ? <IconCmp size={16} aria-hidden /> : null}
        {label}
        {active ? (
          <span className="mono text-[11px]">{selected.length}</span>
        ) : null}
        <CaretDown size={12} aria-hidden />
      </button>
      {open ? (
        <div className="absolute left-0 top-10 z-30 min-w-48 rounded-ctl border border-line bg-card p-1.5 shadow-md">
          {options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <label
                key={opt.value}
                className="flex h-8 cursor-pointer items-center gap-2 rounded-[6px] px-2 text-[13px] text-ink hover:bg-raised"
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => onToggle(opt.value)}
                />
                <span
                  aria-hidden
                  className={`flex size-4 items-center justify-center rounded border ${
                    checked
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-card"
                  }`}
                >
                  {checked ? <Check size={11} weight="bold" /> : null}
                </span>
                {opt.label}
              </label>
            );
          })}
          {onClear && active ? (
            <button
              type="button"
              onClick={() => {
                onClear();
                setOpen(false);
              }}
              className="mt-1 h-8 w-full rounded-[6px] px-2 text-left text-[13px] text-ink-secondary hover:bg-raised"
            >
              Clear
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({
  icon: IconCmp,
  title,
  body,
  action,
}: {
  icon: Icon;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line px-6 py-12 text-center">
      <IconCmp size={28} className="text-ink-tertiary" aria-hidden />
      <div className="text-card-title">{title}</div>
      <p className="max-w-sm text-[13px] text-ink-secondary">{body}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

// ── Mono ─────────────────────────────────────────────────────────────────────

export function Mono({
  children,
  className = "",
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span className={`mono ${className}`} title={title}>
      {children}
    </span>
  );
}

// ── Card & PageHeader ────────────────────────────────────────────────────────

export function Card({
  title,
  actions,
  children,
  className = "",
  padded = true,
}: {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={`rounded-card border border-line bg-card shadow-sm ${className}`}
    >
      {title !== undefined || actions !== undefined ? (
        <header className="flex items-center justify-between gap-3 border-b border-line-light px-5 py-3.5">
          <h2 className="text-card-title">{title}</h2>
          {actions}
        </header>
      ) : null}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function PageHeader({
  title,
  subtitle,
  filters,
  primaryAction,
}: {
  title: string;
  subtitle?: string;
  filters?: ReactNode;
  primaryAction?: ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-page-title">{title}</h1>
          {subtitle ? (
            <p className="mt-0.5 text-[13px] text-ink-secondary">{subtitle}</p>
          ) : null}
        </div>
        {primaryAction}
      </div>
      {filters ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">{filters}</div>
      ) : null}
    </div>
  );
}

// ── ErrorState (data surfaces: loading / empty / error / populated) ─────────

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-danger/30 bg-danger-bg px-6 py-10 text-center">
      <div className="text-card-title text-danger">Something went wrong</div>
      <p className="max-w-sm text-[13px] text-ink-secondary">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
