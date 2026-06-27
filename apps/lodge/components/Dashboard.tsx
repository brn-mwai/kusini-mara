"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  Shell,
  Stat,
  Panel,
  Pill,
  Btn,
  Modal,
  Field,
  EmptyState,
  DataTable,
  useToast,
  fmt,
  type NavSection,
  type CmdItem,
  type PillTone,
} from "@/uikit";

type Me = {
  name: string;
  role: string;
  org: { name: string; type: "airline" | "lodge"; shortCode: string };
};

const NAV: NavSection[] = [
  {
    sec: "Operations",
    items: [
      { key: "today", label: "Today", icon: "ph-house" },
      { key: "arrivals", label: "Arrivals", icon: "ph-airplane-landing" },
      { key: "departures", label: "Departures", icon: "ph-airplane-takeoff" },
      { key: "bookings", label: "Bookings", icon: "ph-calendar-check" },
    ],
  },
  {
    sec: "Workforce",
    items: [
      { key: "duties", label: "Duties", icon: "ph-clipboard-text" },
      { key: "staff", label: "Staff", icon: "ph-users-three" },
    ],
  },
  { sec: "Insights", items: [{ key: "reports", label: "Reports", icon: "ph-chart-bar" }] },
];

const TITLES: Record<string, string> = {
  today: "Today",
  arrivals: "Arrivals",
  departures: "Departures",
  bookings: "Bookings",
  duties: "Duties",
  staff: "Staff",
  reports: "Reports",
  notifications: "Notifications",
  settings: "Settings",
};

function moveStatus(m: any): [PillTone, string, string] {
  if (m.status === "requested") return ["mut", "ph-clock-countdown", "Awaiting flight"];
  if (m.status === "completed" || m.status === "landed") return ["mut", "ph-check", "Completed"];
  if (m.status === "in_flight") return ["info", "ph-airplane-in-flight", "In flight"];
  if (m.status === "escalated") return ["risk", "ph-warning", "Escalated"];
  if (m.status === "acknowledged")
    return m.reconfirmRequested
      ? ["warn", "ph-arrows-clockwise", "Reconfirm"]
      : ["ok", "ph-check", "Confirmed"];
  if (m.status === "scheduled")
    return m.reconfirmRequested
      ? ["warn", "ph-arrows-clockwise", "Reconfirm"]
      : ["warn", "ph-bell-ringing", "Awaiting ack"];
  return ["mut", "ph-question", m.status];
}

function canAck(m: any): boolean {
  return (m.status === "scheduled" || m.status === "escalated") && !!m.flightId;
}

export function Dashboard({ me }: { me: Me }) {
  const [view, setView] = useState("today");
  const board = useQuery(api.movements.board, {}) ?? [];
  const notifs = useQuery(api.notifications.list, { app: "lodge" }) ?? [];

  const today = board.filter((m: any) => fmt.isToday(m.scheduledTime));
  const needAck = today.filter((m: any) => canAck(m)).length;
  const escal = board.filter((m: any) => m.status === "escalated").length;

  const paletteItems: CmdItem[] = useMemo(() => {
    const navCmds: CmdItem[] = Object.keys(TITLES).map((k) => ({
      id: "nav-" + k,
      label: TITLES[k] ?? k,
      icon: NAV.flatMap((s) => s.items).find((i) => i.key === k)?.icon ?? "ph-arrow-right",
      section: "Navigate",
      run: () => setView(k),
    }));
    const moveCmds: CmdItem[] = board.map((m: any) => ({
      id: "mv-" + m._id,
      label: `${m.guestName} · ${m.direction} · ${m.airstrip}`,
      icon: m.direction === "arrival" ? "ph-airplane-landing" : "ph-airplane-takeoff",
      section: "Transfers",
      sub: m.flight?.reg ?? "no flight",
      run: () => setView(m.direction === "arrival" ? "arrivals" : "departures"),
    }));
    return [...navCmds, ...moveCmds];
  }, [board]);

  return (
    <Shell
      appName="Kusini Lodge"
      shortCode={me.org.shortCode}
      navSections={NAV.map((s) => ({
        ...s,
        items: s.items.map((i) =>
          i.key === "today" && needAck ? { ...i, badge: needAck } : i,
        ),
      }))}
      recents={[
        { code: "5Y-BMF", label: "Ol Kiombo" },
        { code: "5Y-CAC", label: "Keekorok" },
      ]}
      activePage={view}
      crumbPage={TITLES[view] ?? "Today"}
      onNavigate={setView}
      user={{ name: me.name, sub: `${me.role} · ${me.org.name}`, initials: fmt.initials(me.name) }}
      pilot={{ icon: "ph-flag-banner", label: "Pilot progress", fill: 50, meta: "Week 6 of 12 · midpoint review" }}
      bellBadge={escal + needAck || undefined}
      paletteItems={paletteItems}
    >
      {(view === "today" || view === "arrivals" || view === "departures") && (
        <BoardView
          view={view}
          rows={
            view === "today"
              ? today
              : board.filter((m: any) => m.direction === (view === "arrivals" ? "arrival" : "departure"))
          }
          me={me}
        />
      )}
      {view === "bookings" && <BookingsView />}
      {view === "duties" && <DutiesView />}
      {view === "staff" && <StaffView />}
      {view === "reports" && <ReportsView board={board} />}
      {view === "notifications" && <NotificationsView notifs={notifs} />}
      {view === "settings" && <SettingsView me={me} />}
    </Shell>
  );
}

