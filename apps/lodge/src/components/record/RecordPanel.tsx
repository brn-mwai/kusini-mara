import { useEffect, useState, type ReactNode } from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconHome,
  IconPlus,
  IconTimelineEvent,
  IconX,
} from "@tabler/icons-react";

import { Avatar } from "@ui/data-display/Avatar/Avatar";
import { Chip, ChipVariant } from "@ui/data-display/Chip/Chip";
import { Button } from "@ui/input/Button/Button";
import { LightIconButton } from "@ui/input/LightIconButton/LightIconButton";
import { TabButton } from "@ui/input/TabButton/TabButton";
import { MenuItem } from "@ui/navigation/MenuItem/MenuItem";
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

export type PanelRelatedSection = {
  label: string;
  items: { id: string; label: string }[];
  onAdd?: () => void;
};

export type PanelTimelineItem = {
  id: string;
  label: string;
  actor?: string | null;
  at: number;
};

type RecordPanelProps = {
  title: string;
  titlePlaceholder?: string;
  onTitleCommit?: (value: string) => void;
  avatarSeed: string;
  subtitle?: string;
  groups: PanelGroup[];
  related?: PanelRelatedSection[];
  timeline?: PanelTimelineItem[];
  recordId?: string;
  onClose: () => void;
};

const timeAgo = (ms: number) => {
  const mins = Math.round((Date.now() - ms) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `about ${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const monthLabel = (ms: number) =>
  new Date(ms).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

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
  related = [],
  timeline,
  recordId,
  onClose,
}: RecordPanelProps) => {
  const [tab, setTab] = useState<"home" | "timeline">("home");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [wide, setWide] = useState(false);

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
    <aside className={styles.panel} data-wide={wide || undefined}>
      <header className={styles.header}>
        <span className={styles.headerChip}>
          <Avatar
            placeholder={title || titlePlaceholder}
            placeholderColorSeed={avatarSeed}
            size="sm"
            type="squared"
          />
          {onTitleCommit ? (
            <InlineText value={title} placeholder={titlePlaceholder} type="text" onCommit={onTitleCommit} />
          ) : (
            <span className={styles.headerTitle}>{title || titlePlaceholder}</span>
          )}
        </span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        <LightIconButton Icon={IconX} size="small" accent="tertiary" onClick={onClose} />
      </header>

      <div className={styles.tabsRow}>
        <TabButton
          id="panel-tab-home"
          title="Home"
          LeftIcon={IconHome}
          active={tab === "home"}
          onClick={() => setTab("home")}
        />
        {timeline !== undefined && (
          <TabButton
            id="panel-tab-timeline"
            title="Timeline"
            LeftIcon={IconTimelineEvent}
            active={tab === "timeline"}
            onClick={() => setTab("timeline")}
          />
        )}
      </div>

      <div className={styles.body}>
        {tab === "home" && (
          <>
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

            {related.map((section) => (
              <section key={section.label} className={styles.relatedSection}>
                <div className={styles.relatedHeader}>
                  <span>{section.label}</span>
                  {section.onAdd && (
                    <LightIconButton Icon={IconPlus} size="small" accent="tertiary" onClick={section.onAdd} />
                  )}
                </div>
                <div className={styles.relatedItems}>
                  {section.items.map((item) => (
                    <Chip key={item.id} label={item.label} variant={ChipVariant.Static} />
                  ))}
                  {section.items.length === 0 && (
                    <span className={styles.placeholder}>None yet</span>
                  )}
                </div>
              </section>
            ))}
          </>
        )}

        {tab === "timeline" && timeline !== undefined && (
          <div className={styles.timeline}>
            {timeline.length > 0 && (
              <div className={styles.timelineMonth}>{monthLabel(timeline[0].at)}</div>
            )}
            {timeline.map((item, index) => (
              <div key={item.id} className={styles.timelineRow}>
                <div className={styles.timelineRail}>
                  <span className={styles.timelineIcon}>
                    <IconTimelineEvent size={12} />
                  </span>
                  {index < timeline.length - 1 && <span className={styles.timelineLine} />}
                </div>
                <div className={styles.timelineContent}>
                  <span className={styles.timelineText}>
                    {item.actor ? <strong>{item.actor}</strong> : "System"} {item.label}
                  </span>
                  <span className={styles.timelineTime}>{timeAgo(item.at)}</span>
                </div>
              </div>
            ))}
            {timeline.length === 0 && <span className={styles.placeholder}>No activity yet.</span>}
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <Dropdown
          width={180}
          trigger={
            <Button type="button" title="Options" variant="secondary" size="small" />
          }
        >
          {(close) => (
            <MenuItem
              text="Copy record ID"
              LeftIcon={IconCopy}
              onClick={() => {
                if (recordId) void navigator.clipboard.writeText(recordId);
                close();
              }}
            />
          )}
        </Dropdown>
        <Button
          type="button"
          title={wide ? "Collapse" : "Open"}
          variant="primary"
          accent="blue"
          size="small"
          onClick={() => setWide((w) => !w)}
        />
      </footer>
    </aside>
  );
};
