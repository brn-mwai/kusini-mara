import { useState } from "react";
import { useQuery } from "convex/react";
import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

import { api } from "@convex/api";
import { Tag } from "@ui/data-display/Tag/Tag";
import { LightIconButton } from "@ui/input/LightIconButton/LightIconButton";

import { PageHeader } from "@/components/page/PageHeader";
import { PageLoading, PageUnseeded } from "@/components/PageState";

import pageStyles from "@/components/pageStyles.module.scss";
import styles from "./CalendarPage.module.scss";

const KIND_COLOR: Record<string, "blue" | "orange" | "purple"> = {
  stay: "blue",
  leave: "orange",
  duty: "purple",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => String(n).padStart(2, "0");

export const CalendarPage = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const data = useQuery(api.calendarq.month, { year, month });

  if (data === undefined) return <PageLoading label="Loading calendar…" />;
  if (data === null) return <PageUnseeded />;

  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7; // Monday-first

  const cells: { date: string | null; day: number | null }[] = [
    ...Array.from({ length: leadingBlanks }, () => ({ date: null, day: null })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      date: `${year}-${pad(month)}-${pad(i + 1)}`,
      day: i + 1,
    })),
  ];

  const eventsOn = (date: string) =>
    data.events.filter((e) => e.startDate <= date && date <= e.endDate);

  const prev = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const todayIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  return (
    <div className={pageStyles.page}>
      <PageHeader
        Icon={IconCalendarEvent}
        title="Calendar"
        actions={
          <span className={styles.monthNav}>
            <LightIconButton Icon={IconChevronLeft} size="small" accent="tertiary" onClick={prev} />
            <span className={styles.monthLabel}>
              {MONTHS[month - 1]} {year}
            </span>
            <LightIconButton Icon={IconChevronRight} size="small" accent="tertiary" onClick={next} />
          </span>
        }
      />
      <div className={styles.legend}>
        <Tag color="blue" text="stays" />
        <Tag color="orange" text="leave" />
        <Tag color="purple" text="movements" />
      </div>
      <div className={styles.grid}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className={styles.dow}>
            {d}
          </div>
        ))}
        {cells.map((cell, i) =>
          cell.date === null ? (
            <div key={`blank-${i}`} className={styles.blank} />
          ) : (
            <div
              key={cell.date}
              className={cell.date === todayIso ? styles.today : styles.day}
            >
              <span className={styles.dayNum}>{cell.day}</span>
              <div className={styles.events}>
                {eventsOn(cell.date)
                  .slice(0, 3)
                  .map((e) => (
                    <Tag key={e.id} color={KIND_COLOR[e.kind]} text={e.title} />
                  ))}
                {eventsOn(cell.date).length > 3 && (
                  <span className={pageStyles.muted}>+{eventsOn(cell.date).length - 3}</span>
                )}
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
};
