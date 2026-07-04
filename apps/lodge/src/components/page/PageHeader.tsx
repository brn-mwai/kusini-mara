import { type ReactNode } from "react";

import { type IconComponent } from "@ui/icon/types/IconComponent";

import styles from "./PageHeader.module.scss";

type PageHeaderProps = {
  Icon: IconComponent;
  title: string;
  actions?: ReactNode;
};

export const PageHeader = ({ Icon, title, actions }: PageHeaderProps) => (
  <header className={styles.header}>
    <div className={styles.titleGroup}>
      <span className={styles.titleIcon}>
        <Icon size={16} />
      </span>
      <span className={styles.title}>{title}</span>
    </div>
    {actions !== undefined && <div className={styles.actions}>{actions}</div>}
  </header>
);
