import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  IconCalendar,
  IconCheck,
  IconPlus,
  IconProgressCheck,
  IconSunOff,
  IconUser,
  IconX,
} from "@tabler/icons-react";

import { api } from "@convex/api";
import { Avatar } from "@ui/data-display/Avatar/Avatar";
import { Banner } from "@ui/feedback/Banner/Banner";
import { Modal } from "@ui/surfaces/Modal/Modal";
import { ProgressBar } from "@ui/feedback/ProgressBar/ProgressBar";
import { Tag } from "@ui/data-display/Tag/Tag";
import { Button } from "@ui/input/Button/Button";
import { H2Title } from "@ui/typography/H2Title/H2Title";

import { PageHeader } from "@/components/page/PageHeader";
import { PageLoading, PageUnseeded } from "@/components/PageState";
import { RecordTable, type RecordColumn } from "@/components/table/RecordTable";
import { SelectField, TextField } from "@/components/form/Field";

import pageStyles from "@/components/pageStyles.module.scss";
import formStyles from "../board/NewMovementModal.module.scss";
import styles from "./LeavePage.module.scss";

type BalanceRow = {
  staffId: string;
  name: string;
  role: string;
  allowed: number;
  taken: number;
  remaining: number;
};

type RequestRow = {
  id: string;
  staffName: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  conflict: string | null;
};

const REQ_COLOR: Record<string, "orange" | "green" | "gray" | "red"> = {
  proposed: "orange",
  approved: "green",
  taken: "green",
  locked: "gray",
  cancelled: "gray",
};

const YEAR = new Date().getFullYear();

export const LeavePage = () => {
  const data = useQuery(api.leave.board, { year: YEAR });
  const request = useMutation(api.leave.request);
  const decide = useMutation(api.leave.decide);

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [staffId, setStaffId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  if (data === undefined) return <PageLoading label="Loading leave…" />;
  if (data === null) return <PageUnseeded />;

  const submit = async () => {
    if (staffId === "") return setError("Pick a staff member.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return setError("Dates must be YYYY-MM-DD.");
    }
    setError(null);
    try {
      const res = await request({
        staffId,
        startDate,
        endDate,
        reason: reason || undefined,
      });
      setWarning(res.warning);
      setIsNewOpen(false);
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Failed.";
      setError(raw.match(/Uncaught Error: (.*?)(?: at handler|$)/)?.[1] ?? raw);
    }
  };

  const balanceColumns: RecordColumn<BalanceRow>[] = [
    {
      key: "name",
      label: "Staff",
      Icon: IconUser,
      width: 200,
      render: (r) => (
        <span className={pageStyles.recordChip}>
          <Avatar placeholder={r.name} placeholderColorSeed={r.staffId} size="sm" type="rounded" />
          <span className={pageStyles.recordName}>{r.name}</span>
          <Tag color="gray" text={r.role} />
        </span>
      ),
    },
    {
      key: "allowed",
      label: "Allowed",
      width: 80,
      render: (r) => <span className={pageStyles.num}>{r.allowed}</span>,
    },
    {
      key: "taken",
      label: "Taken",
      width: 80,
      render: (r) => <span className={pageStyles.num}>{r.taken}</span>,
    },
    {
      key: "remaining",
      label: "Remaining",
      width: 220,
      render: (r) => (
        <span className={styles.balanceCell}>
          <span className={pageStyles.num}>{r.remaining}</span>
          <span className={styles.balanceBar}>
            <ProgressBar value={r.allowed === 0 ? 0 : (r.taken / r.allowed) * 100} />
          </span>
        </span>
      ),
    },
  ];

  const requestColumns: RecordColumn<RequestRow>[] = [
    {
      key: "staff",
      label: "Staff",
      Icon: IconUser,
      width: 170,
      render: (r) => <span className={pageStyles.recordName}>{r.staffName}</span>,
    },
    {
      key: "dates",
      label: "Dates",
      Icon: IconCalendar,
      width: 190,
      render: (r) => (
        <span className={pageStyles.num}>
          {r.startDate} → {r.endDate}
        </span>
      ),
    },
    {
      key: "days",
      label: "Days",
      width: 60,
      render: (r) => <span className={pageStyles.num}>{r.days}</span>,
    },
    {
      key: "status",
      label: "Status",
      Icon: IconProgressCheck,
      width: 110,
      render: (r) => <Tag color={REQ_COLOR[r.status] ?? "gray"} text={r.status} />,
    },
    {
      key: "conflict",
      label: "Coverage",
      width: 240,
      isEmpty: (r) => r.conflict === null,
      render: (r) =>
        r.conflict ? (
          <Tag color="red" text={r.conflict} />
        ) : (
          <Tag color="green" text="ok" />
        ),
    },
    {
      key: "decide",
      label: "",
      width: 120,
      render: (r) =>
        r.status === "proposed" ? (
          <span className={pageStyles.tagRow}>
            <Button
              type="button"
              title="Approve"
              Icon={IconCheck}
              variant="primary"
              accent="blue"
              size="small"
              onClick={() => void decide({ requestId: r.id, approve: true })}
            />
            <Button
              type="button"
              title=""
              Icon={IconX}
              variant="secondary"
              size="small"
              onClick={() => void decide({ requestId: r.id, approve: false })}
            />
          </span>
        ) : null,
    },
  ];

  return (
    <div className={pageStyles.page}>
      <PageHeader
        Icon={IconSunOff}
        title="Leave"
        actions={
          <Button
            type="button"
            title="New request"
            Icon={IconPlus}
            variant="primary"
            accent="blue"
            size="small"
            onClick={() => setIsNewOpen(true)}
          />
        }
      />
      {warning && (
        <Banner color="blue">
          <span className={pageStyles.bannerText}>Coverage warning: {warning}</span>
        </Banner>
      )}
      <div className={styles.scroll}>
        <div className={pageStyles.section}>
          <H2Title title={`Balances ${YEAR}`} description="Remaining is always allowed − taken" />
        </div>
        <RecordTable
          columns={balanceColumns}
          rows={data.balances as BalanceRow[]}
          rowKey={(r) => r.staffId}
          emptyText="No active staff."
        />
        <div className={pageStyles.section}>
          <H2Title title="Requests" description="Coverage-checked at request time" />
        </div>
        <RecordTable
          columns={requestColumns}
          rows={data.requests as RequestRow[]}
          rowKey={(r) => r.id}
          rowClassName={(r) => (r.conflict ? pageStyles.dangerRow : undefined)}
          onAddNew={() => setIsNewOpen(true)}
          emptyText="No leave requests yet."
        />
      </div>
      {isNewOpen && (
        <Modal isOpen size="medium" ariaLabel="New leave request">
          <div className={formStyles.body}>
            <H2Title title="New leave request" description="Checked against balance + coverage" />
            <div className={formStyles.grid}>
              <SelectField label="Staff" value={staffId} options={data.staffOptions} onChange={setStaffId} />
              <div />
              <TextField label="Start (YYYY-MM-DD)" value={startDate} onChange={setStartDate} placeholder="2026-08-01" />
              <TextField label="End (YYYY-MM-DD)" value={endDate} onChange={setEndDate} placeholder="2026-08-14" />
              <TextField label="Reason (optional)" value={reason} onChange={setReason} />
            </div>
            {error && <div className={formStyles.error}>{error}</div>}
            <div className={formStyles.actions}>
              <Button type="button" title="Cancel" variant="secondary" onClick={() => setIsNewOpen(false)} />
              <Button type="button" title="Request" variant="primary" accent="blue" onClick={() => void submit()} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
