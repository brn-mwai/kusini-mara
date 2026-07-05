import { useMutation, useQuery } from "convex/react";
import {
  IconBuildingSkyscraper,
  IconCalendarTime,
  IconPlaneTilt,
  IconProgressCheck,
  IconUsers,
} from "@tabler/icons-react";

import { api } from "@convex/api";
import { Tag } from "@ui/data-display/Tag/Tag";

import { getObjectDef } from "@/objects/registry";
import {
  type PanelGroup,
  type PanelRelatedSection,
  type PanelTimelineItem,
} from "@/components/record/RecordPanel";

const movementDef = getObjectDef("movement");
const optionOf = (fieldName: string, value: string) =>
  movementDef.field(fieldName)?.options?.find((o) => o.value === value);

const TIMELINE_LABEL: Record<string, string> = {
  posted: "posted this movement",
  acknowledged: "acknowledged the movement",
  duty_assigned: "assigned the ground duty",
  arrival_reprotected: "re-protected the transfer",
  escalation_fired: "escalated — no acknowledgment in time",
};

const toLocalInput = (ms: number | null) => {
  if (ms === null) return "";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const useMovementRecord = (id: string | null) => {
  const selected = useQuery(api.movements.get, id === null ? "skip" : { id });
  const selectedTimeline = useQuery(
    api.movements.timeline,
    id === null ? "skip" : { id },
  );
  const updateMovement = useMutation(api.movements.update);

  const timelineItems: PanelTimelineItem[] = (selectedTimeline?.items ?? []).map(
    (item: { id: string; action: string; actor: string | null; at: number }) => ({
      id: item.id,
      label: TIMELINE_LABEL[item.action] ?? item.action.replace(/_/g, " "),
      actor: item.actor,
      at: item.at,
    }),
  );

  const relatedSections: PanelRelatedSection[] = selected
    ? [
        {
          label: "Guests",
          items: selected.guestNames.map((name: string, i: number) => ({
            id: `${i}`,
            label: name,
          })),
        },
        {
          label: "Ground",
          items: [
            ...(selected.dutyStaffName
              ? [{ id: "staff", label: selected.dutyStaffName }]
              : []),
            ...(selected.dutyVehicleName
              ? [{ id: "vehicle", label: selected.dutyVehicleName }]
              : []),
          ],
        },
      ]
    : [];

  const panelGroups: PanelGroup[] = selected
    ? [
        {
          label: "General",
          fields: [
            {
              kind: "number",
              key: "pax",
              label: "Pax",
              Icon: IconUsers,
              value: String(selected.partySize),
              onCommit: (v) =>
                void updateMovement({ id: selected.id, partySize: Number(v) || 1 }),
            },
            {
              kind: "select",
              key: "direction",
              label: "Direction",
              Icon: IconPlaneTilt,
              value: selected.direction,
              options: (movementDef.field("direction")?.options ?? []).map((o) => ({
                id: o.value,
                label: o.label,
              })),
              onCommit: (v) =>
                void updateMovement({
                  id: selected.id,
                  direction: v as "arrival" | "departure",
                }),
            },
            {
              kind: "select",
              key: "mode",
              label: "Mode",
              value: selected.mode,
              options: (movementDef.field("mode")?.options ?? []).map((o) => ({
                id: o.value,
                label: o.label,
              })),
              onCommit: (v) =>
                void updateMovement({
                  id: selected.id,
                  mode: v as
                    | "charter"
                    | "scheduled_flight"
                    | "helicopter"
                    | "road_transfer"
                    | "self_drive"
                    | "self_fly",
                }),
            },
          ],
        },
        {
          label: "Transfer",
          fields: [
            {
              kind: "text",
              key: "carrier",
              label: "Carrier",
              Icon: IconBuildingSkyscraper,
              value: selected.carrierName,
              placeholder: "Safarilink",
              onCommit: (v) => void updateMovement({ id: selected.id, carrierName: v }),
            },
            {
              kind: "text",
              key: "time",
              label: "Time",
              Icon: IconCalendarTime,
              value: toLocalInput(selected.scheduledTime),
              placeholder: "2026-07-05T11:00",
              onCommit: (v) => {
                const ms = new Date(v).getTime();
                if (!Number.isNaN(ms))
                  void updateMovement({ id: selected.id, scheduledTime: ms });
              },
            },
          ],
        },
        {
          label: "System",
          fields: [
            {
              kind: "readonly",
              key: "status",
              label: "Status",
              Icon: IconProgressCheck,
              content: (
                <Tag
                  color={
                    (optionOf("status", selected.status)?.color as
                      | "red"
                      | "orange"
                      | "green"
                      | "blue"
                      | "gray") ?? "gray"
                  }
                  text={optionOf("status", selected.status)?.label ?? selected.status}
                />
              ),
            },
          ],
        },
      ]
    : [];

  return { selected, panelGroups, relatedSections, timelineItems, updateMovement };
};
