"use client";
import { useMemo, useState, type ReactNode } from "react";
import { EmptyState } from "./primitives";

// Tier-1 data table, modeled on KTP's DataTable: toolbar search, sticky header,
// skeleton loading, empty state, count footer, optional row click, per-row class,
// and mono/right-aligned numeric columns. Adapted to Kusini tokens.
export type Column<Row> = {
  key: string;
  label: string;
  render: (row: Row) => ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
};

export function DataTable<Row>({
  rows,
  columns,
  searchText,
  searchPlaceholder = "Search…",
  onRowClick,
  rowClassName,
  toolbar,
  empty,
  getRowKey,
  noun = "row",
}: {
  rows: Row[] | undefined; // undefined = loading
  columns: Column<Row>[];
  searchText?: (row: Row) => string;
  searchPlaceholder?: string;
  onRowClick?: (row: Row) => void;
  rowClassName?: (row: Row) => string;
  toolbar?: ReactNode;
  empty?: { icon: string; title: string; description?: string };
  getRowKey: (row: Row, index: number) => string;
  noun?: string;
}) {
  const [q, setQ] = useState("");
  const loading = rows === undefined;
  const filtered = useMemo(() => {
    if (!rows) return null;
    const s = q.trim().toLowerCase();
    if (!s || !searchText) return rows;
    return rows.filter((r) => searchText(r).toLowerCase().includes(s));
  }, [rows, q, searchText]);
  const isEmpty = !loading && (filtered?.length ?? 0) === 0;

  return (
    <div className="dt">
      {(searchText || toolbar) && (
        <div className="dt-toolbar">
          {searchText && (
            <div className="dt-search">
              <i className="ph ph-magnifying-glass" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={searchPlaceholder}
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      <div className="dt-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ width: c.width, textAlign: c.align ?? "left" }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={`skel-${i}`}>
                  {columns.map((c) => (
                    <td key={c.key}>
                      <span className="dt-skel" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isEmpty ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: 0 }}>
                  <EmptyState icon={empty?.icon ?? "ph-tray"}>
                    {empty?.title ?? "Nothing here"}
                    {empty?.description ? (
                      <div className="reg" style={{ marginTop: 4 }}>{empty.description}</div>
                    ) : null}
                  </EmptyState>
                </td>
              </tr>
            ) : (
              filtered!.map((row, i) => (
                <tr
                  key={getRowKey(row, i)}
                  className={rowClassName?.(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={onRowClick ? { cursor: "pointer" } : undefined}
                >
                  {columns.map((c) => (
                    <td key={c.key} style={{ textAlign: c.align ?? "left" }}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filtered ? (
        <div className="dt-foot">
          {filtered.length} {noun}
          {filtered.length === 1 ? "" : "s"}
          {searchText && q ? ` (filtered from ${rows!.length})` : ""}
        </div>
      ) : null}
    </div>
  );
}
