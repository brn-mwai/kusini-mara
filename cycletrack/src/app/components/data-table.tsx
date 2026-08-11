"use client";

import {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Icon } from "@phosphor-icons/react";
import {
  CaretDown,
  CaretLeft,
  CaretLineLeft,
  CaretLineRight,
  CaretRight,
  CaretUp,
  Check,
  MagnifyingGlass,
  Rows,
  X,
} from "@phosphor-icons/react";
import { EmptyState, Mono, Skeleton } from "./ui";

export type Column<Row> = {
  key: string;
  label: string;
  render: (row: Row) => ReactNode;
  align?: "left" | "right";
  width?: string;
  sortable?: boolean;
  /** Required for sortable columns: the primitive to order by. */
  sortValue?: (row: Row) => string | number;
};

const PAGE_SIZES = [10, 25, 50] as const;

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  onRowClick,
  activeKey,
  empty,
  toolbar,
  selectable = false,
  selectionActions,
  maxHeight,
}: {
  columns: Column<Row>[];
  /** undefined → loading skeletons; [] → empty state; else rows. */
  rows: Row[] | undefined;
  rowKey: (row: Row) => string;
  onRowClick?: (row: Row) => void;
  /** Key of the row currently open in a panel. */
  activeKey?: string | null;
  empty: { icon: Icon; title: string; body: string; action?: ReactNode };
  toolbar?: ReactNode;
  selectable?: boolean;
  selectionActions?: (
    selectedKeys: string[],
    clear: () => void,
  ) => ReactNode;
  maxHeight?: number;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState<number>(25);
  const [page, setPage] = useState(1);
  const [goTo, setGoTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  const sorted = useMemo(() => {
    if (!rows) return undefined;
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return rows;
    const sv = col.sortValue;
    return [...rows].sort((a, b) => {
      const va = sv(a);
      const vb = sv(b);
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir, columns]);

  const totalPages = sorted ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const clampedPage = Math.min(page, totalPages);
  const pageRows = sorted
    ? sorted.slice((clampedPage - 1) * pageSize, clampedPage * pageSize)
    : undefined;

  const toggleSort = (col: Column<Row>) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col.key);
      setSortDir("asc");
    }
  };

  const pageKeys = (pageRows ?? []).map(rowKey);
  const allSelected =
    pageKeys.length > 0 && pageKeys.every((k) => selected.has(k));
  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) pageKeys.forEach((k) => next.delete(k));
      else pageKeys.forEach((k) => next.add(k));
      return next;
    });
  };
  const toggleOne = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  const onRowKeyDown = (
    e: ReactKeyboardEvent<HTMLTableRowElement>,
    row: Row,
  ) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const tr = e.currentTarget;
      const sibling =
        e.key === "ArrowDown"
          ? (tr.nextElementSibling as HTMLElement | null)
          : (tr.previousElementSibling as HTMLElement | null);
      sibling?.focus();
    } else if (e.key === "Enter" && onRowClick) {
      onRowClick(row);
    }
  };

  const colCount = columns.length + (selectable ? 1 : 0);

  return (
    <div className="relative overflow-hidden rounded-card border border-line bg-card shadow-sm">
      {toolbar}
      <div
        className="overflow-x-auto"
        style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-raised">
              {selectable ? (
                <th className="w-11 border-b border-line px-4 py-0">
                  <SelectBox
                    checked={allSelected}
                    onChange={toggleAll}
                    label="Select all rows on this page"
                  />
                </th>
              ) : null}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`text-table-header group border-b border-line px-4 py-2.5 ${
                    col.align === "right" ? "text-right" : "text-left"
                  } ${col.sortable ? "cursor-pointer select-none" : ""}`}
                  aria-sort={
                    sortKey === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  onClick={() => toggleSort(col)}
                >
                  <span
                    className={`inline-flex items-center gap-1 ${col.align === "right" ? "flex-row-reverse" : ""}`}
                  >
                    {col.label}
                    {col.sortable ? (
                      sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <CaretUp size={11} weight="bold" aria-hidden />
                        ) : (
                          <CaretDown size={11} weight="bold" aria-hidden />
                        )
                      ) : (
                        <CaretDown
                          size={11}
                          aria-hidden
                          className="opacity-0 transition-opacity group-hover:opacity-50"
                        />
                      )
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={bodyRef}>
            {pageRows === undefined ? (
              Array.from({ length: 8 }, (_, i) => (
                <tr key={i} className="border-b border-line-light">
                  {selectable ? (
                    <td className="h-[52px] px-4">
                      <Skeleton className="size-4" />
                    </td>
                  ) : null}
                  {columns.map((col, ci) => (
                    <td key={col.key} className="h-[52px] px-4">
                      {/* Vary widths so the shimmer reads as content. */}
                      <Skeleton
                        className={`h-3.5 ${ci % 3 === 0 ? "w-24" : ci % 3 === 1 ? "w-16" : "w-20"}`}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="p-6">
                  <EmptyState {...empty} />
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const key = rowKey(row);
                const isSelected = selected.has(key);
                const isActive = activeKey === key;
                return (
                  <tr
                    key={key}
                    tabIndex={0}
                    onKeyDown={(e) => onRowKeyDown(e, row)}
                    onClick={() => onRowClick?.(row)}
                    className={`relative h-[52px] border-b border-line-light outline-none transition-colors focus-visible:bg-page ${
                      onRowClick ? "cursor-pointer" : ""
                    } ${isSelected || isActive ? "bg-brand-subtle" : "hover:bg-page"}`}
                  >
                    {selectable ? (
                      <td
                        className="relative px-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isSelected || isActive ? (
                          <span
                            aria-hidden
                            className="absolute inset-y-0 left-0 w-[3px] bg-brand"
                          />
                        ) : null}
                        <SelectBox
                          checked={isSelected}
                          onChange={() => toggleOne(key)}
                          label={`Select row ${key}`}
                        />
                      </td>
                    ) : null}
                    {columns.map((col, ci) => (
                      <td
                        key={col.key}
                        className={`relative max-w-64 truncate px-4 text-[13px] text-ink ${
                          col.align === "right" ? "text-right" : "text-left"
                        }`}
                      >
                        {!selectable && ci === 0 && (isSelected || isActive) ? (
                          <span
                            aria-hidden
                            className="absolute inset-y-0 left-0 w-[3px] bg-brand"
                          />
                        ) : null}
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {sorted && sorted.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-light px-4 py-3">
          <label className="flex items-center gap-2 text-[13px] text-ink-secondary">
            Showing
            <select
              value={pageSize}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 rounded-ctl border border-line bg-card px-2 text-[13px] text-ink"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            per page
          </label>
          <div className="flex items-center gap-1">
            <PageButton
              label="First page"
              disabled={clampedPage === 1}
              onClick={() => setPage(1)}
            >
              <CaretLineLeft size={14} />
            </PageButton>
            <PageButton
              label="Previous page"
              disabled={clampedPage === 1}
              onClick={() => setPage(clampedPage - 1)}
            >
              <CaretLeft size={14} />
            </PageButton>
            {pageWindow(clampedPage, totalPages).map((p, i) =>
              p === "…" ? (
                <span
                  key={`e${i}`}
                  className="px-1 text-[13px] text-ink-tertiary"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-current={p === clampedPage ? "page" : undefined}
                  className={`mono h-8 min-w-8 rounded-ctl px-1.5 text-[13px] ${
                    p === clampedPage
                      ? "bg-brand-subtle font-medium text-brand"
                      : "text-ink-secondary hover:bg-raised"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <PageButton
              label="Next page"
              disabled={clampedPage === totalPages}
              onClick={() => setPage(clampedPage + 1)}
            >
              <CaretRight size={14} />
            </PageButton>
            <PageButton
              label="Last page"
              disabled={clampedPage === totalPages}
              onClick={() => setPage(totalPages)}
            >
              <CaretLineRight size={14} />
            </PageButton>
            <form
              className="ml-2 flex items-center gap-1.5 text-[13px] text-ink-secondary"
              onSubmit={(e) => {
                e.preventDefault();
                const n = Number(goTo);
                if (Number.isInteger(n) && n >= 1 && n <= totalPages)
                  setPage(n);
                setGoTo("");
              }}
            >
              Go to page
              <input
                value={goTo}
                onChange={(e) => setGoTo(e.target.value)}
                inputMode="numeric"
                aria-label="Go to page"
                className="mono h-8 w-14 rounded-ctl border border-line bg-card px-2 text-[13px] text-ink"
              />
            </form>
          </div>
        </div>
      ) : null}

      {/* floating selection bar */}
      {selectable && selected.size > 0 && selectionActions ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-3 rounded-card border border-line bg-card px-4 py-2.5 shadow-md">
            <Mono className="text-[13px] font-medium text-ink">
              {selected.size} selected
            </Mono>
            <span className="h-5 w-px bg-line" aria-hidden />
            {selectionActions([...selected], clearSelection)}
            <button
              type="button"
              onClick={clearSelection}
              aria-label="Clear selection"
              className="flex size-7 items-center justify-center rounded-ctl text-ink-secondary hover:bg-raised"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SelectBox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex size-8 cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
      <span
        aria-hidden
        className={`flex size-4 items-center justify-center rounded border transition-colors ${
          checked ? "border-brand bg-brand text-white" : "border-line bg-card"
        }`}
      >
        {checked ? <Check size={11} weight="bold" /> : null}
      </span>
    </label>
  );
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-ctl text-ink-secondary hover:bg-raised disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

// ── Toolbar ──────────────────────────────────────────────────────────────────

export function Toolbar({
  search,
  onSearch,
  count,
  countLabel = "rows",
  children,
  viewToggle,
  actions,
}: {
  search?: string;
  onSearch?: (value: string) => void;
  count?: number;
  countLabel?: string;
  /** Filter chips. */
  children?: ReactNode;
  viewToggle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-line-light px-4 py-3">
      {onSearch ? (
        <div className="relative">
          <MagnifyingGlass
            size={16}
            aria-hidden
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary"
          />
          <input
            value={search ?? ""}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search"
            aria-label="Search rows"
            className="h-9 w-56 rounded-ctl border border-line bg-card pl-8 pr-3 text-[13px] text-ink placeholder:text-ink-tertiary"
          />
        </div>
      ) : null}
      {count !== undefined ? (
        <span className="flex items-center gap-1.5 text-[13px] text-ink-secondary">
          <Rows size={14} aria-hidden className="text-ink-tertiary" />
          <Mono className="text-[13px]">{count}</Mono> {countLabel}
        </span>
      ) : null}
      {children}
      <div className="ml-auto flex items-center gap-2">
        {viewToggle}
        {actions}
      </div>
    </div>
  );
}
