import { useEffect, useState, type ReactNode } from "react";
import { IconChevronDown, IconChevronUp, IconX } from "@tabler/icons-react";

import { Avatar } from "@ui/data-display/Avatar/Avatar";
import { LightIconButton } from "@ui/input/LightIconButton/LightIconButton";
import { MenuItemSelect } from "@ui/navigation/MenuItemSelect/MenuItemSelect";
import { type IconComponent } from "@ui/icon/types/IconComponent";

import { Dropdown } from "@/components/dropdown/Dropdown";

import styles from "./RecordPanel.module.scss";

export type PanelField =
  | {
      kind: "text" | "number";
      key: string;
      label: string;
      Icon?: IconComponent;
      value: string;
      placeholder?: string;
      onCommit: (value: string) => void;
    }
  | {
      kind: "select";
      key: string;
      label: string;
      Icon?: IconComponent;
      value: string;
      options: { id: string; label: string }[];
      onCommit: (value: string) => void;
    }
  | {
      kind: "readonly";
      key: string;
      label: string;
      Icon?: IconComponent;
      content: ReactNode;
    };

export type PanelGroup = { label: string; fields: PanelField[] };

type RecordPanelProps = {
  title: string;
  titlePlaceholder?: string;
  onTitleCommit?: (value: string) => void;
  avatarSeed: string;
  subtitle?: string;
  groups: PanelGroup[];
  onClose: () => void;
};

const InlineText = ({
  value,
  placeholder,
  type,
  onCommit,
}: {
  value: string;
  placeholder?: string;
  type: "text" | "number";
  onCommit: (value: string) => void;
}) => {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <input
      className={styles.inlineInput}
      type={type}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => draft !== value && onCommit(draft)}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setDraft(value);
      }}
    />
  );
};

export const RecordPanel = ({
  title,
  titlePlaceholder = "Untitled",
  onTitleCommit,
  avatarSeed,
  subtitle,
  groups,
  onClose,
}: RecordPanelProps) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleGroup = (label: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });

  return (
    <aside className={styles.panel}>
      <header className={styles.header}>
        <span className={styles.headerChip}>
          <Avatar placeholder={title || titlePlaceholder} placeholderColorSeed={avatarSeed} size="sm" type="squared" />
          {onTitleCommit ? (
            <InlineText value={title} placeholder={titlePlaceholder} type="text" onCommit={onTitleCommit} />
          ) : (
            <span className={styles.headerTitle}>{title || titlePlaceholder}</span>
          )}
        </span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        <LightIconButton Icon={IconX} size="small" accent="tertiary" onClick={onClose} />
      </header>

      <div className={styles.body}>
        <div className={styles.fieldsTitle}>Fields</div>
        {groups.map((group) => {
          const isCollapsed = collapsed.has(group.label);
          return (
            <section key={group.label} className={styles.group}>
              <button
                type="button"
                className={styles.groupHeader}
                onClick={() => toggleGroup(group.label)}
              >
                {group.label}
                {isCollapsed ? <IconChevronDown size={14} /> : <IconChevronUp size={14} />}
              </button>
              {!isCollapsed &&
                group.fields.map((field) => (
                  <div key={field.key} className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>
                      {field.Icon && <field.Icon size={14} />}
                      {field.label}
                    </span>
                    <span className={styles.fieldValue}>
                      {field.kind === "readonly" ? (
                        field.content
                      ) : field.kind === "select" ? (
                        <Dropdown
                          width={200}
                          trigger={
                            <button type="button" className={styles.selectTrigger}>
                              {field.options.find((o) => o.id === field.value)?.label ?? (
                                <span className={styles.placeholder}>Select…</span>
                              )}
                            </button>
                          }
                        >
                          {(close) =>
                            field.options.map((option) => (
                              <MenuItemSelect
                                key={option.id}
                                text={option.label}
                                selected={option.id === field.value}
                                onClick={() => {
                                  field.onCommit(option.id);
                                  close();
                                }}
                              />
                            ))
                          }
                        </Dropdown>
                      ) : (
                        <InlineText
                          value={field.value}
                          placeholder={field.placeholder ?? field.label}
                          type={field.kind}
                          onCommit={field.onCommit}
                        />
                      )}
                    </span>
                  </div>
                ))}
            </section>
          );
        })}
      </div>
    </aside>
  );
};
