"use client";
import type { ReactNode } from "react";

// ── Pill ──────────────────────────────────────────────────────────────────────
export type PillTone = "ok" | "warn" | "risk" | "info" | "mut";
export function Pill({
  tone,
  icon,
  children,
}: {
  tone: PillTone;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <span className={`pill ${tone}`}>
      {icon && <i className={`ph ${icon}`} />}
      {children}
    </span>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Btn({
  variant = "default",
  icon,
  children,
  onClick,
  type = "button",
  disabled,
}: {
  variant?: "default" | "primary" | "accent" | "ghost";
  icon?: string;
  children?: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const cls =
    variant === "primary"
      ? "btn btn-primary"
      : variant === "accent"
        ? "btn btn-accent"
        : variant === "ghost"
          ? "btn btn-ghost"
          : "btn";
  return (
    <button className={cls} onClick={onClick} type={type} disabled={disabled}>
      {icon && <i className={`ph ${icon}`} />}
      {children}
    </button>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
export function Stat({
  icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: string;
  tone: "amber" | "red" | "blue" | "green";
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="kpi">
      <div className="kpi-head">
        <i className={`ph ${icon} ${tone}`} />
        {label}
      </div>
      <div className="kpi-body">
        <div className="kpi-value">{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────
export function Panel({
  title,
  desc,
  actions,
  children,
}: {
  title?: string;
  desc?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="panel">
      {(title || actions) && (
        <div className="panel-head">
          <div>
            {title && <div className="panel-title">{title}</div>}
            {desc && <div className="panel-desc">{desc}</div>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

export function EmptyState({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <div className="empty">
      <i className={`ph ${icon}`} />
      {children}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-x" onClick={onClose} aria-label="Close">
            <i className="ph ph-x" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}
