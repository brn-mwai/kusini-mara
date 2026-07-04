import { useState, type ReactNode } from "react";
import { IconPlus } from "@tabler/icons-react";

import { Checkbox } from "@ui/input/Checkbox/Checkbox";
import { type IconComponent } from "@ui/icon/types/IconComponent";

import styles from "./RecordTable.module.scss";

export type RecordColumn<Row> = {
  key: string;
  label: string;
  Icon?: IconComponent;
  width?: number;
  render: (row: Row) => ReactNode;
};

type RecordTableProps<Row> = {
  columns: RecordColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  rowClassName?: (row: Row) => string | undefined;
  countLabel?: string;
  onAddNew?: () => void;
  emptyText?: string;
};

export const RecordTable = <Row,>({
  columns,
  rows,
  rowKey,
  rowClassName,
  countLabel = "Count all",
  onAddNew,
  emptyText = "No records.",
}: RecordTableProps<Row>) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = rows.length > 0 && selected.size === rows.length;

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(rows.map(rowKey)));

  const toggleOne = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.checkboxCell}>
              <Checkbox checked={allSelected} onChange={toggleAll} />
            </th>
            {columns.map(({ key, label, Icon, width }) => (
              <th key={key} style={width ? { width } : undefined}>
                <span className={styles.headerContent}>
                  {Icon && <Icon size={14} />}
                  {label}
                </span>
              </th>
            ))}
            <th className={styles.fillerCell}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = rowKey(row);
            return (
              <tr key={key} className={rowClassName?.(row)}>
                <td className={styles.checkboxCell}>
                  <Checkbox
                    checked={selected.has(key)}
                    onChange={() => toggleOne(key)}
                  />
                </td>
                {columns.map((col) => (
                  <td key={col.key}>{col.render(row)}</td>
                ))}
                <td className={styles.fillerCell}></td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 2} className={styles.empty}>
                {emptyText}
              </td>
            </tr>
          )}
          {onAddNew && (
            <tr className={styles.addNewRow}>
              <td className={styles.checkboxCell}></td>
              <td colSpan={columns.length + 1}>
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
            <td colSpan={columns.length + 1}>
              <span className={styles.footerContent}>
                {countLabel} <strong>{rows.length}</strong>
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
