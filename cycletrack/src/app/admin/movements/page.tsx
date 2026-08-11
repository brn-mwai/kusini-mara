"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Funnel } from "@phosphor-icons/react";
import { Toolbar } from "@/app/components/data-table";
import { FilterChip, PageHeader, SegmentedControl } from "@/app/components/ui";
import { MovementsTable } from "@/app/components/movements-table";
import { EVENT_LABEL } from "@/lib/format";

const TYPE_OPTIONS = Object.entries(EVENT_LABEL).map(([value, label]) => ({
  value,
  label,
}));

export default function AdminMovements() {
  const [scope, setScope] = useState<"all" | "custody" | "battery">("all");
  const [types, setTypes] = useState<string[]>([]);
  const [subject, setSubject] = useState("");

  const rows = useQuery(api.trail.movements, {
    scope,
    subject: subject.trim() || undefined,
    limit: 300,
  });

  const filtered = rows?.filter(
    (r) => types.length === 0 || types.includes(r.type),
  );

  return (
    <div>
      <PageHeader
        title="Movements"
        subtitle="One feed across custody and unit events, newest first"
      />
      <MovementsTable
        rows={filtered}
        toolbar={
          <Toolbar
            search={subject}
            onSearch={setSubject}
            count={filtered?.length}
            countLabel="events"
            viewToggle={
              <SegmentedControl
                ariaLabel="Event scope"
                options={[
                  { value: "all", label: "All" },
                  { value: "custody", label: "Custody" },
                  { value: "battery", label: "Unit" },
                ]}
                value={scope}
                onChange={setScope}
              />
            }
          >
            <FilterChip
              label="Event type"
              icon={Funnel}
              options={TYPE_OPTIONS}
              selected={types}
              onToggle={(v) =>
                setTypes((s) =>
                  s.includes(v) ? s.filter((x) => x !== v) : [...s, v],
                )
              }
              onClear={() => setTypes([])}
            />
          </Toolbar>
        }
      />
    </div>
  );
}
