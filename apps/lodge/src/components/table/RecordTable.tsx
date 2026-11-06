import { useEffect, useMemo, useState, type ReactNode } from "react";
import { IconChevronDown, IconPlus } from "@tabler/icons-react";

import { Checkbox } from "@ui/input/Checkbox/Checkbox";
import { MenuItem } from "@ui/navigation/MenuItem/MenuItem";
import { MenuItemMultiSelect } from "@ui/navigation/MenuItemMultiSelect/MenuItemMultiSelect";
import { MenuItemSelect } from "@ui/navigation/MenuItemSelect/MenuItemSelect";
import { type IconComponent } from "@ui/icon/types/IconComponent";

import { Dropdown } from "@/components/dropdown/Dropdown";

import styles from "./RecordTable.module.scss";

export type RecordColumn<Row> = {
  key: string;
  label: string;
  Icon?: IconComponent;
  width?: number;
  render: (row: Row) => ReactNode;
  isEmpty?: (row: Row) => boolean;
};

type Aggregate = "count" | "empty" | "not_empty" | "percent_empty";

const AGGREGATE_LABEL: Record<Aggregate, string> = {
  count: "Count all",
  empty: "Empty",
  not_empty: "Not empty",
  percent_empty: "Empty %",
};

export type RowAction = {
  label: string;
  Icon?: IconComponent;
  onClick: (key: string) => void;
};

type RecordTableProps<Row> = {
  columns: RecordColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  onAddNew?: () => void;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  rowActions?: RowAction[];
  emptyText?: string;
};

export const RecordTable = <Row,>({
  columns,
  rows,
  rowKey,
  onAddNew,
  selectedKeys,
  onSelectionChange,
  rowActions = [],
  emptyText = "No records.",
}: RecordTableProps<Row>) => {
  const [internalSelected, setInternalSelected] = useState<Set<string>>(new Set());
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [aggregates, setAggregates] = useState<Record<string, Aggregate>>({});
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; key: string } | null>(
    null,
  );

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("click", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [contextMenu]);

  const selected = selectedKeys !== undefined ? new Set(selectedKeys) : internalSelected;
  const setSelected = (next: Set<string>) => {
    setInternalSelected(next);
    onSelectionChange?.([...next]);
  };

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hiddenColumns.has(c.key)),
    [columns, hiddenColumns],
  );

  const allSelected = rows.length > 0 && selected.size === rows.length;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map(rowKey)));

  const toggleOne = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelected(next);
  };

  const toggleColumn = (key: string) =>
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

  const aggregateValue = (col: RecordColumn<Row>): string | null => {
    const kind = aggregates[col.key];
    if (!kind) return null;
    if (kind === "count") return String(rows.length);
    if (!col.isEmpty) return String(rows.length);
    const empty = rows.filter((r) => col.isEmpty!(r)).length;
    if (kind === "empty") return String(empty);
    if (kind === "not_empty") return String(rows.length - empty);
    return rows.length === 0 ? "0%" : `${Math.round((empty / rows.length) * 100)}%`;
  };

  return (
    <div
      className={styles.wrap}
      onScroll={(e) =>
        e.currentTarget.toggleAttribute("data-scrolled", e.currentTarget.scrollLeft > 0)
      }
    >
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.checkboxCell}>
              <Checkbox checked={allSelected} onChange={toggleAll} />
            </th>
            {visibleColumns.map(({ key, label, Icon, width }) => (
              <th key={key} style={width ? { width } : undefined}>
                <span className={styles.headerContent}>
                  {Icon && <Icon size={14} />}
                  {label}
                </span>
              </th>
            ))}
            <th className={styles.addColumnCell}>
              <Dropdown
                align="right"
                width={200}
                trigger={
                  <button type="button" className={styles.addColumnButton} aria-label="Columns">
                    <IconPlus size={14} />
                  </button>
                }
              >
                {columns.map((col) => (
                  <MenuItemMultiSelect
                    key={col.key}
                    className=""
                    text={col.label || col.key}
                    selected={!hiddenColumns.has(col.key)}
                    onSelectChange={() => toggleColumn(col.key)}
                  />
                ))}
              </Dropdown>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            return (
              <tr
                key={key}
                className={selected.has(key) ? styles.selectedRow : undefined}
                onContextMenu={
                  rowActions.length > 0
                    ? (e) => {
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY, key });
                      }
                    : undefined
                }
              >
                <td className={styles.checkboxCell}>
                  <Checkbox
                    checked={selected.has(key)}
                    onChange={() => toggleOne(key)}
                  />
                </td>
                {visibleColumns.map((col) => (
                  <td key={col.key}>{col.render(row)}</td>
                ))}
                <td className={styles.fillerCell}></td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={visibleColumns.length + 2} className={styles.empty}>
                {emptyText}
              </td>
            </tr>
          )}
          {onAddNew && (
            <tr className={styles.addNewRow}>
              <td className={styles.checkboxCell}></td>
              <td colSpan={visibleColumns.length + 1}>
                <button
                  type="button"
                  className={styles.addNewButton}
                  onClick={onAddNew}
                >
                  <IconPlus size={14} />
                  Add New
                </button>
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td className={styles.checkboxCell}></td>
            {visibleColumns.map((col, index) => (
              <td key={col.key}>
                <Dropdown
                  width={170}
                  trigger={
                    <button type="button" className={styles.calculateButton}>
                      {aggregates[col.key] ? (
                        <span className={styles.footerContent}>
                          {AGGREGATE_LABEL[aggregates[col.key]]}{" "}
                          <strong>{aggregateValue(col)}</strong>
                        </span>
                      ) : (
                        <span
                          className={
                            index === 0
                              ? `${styles.calculateHint} ${styles.calculateHintVisible}`
                              : styles.calculateHint
                          }
                        >
                          Calculate <IconChevronDown size={12} />
                        </span>
                      )}
                    </button>
                  }
                >
                  {(close) => (
                    <>
                      {(["count", "empty", "not_empty", "percent_empty"] as Aggregate[]).map(
                        (kind) => (
                          <MenuItemSelect
                            key={kind}
                            text={AGGREGATE_LABEL[kind]}
                            selected={aggregates[col.key] === kind}
                            onClick={() => {
                              setAggregates((prev) => ({ ...prev, [col.key]: kind }));
                              close();
                            }}
                          />
                        ),
                      )}
                      <MenuItemSelect
                        text="None"
                        selected={aggregates[col.key] === undefined}
                        onClick={() => {
                          setAggregates((prev) => {
                            const next = { ...prev };
                            delete next[col.key];
                            return next;
                          });
                          close();
                        }}
                      />
                    </>
                  )}
                </Dropdown>
              </td>
            ))}
            <td className={styles.fillerCell}></td>
          </tr>
        </tfoot>
      </table>

      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {rowActions.map((action) => (
            <MenuItem
              key={action.label}
              text={action.label}
              LeftIcon={action.Icon}
              onClick={() => {
                action.onClick(contextMenu.key);
                setContextMenu(null);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
