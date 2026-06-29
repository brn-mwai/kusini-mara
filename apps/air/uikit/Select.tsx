"use client";
import { useEffect, useRef, useState } from "react";

export type SelectOption = { value: string; label: string };

// Custom dropdown — styled trigger + fixed-positioned menu (escapes modal scroll
// clipping). Replaces the native <select> for a consistent dark/light look.
export function Select({
  value,
  onChange,
  options,
  placeholder = "Select…",
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = options.find((o) => o.value === value);

  const place = () => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) setRect({ left: r.left, top: r.bottom + 4, width: r.width });
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <div className="csel">
      <button
        type="button"
        ref={triggerRef}
        className={`csel-trigger${open ? " open" : ""}`}
        onClick={() => {
          if (open) setOpen(false);
          else { place(); setOpen(true); }
        }}
      >
        <span className={`lab${current ? "" : " csel-ph"}`}>{current ? current.label : placeholder}</span>
        <i className="ph ph-caret-down ca" />
      </button>
      {open && rect && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 89 }} onClick={() => setOpen(false)} />
          <div className="csel-menu" style={{ left: rect.left, top: rect.top, width: rect.width }}>
            {options.length === 0 && <div className="csel-opt csel-ph">No options</div>}
            {options.map((o) => (
              <div
                key={o.value}
                className={`csel-opt${o.value === value ? " sel" : ""}`}
                onClick={() => { onChange(o.value); setOpen(false); }}
              >
                {o.label}
                {o.value === value && <i className="ph ph-check chk" />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, "0");
  return { value: h, label: h };
});
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => ({ value: m, label: m }));

export function TimeField({
  hour,
  minute,
  onChange,
}: {
  hour: string;
  minute: string;
  onChange: (hour: string, minute: string) => void;
}) {
  return (
    <div className="timefield">
      <Select value={hour} onChange={(v) => onChange(v, minute)} options={HOURS} />
      <span className="colon">:</span>
      <Select value={minute} onChange={(v) => onChange(hour, v)} options={MINUTES} />
    </div>
  );
}
