import { type ReactNode } from "react";
import { IconDotsVertical } from "@tabler/icons-react";

import { LightIconButton } from "@ui/input/LightIconButton/LightIconButton";
import { MenuItem } from "@ui/navigation/MenuItem/MenuItem";
import { type IconComponent } from "@ui/icon/types/IconComponent";

import { Dropdown } from "@/components/dropdown/Dropdown";

import styles from "./PageHeader.module.scss";

export type PageMenuItem = {
  label: string;
  Icon?: IconComponent;
  onClick: () => void;
};

type PageHeaderProps = {
  Icon: IconComponent;
  title: string;
  selectionCount?: number;
  actions?: ReactNode;
  menuItems?: PageMenuItem[];
};

export const PageHeader = ({ Icon, title, selectionCount, actions, menuItems }: PageHeaderProps) => (
  <header className={styles.header}>
    <div className={styles.titleGroup}>
      <span className={styles.titleIcon}>
        <Icon size={16} />
      </span>
      <span className={styles.title}>{title}</span>
      {selectionCount !== undefined && selectionCount > 0 && (
        <>
          <span className={styles.selectionArrow}>→</span>
          <span className={styles.selectionCount}>{selectionCount} selected</span>
        </>
      )}
    </div>
    <div className={styles.actions}>
      {actions}
      {menuItems && menuItems.length > 0 && (
        <Dropdown
          align="right"
          width={180}
          trigger={<LightIconButton Icon={IconDotsVertical} size="small" accent="tertiary" />}
        >
          {(close) =>
            menuItems.map((item) => (
              <MenuItem
                key={item.label}
                text={item.label}
                LeftIcon={item.Icon}
                onClick={() => {
                  item.onClick();
                  close();
                }}
              />
            ))
          }
        </Dropdown>
      )}
    </div>
  </header>
);
