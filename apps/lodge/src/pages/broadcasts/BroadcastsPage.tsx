import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  IconBroadcast,
  IconMessage,
  IconPlus,
  IconUsersGroup,
} from "@tabler/icons-react";

import { api } from "@convex/api";
import { Tag } from "@ui/data-display/Tag/Tag";
import { Modal } from "@ui/surfaces/Modal/Modal";
import { Button } from "@ui/input/Button/Button";
import { H2Title } from "@ui/typography/H2Title/H2Title";

import { PageHeader } from "@/components/page/PageHeader";
import { PageLoading, PageUnseeded } from "@/components/PageState";
import { RecordTable, type RecordColumn } from "@/components/table/RecordTable";
import { SelectField, TextField, FieldShell } from "@/components/form/Field";

import pageStyles from "@/components/pageStyles.module.scss";
import formStyles from "../board/NewMovementModal.module.scss";
import styles from "./BroadcastsPage.module.scss";

type BroadcastRow = {
  id: string;
  listName: string;
  channel: string;
  body: string;
  status: string;
  recipientCount: number;
  sentAt: number | null;
};

const CHANNELS = [
  { id: "sms", label: "SMS" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "push", label: "Push" },
];

const STATUS_COLOR: Record<string, "gray" | "orange" | "green" | "red"> = {
  draft: "gray",
  queued: "orange",
  sending: "orange",
  sent: "green",
  failed: "red",
};

const timeAgo = (ms: number | null) => {
  if (ms === null) return "—";
  const mins = Math.round((Date.now() - ms) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
};

export const BroadcastsPage = () => {
  const data = useQuery(api.broadcasts.board);
  const send = useMutation(api.broadcasts.send);

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [listId, setListId] = useState("");
  const [channel, setChannel] = useState("sms");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (data === undefined) return <PageLoading label="Loading broadcasts…" />;
  if (data === null) return <PageUnseeded />;

  const submit = async () => {
    if (listId === "") return setError("Pick a list.");
    if (body.trim() === "") return setError("Message is required.");
    setError(null);
    try {
      await send({
        listId,
        channel: channel as "sms" | "whatsapp" | "push" | "email",
        body,
      });
      setBody("");
      setIsComposeOpen(false);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Failed.";
      setError(raw.match(/Uncaught Error: (.*?)(?: at handler|$)/)?.[1] ?? raw);
    }
  };

  const columns: RecordColumn<BroadcastRow>[] = [
    {
      key: "list",
      label: "List",
      Icon: IconUsersGroup,
      width: 130,
      render: (r) => <Tag color="blue" text={r.listName} />,
    },
    {
      key: "body",
      label: "Message",
      Icon: IconMessage,
      width: 340,
      render: (r) => <span className={styles.body}>{r.body}</span>,
    },
    {
      key: "channel",
      label: "Channel",
      width: 90,
      render: (r) => <Tag color="gray" text={r.channel} />,
    },
    {
      key: "recipients",
      label: "Recipients",
      width: 90,
      render: (r) => <span className={pageStyles.num}>{r.recipientCount}</span>,
    },
    {
      key: "status",
      label: "Status",
      width: 90,
      render: (r) => <Tag color={STATUS_COLOR[r.status] ?? "gray"} text={r.status} />,
    },
    {
      key: "sent",
      label: "Sent",
      width: 100,
      render: (r) => <span className={pageStyles.muted}>{timeAgo(r.sentAt)}</span>,
    },
  ];

  return (
    <div className={pageStyles.page}>
      <PageHeader
        Icon={IconBroadcast}
        title="Broadcasts"
        actions={
          <Button
            type="button"
            title="Compose"
            Icon={IconPlus}
            variant="primary"
            accent="blue"
            size="small"
            onClick={() => setIsComposeOpen(true)}
          />
        }
      />
      <div className={styles.lists}>
        {data.lists.map((l) => (
          <Tag key={l.id} color="gray" text={`${l.name} · ${l.members}`} />
        ))}
      </div>
      <RecordTable
        columns={columns}
        rows={data.rows as BroadcastRow[]}
        rowKey={(r) => r.id}
        onAddNew={() => setIsComposeOpen(true)}
        emptyText="No broadcasts yet — message your drivers before the first pickup."
      />
      {isComposeOpen && (
        <Modal isOpen size="medium" ariaLabel="Compose broadcast">
          <div className={formStyles.body}>
            <H2Title title="Compose broadcast" description="One message, every phone on the list" />
            <div className={formStyles.grid}>
              <SelectField
                label="List"
                value={listId}
                options={data.lists.map((l) => ({ id: l.id, label: `${l.name} (${l.members})` }))}
                onChange={setListId}
              />
              <SelectField label="Channel" value={channel} options={CHANNELS} onChange={setChannel} />
            </div>
            <FieldShell label="Message">
              <textarea
                className={styles.textarea}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                placeholder="All drivers: guests for Okonkwo x7 must be at Ol Kiombo 30 mins early."
              />
            </FieldShell>
            {error && <div className={formStyles.error}>{error}</div>}
            <div className={formStyles.actions}>
              <Button type="button" title="Cancel" variant="secondary" onClick={() => setIsComposeOpen(false)} />
              <Button type="button" title="Send" variant="primary" accent="blue" onClick={() => void submit()} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
