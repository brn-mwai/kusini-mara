import { type ReactNode } from "react";
import {
  IconArrowsSort,
  IconChevronDown,
  IconFilter,
  IconList,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";

import { type IconComponent } from "@ui/icon/types/IconComponent";
import { MenuItemMultiSelect } from "@ui/navigation/MenuItemMultiSelect/MenuItemMultiSelect";
import { MenuItemSelect } from "@ui/navigation/MenuItemSelect/MenuItemSelect";

import { Dropdown } from "@/components/dropdown/Dropdown";

import styles from "./ViewBar.module.scss";

export type ViewOption = { id: string; label: string; Icon?: IconComponent };
export type FilterOption = { id: string; label: string };
export type SortField = { id: string; label: string };

type ViewBarProps = {
  views: ViewOption[];
  activeViewId: string;
  onViewChange: (id: string) => void;
  count?: number;
  filterOptions?: FilterOption[];
  activeFilterIds?: string[];
  onFilterToggle?: (id: string) => void;
  sortFields?: SortField[];
  activeSortId?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (id: string, direction: "asc" | "desc") => void;
  chips?: ReactNode;
};

export const ViewBar = ({
  views,
  activeViewId,
  onViewChange,
  count,
  filterOptions = [],
  activeFilterIds = [],
  onFilterToggle,
  sortFields = [],
  activeSortId,
  sortDirection = "asc",
  onSortChange,
  chips,
}: ViewBarProps) => {
  const activeView = views.find((v) => v.id === activeViewId) ?? views[0];
  const ViewIcon = activeView?.Icon ?? IconList;

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <Dropdown
          width={200}
          trigger={
            <button type="button" className={styles.viewButton}>
              <ViewIcon size={14} />
              <span className={styles.viewName}>{activeView?.label}</span>
              {count !== undefined && (
                <span className={styles.count}>· {count}</span>
              )}
              <IconChevronDown size={12} className={styles.chevron} />
            </button>
          }
        >
          {(close) =>
            views.map((view) => (
              <MenuItemSelect
                key={view.id}
                text={view.label}
                LeftIcon={view.Icon ?? IconList}
                selected={view.id === activeViewId}
                onClick={() => {
                  onViewChange(view.id);
                  close();
                }}
              />
            ))
          }
        </Dropdown>
        {chips}
      </div>

      <div className={styles.right}>
        {onFilterToggle !== undefined && filterOptions.length > 0 && (
          <Dropdown
            align="right"
            width={220}
            trigger={
              <button type="button" className={styles.textAction}>
                <IconFilter size={14} />
                Filter
                {activeFilterIds.length > 0 && (
                  <span className={styles.badge}>{activeFilterIds.length}</span>
                )}
              </button>
            }
          >
            {filterOptions.map((option) => (
              <MenuItemMultiSelect
                key={option.id}
                className=""
                text={option.label}
                selected={activeFilterIds.includes(option.id)}
                onSelectChange={() => onFilterToggle(option.id)}
              />
            ))}
          </Dropdown>
        )}

        {onSortChange !== undefined && sortFields.length > 0 && (
          <Dropdown
            align="right"
            width={200}
            trigger={
              <button type="button" className={styles.textAction}>
                <IconArrowsSort size={14} />
                Sort
              </button>
            }
          >
            {(close) => (
              <>
                {sortFields.map((field) => (
                  <MenuItemSelect
                    key={field.id}
                    text={field.label}
                    selected={field.id === activeSortId}
                    onClick={() => {
                      onSortChange(field.id, sortDirection);
                      close();
                    }}
                  />
                ))}
                <div className={styles.divider} />
                <MenuItemSelect
                  text="Ascending"
                  LeftIcon={IconSortAscending}
                  selected={sortDirection === "asc"}
                  onClick={() => {
                    onSortChange(activeSortId ?? sortFields[0].id, "asc");
                    close();
                  }}
                />
                <MenuItemSelect
                  text="Descending"
                  LeftIcon={IconSortDescending}
                  selected={sortDirection === "desc"}
                  onClick={() => {
                    onSortChange(activeSortId ?? sortFields[0].id, "desc");
                    close();
                  }}
                />
              </>
            )}
          </Dropdown>
        )}
      </div>
    </div>
  );
};
