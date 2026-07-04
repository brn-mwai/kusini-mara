import { type ReactNode } from "react";
import { IconChevronDown, IconList } from "@tabler/icons-react";

import styles from "./ViewBar.module.scss";

type ViewBarProps = {
  viewName: string;
  count?: number;
  right?: ReactNode;
  children?: ReactNode;
};

export const ViewBar = ({ viewName, count, right, children }: ViewBarProps) => (
  <div className={styles.bar}>
    <div className={styles.left}>
      <button type="button" className={styles.viewButton}>
        <IconList size={14} />
        <span className={styles.viewName}>{viewName}</span>
        {count !== undefined && <span className={styles.count}>· {count}</span>}
        <IconChevronDown size={12} className={styles.chevron} />
      </button>
      {children}
    </div>
    <div className={styles.right}>
      {right ?? (
        <>
          <button type="button" className={styles.textAction}>Filter</button>
          <button type="button" className={styles.textAction}>Sort</button>
          <button type="button" className={styles.textAction}>Options</button>
        </>
      )}
    </div>
  </div>
);
