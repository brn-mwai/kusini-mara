"use client";

import { ReactNode, useEffect, useRef } from "react";
import { X } from "@phosphor-icons/react";

// Slides in from the right, 480px, full height minus the top bar. Closes on
// Escape and backdrop click. `tone="danger"` renders the emergency variant.
export function SidePanel({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  tone = "default",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  tone?: "default" | "danger";
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const danger = tone === "danger";
  return (
    <div className="fixed inset-0 z-40" role="presentation">
      <div
        className="absolute inset-0 bg-scrim"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={`panel-enter absolute bottom-0 right-0 top-14 flex w-full max-w-[480px] flex-col border-l shadow-md outline-none ${
          danger ? "border-danger bg-danger-bg" : "border-line bg-card"
        }`}
      >
        <header
          className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${
            danger ? "border-danger/30" : "border-line-light"
          }`}
        >
          <div className="min-w-0">
            <h2
              className={`text-card-title ${danger ? "text-danger" : ""}`}
            >
              {title}
            </h2>
            {subtitle ? (
              <div className="mt-0.5 text-[13px] text-ink-secondary">
                {subtitle}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex size-8 shrink-0 items-center justify-center rounded-ctl text-ink-secondary hover:bg-raised"
          >
            <X size={16} />
          </button>
        </header>
        <div
          className={`min-h-0 flex-1 overflow-y-auto px-5 py-4 ${danger ? "" : "bg-card"}`}
        >
          {children}
        </div>
        {footer ? (
          <footer
            className={`border-t px-5 py-3.5 ${
              danger ? "border-danger/30" : "border-line-light bg-card"
            }`}
          >
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
