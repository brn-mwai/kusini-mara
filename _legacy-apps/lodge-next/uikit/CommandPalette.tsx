"use client";
import { useEffect, useMemo, useRef, useState } from "react";

export type CmdItem = {
  id: string;
  label: string;
  icon: string;
  section: string;
  sub?: string;
  run: () => void;
};

export function CommandPalette({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: CmdItem[];
}) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    return s
      ? items.filter((i) => (i.label + " " + i.section).toLowerCase().includes(s))
      : items;
  }, [q, items]);

  // Group filtered items by section, preserving order.
  const sections = useMemo(() => {
    const map = new Map<string, CmdItem[]>();
    for (const i of filtered) {
      if (!map.has(i.section)) map.set(i.section, []);
      map.get(i.section)!.push(i);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (!open) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[sel];
      if (item) {
        item.run();
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  let idx = -1;
  return (
    <div className="cmdk-ov open" onClick={onClose}>
      <div className="cmdk" onClick={(e) => e.stopPropagation()}>
        <div className="cmdk-in">
          <i className="ph ph-magnifying-glass" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={onKey}
            placeholder="Search pages, transfers, staff…"
          />
        </div>
        <div className="cmdk-list">
          {filtered.length === 0 && (
            <div className="cmdk-sec">No matches</div>
          )}
          {sections.map(([sec, list]) => (
            <div key={sec}>
              <div className="cmdk-sec">{sec}</div>
              {list.map((i) => {
                idx++;
                const here = idx;
                return (
                  <div
                    key={i.id}
                    className={`cmdk-item${here === sel ? " sel" : ""}`}
                    onMouseEnter={() => setSel(here)}
                    onClick={() => {
                      i.run();
                      onClose();
                    }}
                  >
                    <i className={`ph ${i.icon}`} />
                    {i.label}
                    {i.sub && <span className="sub">{i.sub}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="cmdk-foot">
          <span><span className="kbd">↑↓</span> navigate</span>
          <span><span className="kbd">↵</span> open</span>
          <span><span className="kbd">esc</span> close</span>
        </div>
      </div>
    </div>
  );
}
