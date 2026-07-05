import { TabButton } from "@ui/input/TabButton/TabButton";
import { type IconComponent } from "@ui/icon/types/IconComponent";

import styles from "./PageTabs.module.scss";

export type PageTab = { id: string; label: string; Icon?: IconComponent; count?: number };

type PageTabsProps = {
  tabs: PageTab[];
  activeId: string;
  onChange: (id: string) => void;
};

export const PageTabs = ({ tabs, activeId, onChange }: PageTabsProps) => (
  <div className={styles.bar}>
    {tabs.map((tab) => (
      <TabButton
        key={tab.id}
        id={`tab-${tab.id}`}
        title={tab.count !== undefined ? `${tab.label} · ${tab.count}` : tab.label}
        LeftIcon={tab.Icon}
        active={tab.id === activeId}
        onClick={() => onChange(tab.id)}
      />
    ))}
  </div>
);
