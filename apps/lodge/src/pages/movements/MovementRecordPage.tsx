import { Link, useNavigate, useParams } from "react-router-dom";
import { IconTimelineEvent } from "@tabler/icons-react";

import { TintedIconTile } from "@ui/data-display/TintedIconTile/TintedIconTile";
import { TabButton } from "@ui/input/TabButton/TabButton";

import { PageLoading } from "@/components/PageState";
import { RecordPanel, TimelineList } from "@/components/record/RecordPanel";
import { getObjectDef } from "@/objects/registry";

import { useMovementRecord } from "./useMovementRecord";
import styles from "./MovementRecordPage.module.scss";

const movementDef = getObjectDef("movement");

export const MovementRecordPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selected, panelGroups, relatedSections, timelineItems, updateMovement } =
    useMovementRecord(id ?? null);

  if (selected === undefined) return <PageLoading label="Loading record…" />;
  if (selected === null) return <PageLoading label="Record not found." />;

  const addedAgo = () => {
    const hours = Math.round((Date.now() - selected.createdAt) / 3600_000);
    if (hours < 1) return "Added just now";
    if (hours < 24) return `Added ${hours}h ago`;
    return `Added ${Math.round(hours / 24)} days ago`;
  };

  return (
    <div className={styles.page}>
      <header className={styles.breadcrumb}>
        <Link to="/today" className={styles.breadcrumbLink}>
          {movementDef.labelPlural}
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>
          {selected.guestName || "Untitled"}
        </span>
      </header>

      <div className={styles.columns}>
        <div className={styles.summaryColumn}>
          <div className={styles.identity}>
            <TintedIconTile Icon={movementDef.Icon} color={movementDef.color} size={40} />
            <h1 className={styles.recordTitle}>{selected.guestName || "Untitled"}</h1>
            <span className={styles.recordMeta}>{addedAgo()}</span>
          </div>
          <RecordPanel
            embedded
            title={selected.guestName}
            onTitleCommit={(v) => void updateMovement({ id: selected.id, guestName: v })}
            avatarSeed={selected.id}
            groups={panelGroups}
            related={relatedSections}
            recordId={selected.id}
            onClose={() => navigate(-1)}
          />
        </div>

        <div className={styles.activityColumn}>
          <div className={styles.activityTabs}>
            <TabButton
              id="record-tab-timeline"
              title="Timeline"
              LeftIcon={IconTimelineEvent}
              active
            />
          </div>
          <div className={styles.activityBody}>
            <TimelineList items={timelineItems} />
          </div>
        </div>
      </div>
    </div>
  );
};