// ── Board (Today / Arrivals / Departures) ─────────────────────────────────────
function BoardView({ view, rows, me }: { view: string; rows: any[]; me: Me }) {
  const acknowledge = useMutation(api.movements.acknowledge);
  const toast = useToast();
  const [assignFor, setAssignFor] = useState<any | null>(null);

  const confirmed = rows.filter((m) => m.status === "acknowledged").length;
  const awaiting = rows.filter((m) => canAck(m)).length;
  const escalated = rows.filter((m) => m.status === "escalated").length;

  const onAck = async (m: any) => {
    try {
      await acknowledge({ movementId: m._id });
      toast(`Acknowledged ${m.guestName}`, "ph-check-circle");
    } catch (e: any) {
      toast(e.message ?? "Failed", "ph-warning");
    }
  };

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{TITLES[view]}</h1>
          <p className="page-subtitle">
            {me.org.name} · <span className="clock">{rows.length} movements</span>
          </p>
        </div>
      </div>

      <div className="stats">
        <Stat icon="ph-bell-ringing" tone="amber" label="Awaiting acknowledgment" value={awaiting} sub="confirm to close the loop" />
        <Stat icon="ph-check-circle" tone="green" label="Confirmed" value={confirmed} sub="lodge acknowledged" />
        <Stat icon="ph-warning" tone="red" label="Escalated" value={escalated} sub="unacknowledged in window" />
        <Stat icon="ph-airplane" tone="blue" label="Total today" value={rows.length} sub="arrivals + departures" />
      </div>

      <DataTable<any>
        rows={rows}
        noun="movement"
        getRowKey={(m) => m._id}
        searchText={(m) => `${m.guestName} ${m.airstrip} ${m.flight?.reg ?? ""} ${m.flight?.code ?? ""}`}
        searchPlaceholder="Search guest, airstrip, tail…"
        rowClassName={(m) => (m.status === "escalated" ? "esc" : canAck(m) ? "attn" : "")}
        empty={{ icon: "ph-airplane", title: "No movements in this view." }}
        columns={[
          {
            key: "flight", label: "Flight",
            render: (m) => (<><div className="flt mono">{m.flight?.reg ?? "—"}</div><div className="reg">{m.flight?.code ?? "awaiting flight"}</div></>),
          },
          {
            key: "route", label: "Route",
            render: (m) => (<div className="route"><i className={`ph ${m.direction === "arrival" ? "ph-airplane-landing arr" : "ph-airplane-takeoff dep"}`} /><span>{m.airstrip}</span></div>),
          },
          {
            key: "guest", label: "Guest",
            render: (m) => (<><div className="flt">{m.guestName}</div><div className="reg">{m.pax} pax</div></>),
          },
          {
            key: "time", label: "Time",
            render: (m) => { const cd = fmt.countdown(m.scheduledTime); return (<><div className="eta mono">{fmt.hhmm(m.scheduledTime)}</div><div className={`cd ${cd.overdue ? "risk" : ""}`}>{cd.text}</div></>); },
          },
          {
            key: "status", label: "Status",
            render: (m) => { const [tone, icon, label] = moveStatus(m); return <Pill tone={tone} icon={icon}>{label}</Pill>; },
          },
          {
            key: "ground", label: "Ground",
            render: (m) => m.assignedStaff
              ? (<div className="assign"><span className="av">{fmt.initials(m.assignedStaff.name)}</span>{m.assignedStaff.name}</div>)
              : (<span className="reg">unassigned</span>),
          },
          {
            key: "act", label: "", align: "right",
            render: (m) => (
              <div className="row-actions">
                {canAck(m) && (
                  <button className="ackbtn" onClick={() => onAck(m)}>
                    <i className="ph ph-check" />{m.reconfirmRequested ? "Reconfirm" : "Acknowledge"}
                  </button>
                )}
                <Btn icon="ph-user-plus" onClick={() => setAssignFor(m)}>Assign</Btn>
              </div>
            ),
          },
        ]}
      />

      {assignFor && <AssignModal movement={assignFor} onClose={() => setAssignFor(null)} />}
    </>
  );
}

