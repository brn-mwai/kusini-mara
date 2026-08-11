"use client";

// Swipe-to-confirm slider for irreversible field actions. Drag the thumb to
// the end to fire; keyboard users can focus the thumb and hold ArrowRight.

import { useRef, useState } from "react";
import { ArrowRight, Check } from "@phosphor-icons/react";

export function SwipeToConfirm({
  label,
  onConfirm,
  disabled = false,
}: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  // Percent progress mirrored in state so render never reads the ref.
  const [pct, setPct] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);

  const THUMB = 52;

  const maxX = () =>
    trackRef.current ? trackRef.current.clientWidth - THUMB - 8 : 0;

  const move = (next: number) => {
    setX(next);
    setPct(Math.round((next / Math.max(1, maxX())) * 100));
  };

  const fire = () => {
    if (confirmed || disabled) return;
    setConfirmed(true);
    move(maxX());
    onConfirm();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled || confirmed) return;
    setDragging(true);
    startX.current = e.clientX;
    startOffset.current = x;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const next = Math.min(
      Math.max(0, startOffset.current + e.clientX - startX.current),
      maxX(),
    );
    move(next);
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (x >= maxX() * 0.92) fire();
    else move(0);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || confirmed) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = Math.min(x + 24, maxX());
      move(next);
      if (next >= maxX()) fire();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(Math.max(0, x - 24));
    } else if (e.key === "Escape") {
      move(0);
    }
  };

  return (
    <div
      ref={trackRef}
      className={`relative h-15 select-none overflow-hidden rounded-full border p-1 ${
        confirmed
          ? "border-success bg-success-bg"
          : disabled
            ? "border-line bg-raised opacity-60"
            : "border-line bg-raised"
      }`}
      style={{ height: 60 }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-[14px] font-medium"
      >
        <span className={confirmed ? "text-success" : "text-ink-secondary"}>
          {confirmed ? "Custody signed" : label}
        </span>
      </div>
      <div
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={confirmed ? 100 : pct}
        aria-disabled={disabled}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={`relative z-10 flex size-[52px] cursor-grab touch-none items-center justify-center rounded-full text-white shadow-md outline-none transition-colors ${
          confirmed ? "bg-success" : "bg-brand"
        } ${dragging ? "cursor-grabbing" : ""}`}
        style={{
          transform: `translateX(${x}px)`,
          transition: dragging ? "none" : "transform 180ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {confirmed ? (
          <Check size={22} weight="bold" aria-hidden />
        ) : (
          <ArrowRight size={22} weight="bold" aria-hidden />
        )}
      </div>
    </div>
  );
}