function AssignModal({ movement, onClose }: { movement: any; onClose: () => void }) {
  const staff = useQuery(api.staff.list, {}) ?? [];
  const assign = useMutation(api.duties.assign);
  const toast = useToast();
  const [staffId, setStaffId] = useState<string>("");

  const submit = async () => {
    if (!staffId) return;
    await assign({ movementId: movement._id, staffId: staffId as Id<"staff"> });
    toast(`Assigned to ${movement.guestName}`, "ph-user-check");
    onClose();
  };

  return (
    <Modal
      title={`Assign ground staff · ${movement.guestName}`}
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" icon="ph-check" onClick={submit}>Assign</Btn>
        </>
      }
    >
      <Field label="Staff member">
        <select value={staffId} onChange={(e) => setStaffId(e.target.value)}>
          <option value="">Select…</option>
          {staff.map((s: any) => (
            <option key={s._id} value={s._id}>
              {s.name} — {s.role}
            </option>
          ))}
        </select>
      </Field>
      <p className="reg" style={{ marginTop: 8 }}>
        {movement.direction === "arrival" ? "Pickup" : "Drop-off"} at {movement.airstrip} ·{" "}
        {fmt.hhmm(movement.scheduledTime)}
      </p>
    </Modal>
  );
}

// ── Bookings ──────────────────────────────────────────────────────────────────
function BookingsView() {
  const bookings = useQuery(api.bookings.list, {}) ?? [];
  const create = useMutation(api.bookings.create);
  const toast = useToast();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">Each booking spawns an arrival and a departure movement</p>
        </div>
        <div className="header-actions">
          <Btn variant="primary" icon="ph-plus" onClick={() => setOpen(true)}>Add booking</Btn>
        </div>
      </div>
      <Panel title="Bookings" desc="Thin references from the PMS">
        {bookings.length === 0 ? (
          <EmptyState icon="ph-calendar-x">No bookings yet.</EmptyState>
        ) : (
          <table>
            <thead>
              <tr><th>Ref</th><th>Guest</th><th>Pax</th><th>Arrival</th><th>Departure</th></tr>
            </thead>
            <tbody>
              {bookings.map((b: any) => (
                <tr key={b._id}>
                  <td className="mono">{b.externalRef}</td>
                  <td className="flt">{b.guest}</td>
                  <td>{b.pax}</td>
                  <td>{b.arrivalAirstrip} · {fmt.dayLabel(b.arrivalDate)}</td>
                  <td>{b.departureAirstrip} · {fmt.dayLabel(b.departureDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
      {open && (
        <AddBookingModal
          onClose={() => setOpen(false)}
          onCreate={async (vals) => {
            await create(vals);
            toast("Booking added — two movements created", "ph-calendar-check");
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

function AddBookingModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (v: any) => Promise<void>;
}) {
  const [guest, setGuest] = useState("");
  const [pax, setPax] = useState(2);
  const [ref, setRef] = useState("");
  const [arrStrip, setArrStrip] = useState("Ol Kiombo");
  const [depStrip, setDepStrip] = useState("Ol Kiombo");
  const day = 86400000;
  const now = Date.now();

  const submit = () =>
    onCreate({
      guest,
      pax,
      externalRef: ref || `BK-${Math.floor(now / 1000) % 100000}`,
      arrivalDate: now + day,
      departureDate: now + 4 * day,
      arrivalAirstrip: arrStrip,
      departureAirstrip: depStrip,
    });

  const strips = ["Ol Kiombo", "Keekorok", "Musiara", "Wilson", "Mara North"];
  return (
    <Modal
      title="Add booking"
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" icon="ph-check" onClick={submit}>Create</Btn>
        </>
      }
    >
      <Field label="Guest name">
        <input value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="e.g. Okafor" />
      </Field>
      <Field label="Pax">
        <input type="number" min={1} value={pax} onChange={(e) => setPax(Number(e.target.value))} />
      </Field>
      <Field label="PMS reference">
        <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="RR-88300" />
      </Field>
      <Field label="Arrival airstrip">
        <select value={arrStrip} onChange={(e) => setArrStrip(e.target.value)}>
          {strips.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Departure airstrip">
        <select value={depStrip} onChange={(e) => setDepStrip(e.target.value)}>
          {strips.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Field>
    </Modal>
  );
}

// ── Duties ────────────────────────────────────────────────────────────────────
function DutiesView() {
  const duties = useQuery(api.duties.list, {}) ?? [];
  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Duties</h1>
          <p className="page-subtitle">Ground assignments for today’s transfers</p>
        </div>
      </div>
      <Panel title="Duty assignments">
        {duties.length === 0 ? (
          <EmptyState icon="ph-clipboard">No duties assigned yet.</EmptyState>
        ) : (
          <table>
            <thead>
              <tr><th>Staff</th><th>Guest</th><th>Airstrip</th><th>Type</th><th>Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {duties.map((d: any) => (
                <tr key={d._id}>
                  <td><div className="assign"><span className="av">{fmt.initials(d.staffName)}</span>{d.staffName}</div></td>
                  <td className="flt">{d.guestName}</td>
                  <td>{d.airstrip}</td>
                  <td><span className="tag">{d.dutyType}</span></td>
                  <td className="mono">{d.scheduledTime ? fmt.hhmm(d.scheduledTime) : "—"}</td>
                  <td><Pill tone="info" icon="ph-user-check">{d.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}

// ── Staff ─────────────────────────────────────────────────────────────────────
function StaffView() {
  const staff = useQuery(api.staff.list, {}) ?? [];
  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Staff</h1>
          <p className="page-subtitle">Lodge workforce register</p>
        </div>
      </div>
      <Panel title="Team">
        <table>
          <thead>
            <tr><th>Name</th><th>Role</th><th>Phone</th><th>Languages</th><th>Leave balance</th></tr>
          </thead>
          <tbody>
            {staff.map((s: any) => (
              <tr key={s._id}>
                <td className="flt">{s.name}</td>
                <td>{s.role}</td>
                <td className="mono">{s.phone}</td>
                <td>{s.languages.map((l: string) => <span className="tag" key={l}>{l}</span>)}</td>
                <td className="mono">{s.leaveBalance}/{s.entitlementDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </>
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────
function ReportsView({ board }: { board: any[] }) {
  const total = board.length;
  const acked = board.filter((m) => m.status === "acknowledged" || m.status === "completed").length;
  const esc = board.filter((m) => m.status === "escalated").length;
  const rate = total ? Math.round((acked / total) * 100) : 0;
  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Acknowledgment performance</p>
        </div>
      </div>
      <div className="stats">
        <Stat icon="ph-check-circle" tone="green" label="Acknowledgment rate" value={`${rate}%`} />
        <Stat icon="ph-airplane" tone="blue" label="Movements" value={total} />
        <Stat icon="ph-warning" tone="red" label="Escalations" value={esc} />
        <Stat icon="ph-clock" tone="amber" label="Open" value={board.filter((m) => canAck(m)).length} />
      </div>
    </>
  );
}

// ── Notifications ─────────────────────────────────────────────────────────────
function NotificationsView({ notifs }: { notifs: any[] }) {
  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">Escalations and nudges — SMS backbone</p>
        </div>
      </div>
      <Panel title="Notification log">
        {notifs.length === 0 ? (
          <EmptyState icon="ph-bell-slash">No notifications.</EmptyState>
        ) : (
          <div className="feed">
            {notifs.map((n: any) => (
              <div className="fitem" key={n._id}>
                <div className="fi" style={{ background: "var(--risk-bg)", color: "var(--risk-fg)" }}>
                  <i className="ph ph-warning" />
                </div>
                <div className="ft">
                  {n.body}
                  <div className="tm">
                    {fmt.hhmm(n.at)} · {n.channel} · {n.delivered ? "delivered" : "logged (mock)"} · to {n.toPhone ?? "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}

// ── Settings ──────────────────────────────────────────────────────────────────
function SettingsView({ me }: { me: Me }) {
  return (
    <>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Organization & account</p>
        </div>
      </div>
      <Panel title="Organization">
        <div className="setrow"><div><div className="setk">Lodge</div><div className="setv">{me.org.name}</div></div></div>
        <div className="setrow"><div><div className="setk">Your role</div><div className="setv">{me.role}</div></div></div>
        <div className="setrow"><div><div className="setk">Tenant isolation</div><div className="setv">Enforced in code — you can only see {me.org.name}’s data.</div></div></div>
      </Panel>
    </>
  );
}
